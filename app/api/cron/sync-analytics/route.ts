import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const THREADS_API_BASE = "https://graph.threads.net/v1.0";
const CRON_SECRET = process.env.CRON_SECRET;

async function fetchPostInsights(
    platformPostId: string,
    accessToken: string
): Promise<{ likes: number; replies: number; views: number; quotes: number; reposts: number }> {
    const url = `${THREADS_API_BASE}/${platformPostId}/insights?metric=likes,replies,views,quotes,reposts&access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error?.message || `HTTP ${response.status}`);
    }

    const metrics: Record<string, number> = {};
    if (data.data && Array.isArray(data.data)) {
        for (const item of data.data) {
            if (item.name !== undefined) {
                if (item.total_value?.value !== undefined) {
                    metrics[item.name] = Number(item.total_value.value);
                } else if (Array.isArray(item.values) && item.values[0]?.value !== undefined) {
                    metrics[item.name] = Number(item.values[0].value);
                } else if (typeof item.value === "number") {
                    metrics[item.name] = item.value;
                }
            }
        }
    }

    return {
        likes: metrics.likes ?? 0,
        replies: metrics.replies ?? 0,
        views: metrics.views ?? 0,
        quotes: metrics.quotes ?? 0,
        reposts: metrics.reposts ?? 0,
    };
}

/**
 * Cron Job endpoint — automatically syncs engagement for ALL users.
 * Protected by CRON_SECRET to prevent unauthorized access.
 * Called by Vercel Cron every 12 hours.
 */
export async function GET(request: NextRequest) {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    console.log("⏰ Cron: Starting scheduled analytics sync for all users...");

    // 1. Get all active Threads accounts
    const { data: accounts, error: accountsError } = await supabase
        .from("social_accounts")
        .select("user_id, access_token")
        .eq("platform", "threads")
        .eq("is_active", true);

    if (accountsError || !accounts || accounts.length === 0) {
        console.log("⏰ Cron: No active Threads accounts to sync.");
        return NextResponse.json({ message: "No accounts to sync", users: 0 });
    }

    console.log(`⏰ Cron: Found ${accounts.length} active Threads account(s).`);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalSynced = 0;
    let totalFailed = 0;

    for (const account of accounts) {
        // 2. Import any new posts first
        try {
            const fields = "id,text,timestamp,permalink,media_type,is_quote_post";
            const importUrl = `${THREADS_API_BASE}/me/threads?fields=${fields}&limit=25&access_token=${account.access_token}`;
            const importRes = await fetch(importUrl);
            const importData = await importRes.json();

            if (importRes.ok && importData.data) {
                const { data: existing } = await supabase
                    .from("posts")
                    .select("platform_post_id")
                    .eq("user_id", account.user_id)
                    .not("platform_post_id", "is", null);

                const existingIds = new Set((existing ?? []).map((p: any) => p.platform_post_id));
                const newPosts = importData.data.filter((p: any) => !existingIds.has(p.id));

                if (newPosts.length > 0) {
                    const rows = newPosts.map((p: any) => ({
                        user_id: account.user_id,
                        content: p.text ?? "",
                        platform: "threads",
                        status: "published",
                        platform_post_id: p.id,
                        platform_post_url: p.permalink ?? null,
                        published_at: p.timestamp,
                        source_type: "manual",
                        likes: 0, comments: 0, shares: 0, impressions: 0,
                        created_at: p.timestamp,
                        updated_at: new Date().toISOString(),
                    }));

                    await supabase.from("posts").upsert(rows, { onConflict: "platform_post_id" } as any);
                    console.log(`⏰ Cron: Imported ${newPosts.length} new posts for user ${account.user_id}`);
                }
            }
        } catch (err: any) {
            console.error(`⏰ Cron: Failed to import posts for user ${account.user_id}:`, err.message);
        }

        // 3. Sync engagement for recent posts only
        const { data: posts } = await supabase
            .from("posts")
            .select("id, platform_post_id")
            .eq("user_id", account.user_id)
            .eq("status", "published")
            .eq("platform", "threads")
            .not("platform_post_id", "is", null)
            .gte("published_at", thirtyDaysAgo.toISOString());

        if (posts && posts.length > 0) {
            for (const post of posts) {
                try {
                    const insights = await fetchPostInsights(post.platform_post_id!, account.access_token);

                    await supabase
                        .from("posts")
                        .update({
                            likes: insights.likes,
                            comments: insights.replies,
                            shares: insights.reposts + insights.quotes,
                            impressions: insights.views,
                            last_analytics_sync: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", post.id);

                    totalSynced++;
                } catch (err: any) {
                    totalFailed++;
                }
            }
        }
    }

    console.log(`⏰ Cron: Sync complete — ${totalSynced} synced, ${totalFailed} failed.`);

    return NextResponse.json({
        message: "Cron sync complete",
        users: accounts.length,
        synced: totalSynced,
        failed: totalFailed,
    });
}

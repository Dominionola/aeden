import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const THREADS_API_BASE = "https://graph.threads.net/v1.0";

async function fetchPostInsights(
    platformPostId: string,
    accessToken: string
): Promise<{ likes: number; replies: number; views: number; quotes: number; reposts: number }> {
    const fields = "likes,replies,views,quotes,reposts";
    const url = `${THREADS_API_BASE}/${platformPostId}/insights?metric=${fields}&access_token=${accessToken}`;

    const response = await fetch(url);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Threads insights API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();

    // Parse the insights response — Threads returns an array of metric objects
    const metrics: Record<string, number> = {};
    if (data.data && Array.isArray(data.data)) {
        for (const item of data.data) {
            if (item.name && item.values?.[0]?.value !== undefined) {
                metrics[item.name] = item.values[0].value;
            } else if (item.name && item.total_value?.value !== undefined) {
                metrics[item.name] = item.total_value.value;
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

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get user's Threads token
        const { data: account, error: accountError } = await supabase
            .from("social_accounts")
            .select("access_token, account_id")
            .eq("user_id", user.id)
            .eq("platform", "threads")
            .eq("is_active", true)
            .single();

        if (accountError || !account) {
            return NextResponse.json(
                { error: "No active Threads account connected" },
                { status: 404 }
            );
        }

        // 2. Get all published posts that have a platform_post_id
        const { data: posts, error: postsError } = await supabase
            .from("posts")
            .select("id, platform_post_id, last_analytics_sync")
            .eq("user_id", user.id)
            .eq("status", "published")
            .eq("platform", "threads")
            .not("platform_post_id", "is", null);

        if (postsError) {
            return NextResponse.json(
                { error: "Failed to fetch posts" },
                { status: 500 }
            );
        }

        if (!posts || posts.length === 0) {
            return NextResponse.json({ message: "No published posts to sync", synced: 0 });
        }

        console.log(`🔄 Syncing engagement for ${posts.length} posts...`);

        // 3. Fetch insights for each post and update DB
        let synced = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const post of posts) {
            try {
                const insights = await fetchPostInsights(
                    post.platform_post_id!,
                    account.access_token
                );

                const { error: updateError } = await supabase
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

                if (updateError) {
                    throw new Error(updateError.message);
                }

                synced++;
                console.log(`✅ Synced post ${post.id}: ${JSON.stringify(insights)}`);
            } catch (err: any) {
                failed++;
                errors.push(`Post ${post.id}: ${err.message}`);
                console.error(`❌ Failed to sync post ${post.id}:`, err.message);
            }
        }

        return NextResponse.json({
            message: `Sync complete`,
            synced,
            failed,
            total: posts.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error: any) {
        console.error("Sync engagement error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET — used for status check / auto-trigger
export async function GET(request: NextRequest) {
    return POST(request);
}

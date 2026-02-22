import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const THREADS_API_BASE = "https://graph.threads.net/v1.0";

async function fetchPostInsights(
    platformPostId: string,
    accessToken: string
): Promise<{ likes: number; replies: number; views: number; quotes: number; reposts: number }> {
    const url = `${THREADS_API_BASE}/${platformPostId}/insights?metric=likes,replies,views,quotes,reposts&access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        console.error("❌ Threads insights API error:", JSON.stringify(data));
        throw new Error(data?.error?.message || `HTTP ${response.status}: ${JSON.stringify(data)}`);
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
 * Sync engagement for a specific user's posts.
 * Only syncs posts from the last 30 days to stay within Vercel's execution limits.
 */
async function syncUserEngagement(
    supabase: any,
    userId: string,
    accessToken: string
): Promise<{ synced: number; failed: number; errors: string[] }> {
    // Only fetch posts published in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("id, platform_post_id, last_analytics_sync")
        .eq("user_id", userId)
        .eq("status", "published")
        .eq("platform", "threads")
        .not("platform_post_id", "is", null)
        .gte("published_at", thirtyDaysAgo.toISOString());

    if (postsError || !posts || posts.length === 0) {
        return { synced: 0, failed: 0, errors: postsError ? [postsError.message] : [] };
    }

    console.log(`🔄 Syncing engagement for ${posts.length} recent posts (last 30 days)...`);

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const post of posts) {
        try {
            const insights = await fetchPostInsights(post.platform_post_id!, accessToken);

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

            if (updateError) throw new Error(updateError.message);
            synced++;
        } catch (err: any) {
            failed++;
            errors.push(`Post ${post.id}: ${err.message}`);
            console.error(`❌ Failed to sync post ${post.id}:`, err.message);
        }
    }

    return { synced, failed, errors };
}

/**
 * Manual sync — triggered by the user clicking the button.
 * Requires authentication.
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: account } = await supabase
            .from("social_accounts")
            .select("access_token, account_id")
            .eq("user_id", user.id)
            .eq("platform", "threads")
            .eq("is_active", true)
            .single();

        if (!account) {
            return NextResponse.json({ error: "No active Threads account connected" }, { status: 404 });
        }

        const result = await syncUserEngagement(supabase, user.id, account.access_token);

        return NextResponse.json({
            message: "Sync complete",
            ...result,
        });
    } catch (error: any) {
        console.error("Sync engagement error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    return POST(request);
}

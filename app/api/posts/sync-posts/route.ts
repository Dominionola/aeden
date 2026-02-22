import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const THREADS_API_BASE = "https://graph.threads.net/v1.0";

interface ThreadsPost {
    id: string;
    text?: string;
    timestamp: string;
    permalink?: string;
    media_type?: string;
    is_quote_post?: boolean;
}

/**
 * Fetches posts from the user's Threads account.
 * In quick mode, only fetches the latest 10 posts for speed.
 * In full mode, paginates through all posts.
 */
async function fetchThreadsPosts(accessToken: string, quick: boolean): Promise<ThreadsPost[]> {
    const fields = "id,text,timestamp,permalink,media_type,is_quote_post";
    const limit = quick ? 10 : 100;
    let url = `${THREADS_API_BASE}/me/threads?fields=${fields}&limit=${limit}&access_token=${accessToken}`;
    const allPosts: ThreadsPost[] = [];

    while (url) {
        console.log(`📥 Fetching Threads posts page...`);
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
            console.error("❌ Threads /me/threads error:", JSON.stringify(data));
            throw new Error(data?.error?.message || `HTTP ${res.status}`);
        }

        if (data.data && Array.isArray(data.data)) {
            allPosts.push(...data.data);
        }

        // In quick mode, only fetch one page
        if (quick) break;

        // Follow pagination cursor for full mode
        url = data.paging?.cursors?.after
            ? `${THREADS_API_BASE}/me/threads?fields=${fields}&limit=100&after=${data.paging.cursors.after}&access_token=${accessToken}`
            : "";
    }

    console.log(`📥 Total Threads posts fetched: ${allPosts.length} (${quick ? "quick" : "full"} mode)`);
    return allPosts;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if this is a quick sync (page load) or full sync (button click)
        const url = new URL(request.url);
        const quick = url.searchParams.get("quick") === "true";

        // 1. Get user's Threads connection
        const { data: account } = await supabase
            .from("social_accounts")
            .select("access_token, account_id, account_handle")
            .eq("user_id", user.id)
            .eq("platform", "threads")
            .eq("is_active", true)
            .maybeSingle();

        if (!account) {
            return NextResponse.json(
                { error: "No active Threads account connected" },
                { status: 404 }
            );
        }

        // 2. Fetch posts from Threads API
        const threadsPosts = await fetchThreadsPosts(account.access_token, quick);

        if (threadsPosts.length === 0) {
            return NextResponse.json({ message: "No posts found on Threads", imported: 0 });
        }

        // 3. Get existing platform_post_ids so we don't duplicate
        const { data: existingPosts } = await supabase
            .from("posts")
            .select("platform_post_id")
            .eq("user_id", user.id)
            .eq("platform", "threads")
            .not("platform_post_id", "is", null);

        const existingIds = new Set((existingPosts ?? []).map((p: any) => p.platform_post_id));

        // 4. Filter to only truly new posts
        const newPosts = threadsPosts.filter(p => !existingIds.has(p.id));
        console.log(`📥 ${newPosts.length} new posts to import (${threadsPosts.length - newPosts.length} already exist)`);

        if (newPosts.length === 0) {
            return NextResponse.json({
                message: "All Threads posts already imported",
                imported: 0,
                total: threadsPosts.length,
            });
        }

        // 5. Upsert new posts into our DB
        const rows = newPosts.map(post => ({
            user_id: user.id,
            content: post.text ?? "",
            platform: "threads",
            status: "published",
            platform_post_id: post.id,
            platform_post_url: post.permalink ?? null,
            published_at: post.timestamp,
            source_type: "manual",
            likes: 0,
            comments: 0,
            shares: 0,
            impressions: 0,
            created_at: post.timestamp,
            updated_at: new Date().toISOString(),
        }));

        const { error: insertError } = await supabase
            .from("posts")
            .upsert(rows, { onConflict: "platform_post_id" } as any);

        if (insertError) {
            console.error("❌ Failed to upsert posts:", insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({
            message: `Imported ${newPosts.length} new posts from Threads`,
            imported: newPosts.length,
            total: threadsPosts.length,
        });

    } catch (error: any) {
        console.error("❌ sync-posts error:", error);
        return NextResponse.json({ error: error.message ?? "Internal error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return POST(req);
}

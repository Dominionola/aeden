import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publishPost, ThreadsApiError } from "@/lib/threads/client";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { postId } = body;

        if (!postId) {
            return NextResponse.json({ error: "postId is required" }, { status: 400 });
        }

        // 1. Fetch Post Data
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select("*")
            .eq("id", postId)
            .eq("user_id", user.id)
            .single();

        if (postError || !post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        if (post.status === "published") {
            return NextResponse.json({ error: "Post is already published" }, { status: 400 });
        }

        // 2. Fetch Threads Credentials
        const { data: socialAccount, error: accountError } = await supabase
            .from("social_accounts")
            .select("access_token, account_id")
            .eq("user_id", user.id)
            .eq("platform", "threads")
            .eq("is_active", true)
            .single();

        if (accountError || !socialAccount) {
            return NextResponse.json({ error: "No active Threads account connected" }, { status: 404 });
        }

        if (!socialAccount.access_token || !socialAccount.account_id) {
            return NextResponse.json({ error: "Incomplete Threads credentials" }, { status: 400 });
        }

        // 3. Publish to Threads
        const platformPostId = await publishPost(
            socialAccount.account_id,
            socialAccount.access_token,
            post.content,
            post.image_url
        );

        // 4. Update Database
        const { error: updateError } = await supabase
            .from("posts")
            .update({
                status: "published",
                platform_post_id: platformPostId,
                platform_post_url: `https://www.threads.net/post/${platformPostId}`, // Threads uses shortcodes, but this is a placeholder
                published_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq("id", postId)
            .eq("user_id", user.id);

        if (updateError) {
            console.error("Failed to update post status in DB:", updateError);
            return NextResponse.json({ error: "Published successfully but failed to update status in DB" }, { status: 500 });
        }

        return NextResponse.json({ success: true, platformPostId });

    } catch (error: any) {
        console.error("Publishing error:", error);
        
        let errorMessage = "Failed to publish post";
        if (error instanceof ThreadsApiError) {
            errorMessage = `Meta API Error: ${error.message}`;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

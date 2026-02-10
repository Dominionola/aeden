import { createClient } from "@/lib/supabase/server";
import { threadsClient } from "@/lib/threads/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { postId } = await request.json();

        if (!postId) {
            return NextResponse.json(
                { error: "Missing postId" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // 1. Verify User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Fetch Post
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select("*")
            .eq("id", postId)
            .eq("user_id", user.id)
            .single();

        if (postError || !post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            );
        }

        if (post.status === "published" && post.platform_post_id) {
            return NextResponse.json(
                { error: "Post is already published" },
                { status: 400 }
            );
        }

        // 3. Get Threads Token
        const { data: account, error: tokenError } = await supabase
            .from("social_accounts")
            .select("access_token, account_id")
            .eq("user_id", user.id)
            .eq("platform", "threads")
            .eq("is_active", true)
            .single();

        if (tokenError || !account) {
            return NextResponse.json(
                { error: "Threads account not connected" },
                { status: 403 }
            );
        }

        // 4. Publish to Threads
        let publishId: string;
        try {
            console.log("📤 Publishing to Threads:", {
                userId: account.account_id?.substring(0, 10) + "...",
                hasToken: !!account.access_token,
                tokenLength: account.access_token?.length,
                contentLength: post.content?.length,
                hasImage: !!post.image_url
            });

            publishId = await threadsClient.publishPost(
                account.account_id,
                account.access_token,
                post.content,
                post.image_url
            );

            console.log("✅ Successfully published to Threads:", publishId);
        } catch (apiError: any) {
            console.error("❌ Threads API Error Details:", {
                message: apiError.message,
                stack: apiError.stack,
                response: apiError.response,
                cause: apiError.cause,
                userId: account.account_id,
                hasToken: !!account.access_token,
                contentPreview: post.content?.substring(0, 50) + "..."
            });

            // Return more detailed error to help debug
            return NextResponse.json(
                {
                    error: "Failed to publish to Threads",
                    details: apiError.message || "Unknown error",
                    debug: process.env.NODE_ENV === "development" ? {
                        userId: account.account_id,
                        hasToken: !!account.access_token
                    } : undefined
                },
                { status: 502 }
            );
        }
        // 5. Update Post Status
        // 5. Update Post Status
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
            .from("posts")
            .update({
                status: "published",
                platform: "threads",
                platform_post_id: publishId,
                published_at: now,
                updated_at: now
            })
            .eq("id", postId);

        if (updateError) {
            console.error("DB update failed after successful publish. postId:", postId, "platform_post_id:", publishId, "error:", updateError);
            return NextResponse.json(
                { error: "Post was published but failed to update status. Please contact support.", platform_post_id: publishId },
                { status: 500 }
            );
        } return NextResponse.json({ success: true, platform_post_id: publishId });

    } catch (error: any) {
        console.error("Publish Route Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

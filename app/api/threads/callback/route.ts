import { threadsClient } from "@/lib/threads/client";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function errorRedirect(request: NextRequest, message: string, detail?: string) {
    const url = new URL("/dashboard/settings/connections", request.url);
    url.searchParams.set("error", message);
    if (detail) url.searchParams.set("detail", detail.slice(0, 200));
    return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorReason = searchParams.get("error_reason");

    // User cancelled or Threads returned an error
    if (error) {
        console.error("❌ Threads OAuth error:", { error, errorReason });
        return errorRedirect(request, error, errorReason ?? undefined);
    }

    if (!code) {
        console.error("❌ No code in callback");
        return errorRedirect(request, "missing_code");
    }

    // Validate env vars early — give a clear error if missing
    const redirectUri = process.env.NEXT_PUBLIC_THREADS_REDIRECT_URI;
    if (!redirectUri || redirectUri.includes("YOUR-NGROK-URL") || redirectUri.includes("localhost")) {
        const envError = `NEXT_PUBLIC_THREADS_REDIRECT_URI is not configured for production. Current value: "${redirectUri}"`;
        console.error("❌ Env config error:", envError);
        return errorRedirect(request, "misconfigured_redirect_uri", envError);
    }

    try {
        const supabase = await createClient();

        // 1. Verify User Session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("❌ Auth error in callback:", authError?.message);
            return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
        }

        // 2. Exchange Code for short-lived Token
        console.log("🔄 Step 1: Exchanging code for token...");
        let accessToken: string;
        let threadsUserId: string;
        try {
            const tokenData = await threadsClient.exchangeCodeForToken(code);
            accessToken = tokenData.access_token;
            threadsUserId = tokenData.user_id;
            console.log("✅ Got short-lived token for user:", threadsUserId);
        } catch (err: any) {
            console.error("❌ Token exchange failed:", err.message);
            return errorRedirect(request, "token_exchange_failed", err.message);
        }

        // 3. Exchange for long-lived token (60 days)
        console.log("🔄 Step 2: Exchanging for long-lived token...");
        let tokenExpiresAt: string;
        try {
            const longLivedToken = await threadsClient.exchangeForLongLivedToken(accessToken);
            accessToken = longLivedToken.access_token;
            const exp = new Date();
            exp.setDate(exp.getDate() + 60);
            tokenExpiresAt = exp.toISOString();
            console.log("✅ Long-lived token obtained, expires:", tokenExpiresAt);
        } catch (err: any) {
            console.warn("⚠️ Long-lived token exchange failed, using short-lived:", err.message);
            const exp = new Date();
            exp.setHours(exp.getHours() + 1);
            tokenExpiresAt = exp.toISOString();
        }

        // 4. Fetch user profile from /me
        console.log("🔄 Step 3: Fetching user profile...");
        let threadsUser: {
            id: string;
            username: string;
            threads_profile_picture_url?: string;
            threads_biography?: string;
            followers_count?: number;
        };
        try {
            threadsUser = await threadsClient.getUser(threadsUserId, accessToken);
            console.log("✅ Profile fetched:", {
                id: threadsUser.id,
                username: threadsUser.username,
                followers: threadsUser.followers_count,
            });
        } catch (err: any) {
            console.warn("⚠️ Profile fetch failed, using fallback:", err.message);
            threadsUser = { id: threadsUserId, username: "unknown" };
        }

        // 5. Upsert to DB
        console.log("🔄 Step 4: Saving to database...");
        const { error: dbError } = await supabase
            .from("social_accounts")
            .upsert({
                user_id: user.id,
                platform: "threads",
                access_token: accessToken,
                token_expires_at: tokenExpiresAt,
                account_id: threadsUser.id,
                account_handle: threadsUser.username,
                profile_picture_url: threadsUser.threads_profile_picture_url ?? null,
                biography: threadsUser.threads_biography ?? null,
                followers_count: threadsUser.followers_count ?? 0,
                is_active: true,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: "user_id, platform",
            });

        if (dbError) {
            console.error("❌ Database upsert failed:", dbError);
            return errorRedirect(request, "database_error", dbError.message);
        }

        console.log("✅ Threads connection saved for user:", user.id);

        // 6. Redirect to connections page with success
        const redirectPath = state || "/dashboard/settings/connections";
        return NextResponse.redirect(
            new URL(`${redirectPath}?success=threads_connected`, request.url)
        );

    } catch (error: any) {
        console.error("❌ Unexpected Threads callback error:", {
            message: error?.message,
            stack: error?.stack,
        });
        return errorRedirect(request, "unexpected_error", error?.message);
    }
}

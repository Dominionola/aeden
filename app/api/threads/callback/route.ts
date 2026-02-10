import { threadsClient } from "@/lib/threads/client";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This is our 'origin' path
    const error = searchParams.get("error");
    const errorReason = searchParams.get("error_reason");

    if (error) {
        return NextResponse.redirect(
            new URL(`/dashboard?error=${error}&reason=${errorReason}`, request.url)
        );
    }

    if (!code) {
        return NextResponse.redirect(
            new URL("/dashboard?error=missing_code", request.url)
        );
    }

    try {
        const supabase = await createClient();

        // 1. Verify User Session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.redirect(
                new URL("/login?error=unauthorized", request.url)
            );
        }

        // 2. Exchange Code for Token
        const tokenData = await threadsClient.exchangeCodeForToken(code);
        let accessToken = tokenData.access_token;
        const threadsUserId = tokenData.user_id;

        // 3. Exchange for long-lived token (60 days validity)
        let tokenExpiresAt: string | null = null;
        try {
            const longLivedToken = await threadsClient.exchangeForLongLivedToken(accessToken);
            accessToken = longLivedToken.access_token;

            // Calculate expiration (60 days from now)
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 60);
            tokenExpiresAt = expirationDate.toISOString();

            console.log("✅ Exchanged for long-lived token, expires:", tokenExpiresAt);
        } catch (exchangeError) {
            console.warn("⚠️ Failed to exchange for long-lived token, using short-lived:", exchangeError);
            // Still proceed with short-lived token
        }

        // 4. Get User Details (for handle/profile pic)
        let threadsUser;
        try {
            threadsUser = await threadsClient.getUser(threadsUserId, accessToken);
        } catch (e) {
            console.error("Failed to fetch user details", e);
            // Fallback if profile fetch fails, we still have the ID
            threadsUser = { id: threadsUserId, username: "Unknown" };
        }

        // 5. Save to Database
        const { error: dbError } = await supabase
            .from("social_accounts")
            .upsert({
                user_id: user.id,
                platform: "threads",
                access_token: accessToken,
                token_expires_at: tokenExpiresAt,
                account_id: threadsUserId,
                account_handle: threadsUser.username,
                profile_picture_url: threadsUser.threads_profile_picture_url,
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: "user_id, platform"
            });

        if (dbError) {
            console.error("Database save error:", dbError);
            throw new Error("Failed to save connection to database");
        } else {
            console.log("✅ Successfully saved Threads connection for user:", user.id);
        }

        // 5. Redirect back
        const redirectPath = state || "/dashboard";
        return NextResponse.redirect(
            new URL(`${redirectPath}?success=threads_connected`, request.url)
        );

    } catch (error) {
        console.error("Threads Callback Error:", error);
        return NextResponse.redirect(
            new URL("/dashboard?error=threads_connection_failed", request.url)
        );
    }
}

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to test Threads connection
 * GET /api/threads/test
 */
export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({
                success: false,
                error: "Not authenticated",
                step: "auth"
            }, { status: 401 });
        }

        // 2. Check if Threads is connected
        const { data: account, error: accountError } = await supabase
            .from("social_accounts")
            .select("access_token, account_id, account_handle, is_active, updated_at")
            .eq("user_id", user.id)
            .eq("platform", "threads")
            .single();

        if (accountError || !account) {
            return NextResponse.json({
                success: false,
                error: "Threads not connected",
                step: "account_fetch",
                details: accountError?.message
            }, { status: 403 });
        }

        // 3. Check environment variables
        const envCheck = {
            THREADS_APP_ID: !!process.env.THREADS_APP_ID,
            THREADS_APP_SECRET: !!process.env.THREADS_APP_SECRET,
            NEXT_PUBLIC_THREADS_REDIRECT_URI: !!process.env.NEXT_PUBLIC_THREADS_REDIRECT_URI,
        };

        // 4. Return diagnostic info
        return NextResponse.json({
            success: true,
            connection: {
                accountId: account.account_id?.substring(0, 10) + "...",
                handle: account.account_handle,
                hasToken: !!account.access_token,
                tokenLength: account.access_token?.length,
                isActive: account.is_active,
                lastUpdated: account.updated_at
            },
            environment: envCheck,
            allEnvVarsSet: Object.values(envCheck).every(v => v)
        });

    } catch (error: any) {
        console.error("Test endpoint error:", error);
        return NextResponse.json({
            success: false,
            error: "Internal server error",
            details: error.message,
            step: "unknown"
        }, { status: 500 });
    }
}

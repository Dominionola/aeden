import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Disconnect Threads account
 * POST /api/threads/disconnect
 */
export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Deactivate the Threads connection
        const { error: updateError } = await supabase
            .from("social_accounts")
            .update({ is_active: false })
            .eq("user_id", user.id)
            .eq("platform", "threads");

        if (updateError) {
            console.error("Failed to disconnect Threads:", updateError);
            return NextResponse.json(
                { error: "Failed to disconnect account" },
                { status: 500 }
            );
        }

        console.log("✅ Threads disconnected for user:", user.id);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Disconnect endpoint error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

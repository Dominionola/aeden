import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const THREADS_API_BASE = "https://graph.threads.net/v1.0";

/**
 * Fetch the current follower count from the Threads User Insights API.
 * The followers_count metric returns the total follower count (no time range).
 */
async function fetchFollowerCount(
    threadsUserId: string,
    accessToken: string
): Promise<number> {
    const url = `${THREADS_API_BASE}/${threadsUserId}/threads_insights?metric=followers_count&access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        console.error("❌ Threads follower count API error:", JSON.stringify(data));
        throw new Error(data?.error?.message || `HTTP ${response.status}`);
    }

    // The API returns: { data: [{ name: "followers_count", ... }] }
    if (data.data && Array.isArray(data.data)) {
        for (const item of data.data) {
            if (item.name === "followers_count") {
                if (item.total_value?.value !== undefined) {
                    return Number(item.total_value.value);
                }
                if (Array.isArray(item.values) && item.values[0]?.value !== undefined) {
                    return Number(item.values[0].value);
                }
                if (typeof item.value === "number") {
                    return item.value;
                }
            }
        }
    }

    return 0;
}

/**
 * POST: Manually sync follower count (called by the sync button).
 * GET:  Fetch stored follower snapshots for the chart.
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
            return NextResponse.json({ error: "No active Threads account" }, { status: 404 });
        }

        const followerCount = await fetchFollowerCount(account.account_id, account.access_token);

        // Upsert today's snapshot (one per day)
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        const { error: upsertError } = await supabase
            .from("follower_snapshots")
            .upsert(
                {
                    user_id: user.id,
                    follower_count: followerCount,
                    snapshot_date: today,
                },
                { onConflict: "user_id,snapshot_date" }
            );

        if (upsertError) {
            console.error("❌ Failed to upsert follower snapshot:", upsertError.message);
            throw new Error(upsertError.message);
        }

        return NextResponse.json({ follower_count: followerCount, snapshot_date: today });
    } catch (error: any) {
        console.error("Follower sync error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

/**
 * GET: Return stored follower snapshots for the logged-in user.
 * Query param ?days=30 controls how far back to fetch (default 90).
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const days = parseInt(url.searchParams.get("days") ?? "90", 10);

        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data: snapshots, error } = await supabase
            .from("follower_snapshots")
            .select("follower_count, snapshot_date")
            .eq("user_id", user.id)
            .gte("snapshot_date", since.toISOString().split("T")[0])
            .order("snapshot_date", { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ snapshots: snapshots ?? [] });
    } catch (error: any) {
        console.error("Follower fetch error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

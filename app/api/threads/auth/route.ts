import { threadsClient } from "@/lib/threads/client";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const origin = searchParams.get("origin") || "/dashboard/settings";

    // We could encode the origin in the state parameter to redirect back correctly
    const authUrl = threadsClient.getAuthUrl(origin);

    return redirect(authUrl);
}

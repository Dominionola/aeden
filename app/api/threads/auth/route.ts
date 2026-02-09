import { threadsClient } from "@/lib/threads/client";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    console.log("🚀 Threads Auth Route Hit");
    console.log("🚀 ENV Check - THREADS_APP_ID:", process.env.THREADS_APP_ID);
    console.log("🚀 ENV Check - THREADS_APP_SECRET:", process.env.THREADS_APP_SECRET ? "[SET]" : "[NOT SET]");
    console.log("🚀 ENV Check - NEXT_PUBLIC_THREADS_REDIRECT_URI:", process.env.NEXT_PUBLIC_THREADS_REDIRECT_URI);

    const searchParams = request.nextUrl.searchParams;
    const origin = searchParams.get("origin") || "/dashboard/settings";

    // We could encode the origin in the state parameter to redirect back correctly
    let authUrl: string;
    try {
        authUrl = threadsClient.getAuthUrl(origin);
        console.log("🚀 Final Auth URL before redirect:", authUrl);
    } catch (error) {
        console.error("Error generating auth URL:", error);
        throw error;
    }

    return redirect(authUrl);
}

import { createClient } from "@/lib/supabase/server";
import { ThreadsConnectButton } from "@/components/dashboard/settings/threads-connect-button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ConnectionsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const success = params.success;
    const error = params.error as string | undefined;
    const detail = params.detail as string | undefined;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check Threads Connection
    const { data: threadsAccount, error: fetchError } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("platform", "threads")
        .eq("is_active", true)
        .maybeSingle();

    console.log("🔍 Connections Page - User ID:", user.id);
    console.log("🔍 Connections Page - Threads Account:", threadsAccount);
    if (fetchError) {
        console.error("🔍 Connections Page - Fetch Error:", fetchError);
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
                <p className="text-gray-500 mt-1">
                    Manage your social accounts and integrations.
                </p>
            </div>

            {/* Notifications */}
            {success === "threads_connected" && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-emerald-900">Successfully connected!</h3>
                        <p className="text-sm text-emerald-700">Your Threads account is now linked to Aeden.</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <h3 className="font-medium text-red-900">Connection Failed</h3>
                        <p className="text-sm text-red-700 mt-0.5">
                            {error === "misconfigured_redirect_uri"
                                ? "The Threads redirect URI is not configured on Vercel. Add NEXT_PUBLIC_THREADS_REDIRECT_URI to your Vercel environment variables."
                                : error === "token_exchange_failed"
                                    ? "Failed to exchange the authorization code. Try connecting again."
                                    : error === "database_error"
                                        ? "Your account was authorized but we couldn't save it. Try again."
                                        : error === "access_denied"
                                            ? "You cancelled the Threads authorization. No changes were made."
                                            : "Something went wrong. Check the detail below and try again."}
                        </p>
                        {detail && (
                            <p className="text-xs text-red-500 mt-1 font-mono break-all">{detail}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <section>
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Social Platforms</h2>
                    <div className="space-y-4">
                        <ThreadsConnectButton
                            isConnected={!!threadsAccount}
                            threadsHandle={threadsAccount?.account_handle}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

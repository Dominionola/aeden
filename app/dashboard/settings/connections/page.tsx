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
    const error = params.error;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check Threads Connection
    const { data: threadsAccount } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("platform", "threads")
        .eq("is_active", true)
        .single();

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
                    <div>
                        <h3 className="font-medium text-red-900">Connection Failed</h3>
                        <p className="text-sm text-red-700">
                            {error === "threads_connection_failed"
                                ? "We couldn't connect to your Threads account. Please try again."
                                : "An error occurred while connecting your account."}
                        </p>
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

import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let isThreadsConnected = false;

    // Only check if we have a user to avoid unnecessary DB calls (and potential errors)
    if (user) {
        const { data: threadsAccount } = await supabase
            .from("social_accounts")
            .select("id")
            .eq("user_id", user.id)
            .eq("platform", "threads")
            .eq("is_active", true)
            .single();

        isThreadsConnected = !!threadsAccount;
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar - Dark Navy */}
            <Sidebar isThreadsConnected={isThreadsConnected} />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main
                    className="flex-1 overflow-y-auto"
                    style={{ backgroundColor: '#f8fafc' }}
                >
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

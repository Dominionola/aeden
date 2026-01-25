import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen">
            {/* Sidebar - Dark Navy */}
            <Sidebar />

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

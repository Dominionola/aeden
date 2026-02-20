import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Palette, Link2, HelpCircle, User } from "lucide-react";

export const metadata = {
    title: "Settings | Aeden",
    description: "Manage your Aeden account and preferences.",
};

const SETTINGS_SECTIONS = [
    {
        href: "/dashboard/settings/voice",
        icon: Palette,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
        label: "Voice & Persona",
        description: "Customize your tone, personality, and writing style.",
    },
    {
        href: "/dashboard/settings/connections",
        icon: Link2,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        label: "Connections",
        description: "Manage connected social accounts and integrations.",
    },
];

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>

            {/* Account info */}
            <Card className="shadow-sm">
                <CardContent className="flex items-center gap-4 pt-6">
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-lg">
                            {user.email?.[0]?.toUpperCase() ?? "U"}
                        </span>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-400">Member since {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Settings nav */}
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                {SETTINGS_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                        >
                            <div className={`p-2 rounded-lg ${section.iconBg} shrink-0`}>
                                <Icon className={`h-5 w-5 ${section.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900">{section.label}</p>
                                <p className="text-sm text-gray-500">{section.description}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

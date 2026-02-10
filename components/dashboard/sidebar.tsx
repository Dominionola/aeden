"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    BarChart3,
    Link2,
    Settings,
    HelpCircle,
    Sparkles,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Posts",
        href: "/dashboard/posts",
        icon: FileText,
    },
    {
        name: "Sources",
        href: "/dashboard/sources",
        icon: Link2,
    },
    {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
    },
];

const bottomNavigation = [
    {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
    {
        name: "Help",
        href: "/dashboard/help",
        icon: HelpCircle,
    },
];

export function Sidebar({ isThreadsConnected = false }: { isThreadsConnected?: boolean }) {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex md:w-64 md:flex-col h-screen bg-white border-r border-gray-200">
            <div className="flex flex-1 flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center px-6 border-b border-gray-100">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Aeden</span>
                    </Link>
                </div>

                {/* Create Post Button */}
                <div className="px-4 py-4">
                    <Link href="/dashboard/posts/new">
                        <Button className="w-full gap-2 bg-blue-500 hover:bg-blue-600 shadow-sm">
                            <Plus className="h-4 w-4" />
                            Create Post
                        </Button>
                    </Link>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 px-3 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5",
                                    isActive ? "text-blue-500" : "text-gray-400"
                                )} />
                                {item.name}
                            </Link>
                        );
                    })}

                    {/* Voice/Persona Settings - Special highlight */}
                    <Link
                        href="/dashboard/settings/voice"
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 mt-2",
                            pathname === "/dashboard/settings/voice"
                                ? "bg-amber-50 text-amber-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <Sparkles className={cn(
                            "h-5 w-5",
                            pathname === "/dashboard/settings/voice" ? "text-amber-500" : "text-gray-400"
                        )} />
                        Voice & Persona
                    </Link>
                </nav>

                {/* Bottom Section */}
                <div className="px-3 pb-4 space-y-3 mt-auto">
                    {/* Bottom Navigation */}
                    <div className="space-y-1 border-t border-gray-100 pt-4">
                        {bottomNavigation.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className={cn(
                                        "h-5 w-5",
                                        isActive ? "text-blue-500" : "text-gray-400"
                                    )} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Threads Connection Prompt - Only show if NOT connected */}
                    {!isThreadsConnected && (
                        <div className="rounded-2xl p-4 bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579 0.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.868-.72 2.048-1.175 3.378-1.304.93-.09 1.864-.053 2.78.11-.04-.943-.261-1.67-.658-2.161-.47-.58-1.193-.874-2.145-.874-.865 0-1.54.253-2.003.751-.39.42-.64.988-.742 1.69l-2.054-.36c.165-1.125.596-2.053 1.283-2.764.9-.932 2.13-1.404 3.658-1.404 1.689 0 2.998.55 3.893 1.636.755.916 1.152 2.17 1.181 3.735l.006.442c.005.39.004.78-.003 1.17l-.002.143c.963.477 1.77 1.15 2.396 2.015.93 1.285 1.25 2.857.902 4.426-.532 2.403-2.158 4.292-4.582 5.32-1.548.656-3.27.96-5.095.96-.06 0-.12 0-.179 0zm1.227-7.607c1.035-.064 1.757-.445 2.212-1.164.36-.572.563-1.335.607-2.278-.678-.157-1.39-.209-2.123-.154-.9.067-1.64.322-2.14.739-.46.384-.69.854-.66 1.36.04.669.378 1.18.95 1.437.437.196.985.072 1.154.06z" />
                                </svg>
                                <span className="font-semibold text-sm text-gray-900">Connect Threads</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">
                                Publish your posts directly to Threads.
                            </p>
                            <Link href="/dashboard/settings/connections">
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                    Connect Account
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

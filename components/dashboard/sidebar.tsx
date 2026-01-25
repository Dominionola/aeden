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
    ShoppingBag,
    Users,
    FileStack,
    Store,
    CreditCard,
    Receipt,
    PieChart,
    Tag,
    ChevronDown,
} from "lucide-react";

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
        badge: "3",
    },
    {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
    },
    {
        name: "Sources",
        href: "/dashboard/sources",
        icon: Link2,
    },
];

const financeSection = [
    {
        name: "Finances",
        icon: CreditCard,
        isSection: true,
        children: [
            { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
            { name: "Transactions", href: "/dashboard/transactions", icon: FileStack },
            { name: "Reports", href: "/dashboard/reports", icon: PieChart },
        ],
    },
];

const bottomNavigation = [
    {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
    {
        name: "Help & Support",
        href: "/dashboard/help",
        icon: HelpCircle,
    },
];

export function Sidebar() {
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

                {/* Search */}
                <div className="px-4 py-4">
                    <div className="relative">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="h-10 w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-12 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 text-[10px] font-medium text-gray-500">
                                ⌘K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={cn(
                                        "h-5 w-5",
                                        isActive ? "text-blue-500" : "text-gray-400"
                                    )} />
                                    {item.name}
                                </div>
                                {item.badge && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-blue-500 px-1.5 text-xs font-semibold text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Finances Section */}
                    <div className="pt-4">
                        {financeSection.map((section) => {
                            const SectionIcon = section.icon;
                            return (
                                <div key={section.name}>
                                    <button className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <SectionIcon className="h-5 w-5 text-gray-400" />
                                            {section.name}
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>
                                    <div className="ml-4 mt-1 space-y-1">
                                        {section.children?.map((child) => {
                                            const ChildIcon = child.icon;
                                            const isActive = pathname === child.href;
                                            return (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-xl px-4 py-2 text-sm transition-all duration-200",
                                                        isActive
                                                            ? "bg-blue-50 text-blue-600 font-medium"
                                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                                    )}
                                                >
                                                    <ChildIcon className={cn(
                                                        "h-4 w-4",
                                                        isActive ? "text-blue-500" : "text-gray-400"
                                                    )} />
                                                    {child.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Analytics & Discounts */}
                    <div className="pt-2 space-y-1">
                        <Link
                            href="/dashboard/analytics"
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                pathname === "/dashboard/analytics"
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <PieChart className={cn(
                                "h-5 w-5",
                                pathname === "/dashboard/analytics" ? "text-blue-500" : "text-gray-400"
                            )} />
                            Analytics
                        </Link>
                        <Link
                            href="/dashboard/discounts"
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                pathname === "/dashboard/discounts"
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Tag className={cn(
                                "h-5 w-5",
                                pathname === "/dashboard/discounts" ? "text-blue-500" : "text-gray-400"
                            )} />
                            Discounts
                        </Link>
                    </div>
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

                    {/* Upgrade Card - Blue gradient like the reference */}
                    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-white" />
                                <span className="text-white font-semibold text-sm">Upgrade to Pro!</span>
                            </div>
                            <p className="text-blue-100 text-xs mb-3 leading-relaxed">
                                Unlock unlimited posts and all AI features.
                            </p>
                            <button className="w-full py-2 px-3 rounded-lg bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors shadow-sm">
                                Upgrade now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Settings, LogOut, User, Plus, Calendar, ChevronDown } from "lucide-react";
import Link from "next/link";

export function Header() {
    // Mock date range - in real app this would be dynamic
    const dateRange = "Jan 1, 2025 - Feb 1, 2025";

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            {/* Left: Page Title Area (will be set by page) */}
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>

            {/* Center: Date Range & Filters */}
            <div className="hidden md:flex items-center gap-3">
                <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <Calendar className="h-4 w-4" />
                    <span>{dateRange}</span>
                    <ChevronDown className="h-3 w-3" />
                </button>
                <span className="text-gray-300">|</span>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Last 30 days
                    <ChevronDown className="h-3 w-3" />
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                    Add widget
                </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {/* Export Button */}
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Export
                </Button>

                {/* New Post Button */}
                <Link href="/dashboard/posts/new">
                    <Button size="sm" className="gap-2 bg-blue-500 hover:bg-blue-600">
                        <Plus className="h-4 w-4" />
                        New Post
                    </Button>
                </Link>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {/* Settings Quick Access */}
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Settings className="h-5 w-5 text-gray-500" />
                </button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                                <AvatarImage src="" alt="User" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                                    U
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">User</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    user@example.com
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive flex items-center gap-2"
                            onClick={() => {
                                // Sign out logic
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

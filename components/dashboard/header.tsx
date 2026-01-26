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
import { Bell, Settings, LogOut, User, Sparkles } from "lucide-react";
import Link from "next/link";

export function Header() {
    return (
        <header className="flex h-14 items-center justify-between border-b border-gray-100 bg-white px-6">
            {/* Left: Breadcrumb / Page context */}
            <div className="flex items-center gap-2">
                {/* Could show current page title or breadcrumb */}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Bell className="h-5 w-5 text-gray-500" />
                    {/* Notification dot - show when there are unread */}
                    {/* <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" /> */}
                </button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                                <AvatarImage src="" alt="User" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
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
                            <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                                <User className="h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings/voice" className="flex items-center gap-2 cursor-pointer">
                                <Sparkles className="h-4 w-4" />
                                Voice & Persona
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive flex items-center gap-2 cursor-pointer"
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

"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ThreadsConnectButtonProps {
    isConnected: boolean;
    threadsHandle?: string | null;
}

export function ThreadsConnectButton({ isConnected, threadsHandle }: ThreadsConnectButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const handleConnect = () => {
        setIsLoading(true);
        // Redirect to the Auth API
        // We set origin so we come back to this settings page
        window.location.href = "/api/threads/auth?origin=/dashboard/settings/connections";
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect your Threads account? You'll need to reconnect to publish posts.")) {
            return;
        }

        setIsDisconnecting(true);
        try {
            const response = await fetch("/api/threads/disconnect", {
                method: "POST"
            });

            if (!response.ok) {
                throw new Error("Failed to disconnect");
            }

            toast.success("Threads disconnected successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to disconnect Threads account");
            console.error(error);
        } finally {
            setIsDisconnecting(false);
        }
    };

    if (isConnected) {
        return (
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                        {/* Threads Icon - Properly Centered */}
                        <svg className="h-6 w-6" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" fill="currentColor" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">Connected to Threads</div>
                        <div className="text-sm text-emerald-600">
                            @{threadsHandle || 'username'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                    >
                        {isDisconnecting ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                Disconnecting...
                            </>
                        ) : (
                            "Disconnect"
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                    {/* Threads Icon */}
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579 0.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.868-.72 2.048-1.175 3.378-1.304.93-.09 1.864-.053 2.78.11-.04-.943-.261-1.67-.658-2.161-.47-.58-1.193-.874-2.145-.874-.865 0-1.54.253-2.003.751-.39.42-.64.988-.742 1.69l-2.054-.36c.165-1.125.596-2.053 1.283-2.764.9-.932 2.13-1.404 3.658-1.404 1.689 0 2.998.55 3.893 1.636.755.916 1.152 2.17 1.181 3.735l.006.442c.005.39.004.78-.003 1.17l-.002.143c.963.477 1.77 1.15 2.396 2.015.93 1.285 1.25 2.857.902 4.426-.532 2.403-2.158 4.292-4.582 5.32-1.548.656-3.27.96-5.095.96-.06 0-.12 0-.179 0zm1.227-7.607c1.035-.064 1.757-.445 2.212-1.164.36-.572.563-1.335.607-2.278-.678-.157-1.39-.209-2.123-.154-.9.067-1.64.322-2.14.739-.46.384-.69.854-.66 1.36.04.669.378 1.18.95 1.437.437.196.985.072 1.154.06z" />
                    </svg>
                </div>
                <div>
                    <div className="font-medium text-gray-900">Connect Threads</div>
                    <div className="text-sm text-gray-500">
                        Share updates directly to your profile
                    </div>
                </div>
            </div>
            <Button onClick={handleConnect} disabled={isLoading} className="gap-2 bg-black text-white hover:bg-gray-800">
                {isLoading ? "Connecting..." : "Connect Account"}
            </Button>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SyncButtonProps {
    hasPublishedPosts: boolean;
}

export default function AnalyticsSyncButton({ hasPublishedPosts }: SyncButtonProps) {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        if (!hasPublishedPosts) {
            toast.info("No published posts to sync yet.");
            return;
        }

        setIsSyncing(true);
        try {
            const response = await fetch("/api/posts/sync-engagement", {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Sync failed");
            }

            if (data.synced > 0) {
                toast.success(`Synced ${data.synced} post${data.synced > 1 ? "s" : ""}`, {
                    description: "Engagement data updated from Threads.",
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                });
                // Refresh the page to show updated data
                window.location.reload();
            } else {
                toast.info(data.message || "Nothing to sync.");
            }
        } catch (error: any) {
            toast.error("Sync failed", {
                description: error.message,
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            id="sync-analytics-btn"
            className="flex items-center gap-2"
        >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Engagement"}
        </Button>
    );
}

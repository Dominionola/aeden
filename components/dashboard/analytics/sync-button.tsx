"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";

interface SyncButtonProps {
    hasPublishedPosts: boolean;
}

export default function AnalyticsSyncButton({ hasPublishedPosts }: SyncButtonProps) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [step, setStep] = useState<string>("");

    const handleSync = async () => {
        setIsSyncing(true);
        setStep("Importing posts...");

        try {
            // Step 1: Import all posts from Threads (including ones not made via Aeden)
            const importRes = await fetch("/api/posts/sync-posts", { method: "POST" });
            const importData = await importRes.json();

            if (!importRes.ok) {
                throw new Error(importData.error || "Failed to import posts");
            }

            if (importData.imported > 0) {
                toast.success(`Imported ${importData.imported} new post${importData.imported > 1 ? "s" : ""} from Threads`, {
                    description: "Now syncing engagement data...",
                    icon: <Download className="h-4 w-4 text-blue-500" />,
                });
            }

            // Step 2: Sync engagement for all posts
            setStep("Syncing engagement...");
            const syncRes = await fetch("/api/posts/sync-engagement", { method: "POST" });
            const syncData = await syncRes.json();

            if (!syncRes.ok) {
                throw new Error(syncData.error || "Engagement sync failed");
            }

            // Summarise results
            const parts: string[] = [];
            if (importData.imported > 0) parts.push(`${importData.imported} posts imported`);
            if (syncData.synced > 0) parts.push(`${syncData.synced} posts updated`);

            if (parts.length > 0) {
                toast.success("Sync complete", {
                    description: parts.join(" · "),
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                });
                window.location.reload();
            } else {
                toast.info("Everything is already up to date.");
            }

        } catch (error: any) {
            toast.error("Sync failed", {
                description: error.message,
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
            });
        } finally {
            setIsSyncing(false);
            setStep("");
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
            {isSyncing ? step || "Syncing..." : "Sync Engagement"}
        </Button>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SyncButtonProps {
    hasPublishedPosts: boolean;
    lastSynced?: string | null;
}

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = "aeden_last_sync";

export default function AnalyticsSyncButton({ hasPublishedPosts, lastSynced }: SyncButtonProps) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [step, setStep] = useState<string>("");
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    // Check cooldown on mount
    useEffect(() => {
        const lastSync = localStorage.getItem(STORAGE_KEY);
        if (lastSync) {
            const elapsed = Date.now() - parseInt(lastSync, 10);
            if (elapsed < COOLDOWN_MS) {
                setCooldownRemaining(Math.ceil((COOLDOWN_MS - elapsed) / 1000));
            }
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        if (cooldownRemaining <= 0) return;
        const timer = setInterval(() => {
            setCooldownRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldownRemaining]);

    const handleSync = async () => {
        if (cooldownRemaining > 0) {
            toast.info(`Please wait ${formatCooldown(cooldownRemaining)} before syncing again.`);
            return;
        }

        setIsSyncing(true);
        setStep("Checking for new posts...");

        try {
            // Step 1: Import any new posts
            const importRes = await fetch("/api/posts/sync-posts", { method: "POST" });
            const importData = await importRes.json();

            if (!importRes.ok && importData.error !== "No active Threads account connected") {
                throw new Error(importData.error || "Failed to import posts");
            }

            if (importData.imported > 0) {
                toast.success(`Found ${importData.imported} new post${importData.imported > 1 ? "s" : ""}!`);
            }

            // Step 2: Sync engagement for recent posts
            setStep("Updating engagement...");
            const syncRes = await fetch("/api/posts/sync-engagement", { method: "POST" });
            const syncData = await syncRes.json();

            if (!syncRes.ok) {
                throw new Error(syncData.error || "Engagement sync failed");
            }

            // Set cooldown
            localStorage.setItem(STORAGE_KEY, String(Date.now()));
            setCooldownRemaining(Math.ceil(COOLDOWN_MS / 1000));

            const parts: string[] = [];
            if (importData.imported > 0) parts.push(`${importData.imported} imported`);
            if (syncData.synced > 0) parts.push(`${syncData.synced} updated`);

            if (parts.length > 0) {
                toast.success("Refresh complete", {
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

    const buttonLabel = isSyncing
        ? step
        : cooldownRemaining > 0
            ? `Synced · ${formatCooldown(cooldownRemaining)}`
            : "Refresh Data";

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing || cooldownRemaining > 0}
            id="sync-analytics-btn"
            className="flex items-center gap-2"
        >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {buttonLabel}
        </Button>
    );
}

function formatCooldown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

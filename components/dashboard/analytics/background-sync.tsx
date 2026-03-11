"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Invisible component that checks for new Threads posts and stale engagement data.
 * Runs silently in the background on page load. Uses router.refresh() to update
 * the UI seamlessly without a hard reload or losing scroll position.
 */
export default function BackgroundPostSync() {
    const hasRun = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        async function silentSync() {
            try {
                let shouldRefresh = false;

                // 1. Quick sync: Check for entirely new posts
                const postRes = await fetch("/api/posts/sync-posts?quick=true", { method: "POST" });
                const postData = await postRes.json();
                if (postData.imported > 0) {
                    console.log(`📥 Background: Imported ${postData.imported} new post(s)`);
                    shouldRefresh = true;
                }

                // 2. Engagement sync: Update stale posts (>6 hours old)
                const engRes = await fetch("/api/posts/sync-engagement?auto=true", { method: "POST" });
                const engData = await engRes.json();
                if (engData.synced > 0) {
                    console.log(`🔄 Background: Synced engagement for ${engData.synced} stale post(s)`);
                    shouldRefresh = true;
                }

                // If any data changed in the DB, tell Next.js to quietly re-fetch the server data
                if (shouldRefresh) {
                    router.refresh();
                }
            } catch {
                // Silently fail — this is a background optimization, no UI errors needed
            }
        }

        // Small delay so it doesn't compete with initial page render resources
        const timer = setTimeout(silentSync, 2000);
        return () => clearTimeout(timer);
    }, [router]);

    return null;
}

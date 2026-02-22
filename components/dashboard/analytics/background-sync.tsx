"use client";

import { useEffect, useRef } from "react";

/**
 * Invisible component that checks for new Threads posts when the page loads.
 * Only fetches the most recent posts and imports any new ones silently.
 * Runs once per page load, no UI — just background work.
 */
export default function BackgroundPostSync() {
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        async function checkForNewPosts() {
            try {
                const res = await fetch("/api/posts/sync-posts?quick=true", {
                    method: "POST",
                });
                const data = await res.json();

                if (data.imported > 0) {
                    console.log(`📥 Background: Imported ${data.imported} new post(s) from Threads`);
                }
            } catch {
                // Silently fail — this is a background optimization
            }
        }

        // Small delay so it doesn't block the initial page render
        const timer = setTimeout(checkForNewPosts, 2000);
        return () => clearTimeout(timer);
    }, []);

    return null; // No UI
}

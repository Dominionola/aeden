"use client";

import { useState, useMemo } from "react";
import { Heart, Eye, MessageCircle, Share2, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

/* ───── Types ───── */

interface PostData {
    id: string;
    content: string;
    likes: number | null;
    comments: number | null;
    shares: number | null;
    impressions: number | null;
    published_at: string | null;
}

type SortKey = "likes" | "impressions" | "comments" | "shares" | "engagement";

interface SortOption {
    key: SortKey;
    label: string;
}

const SORT_OPTIONS: SortOption[] = [
    { key: "likes", label: "Likes" },
    { key: "impressions", label: "Views" },
    { key: "comments", label: "Replies" },
    { key: "shares", label: "Reposts & Quotes" },
    { key: "engagement", label: "Total Engagement" },
];

/* ───── Helpers ───── */

function getEngagement(p: PostData): number {
    return (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0);
}

function getSortValue(p: PostData, key: SortKey): number {
    switch (key) {
        case "likes": return p.likes ?? 0;
        case "impressions": return p.impressions ?? 0;
        case "comments": return p.comments ?? 0;
        case "shares": return p.shares ?? 0;
        case "engagement": return getEngagement(p);
    }
}

function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

/* ───── Component ───── */

export default function PostAnalyticsList({ posts }: { posts: PostData[] }) {
    const [sortBy, setSortBy] = useState<SortKey>("likes");

    const sortedPosts = useMemo(
        () => [...posts].sort((a, b) => getSortValue(b, sortBy) - getSortValue(a, sortBy)),
        [posts, sortBy]
    );

    if (posts.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <Eye className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No published posts yet.</p>
                <p className="text-xs mt-1">Publish a post to see your analytics here.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                    {posts.length} post{posts.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortKey)}
                        className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Scrollable Post List */}
            <div className="max-h-[480px] overflow-y-auto pr-1 -mr-1 scrollbar-thin">
                <div className="divide-y divide-gray-100">
                    {sortedPosts.map((post, idx) => (
                        <div
                            key={post.id}
                            className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                        >
                            <span className="text-lg font-bold text-gray-900 w-6 shrink-0 mt-0.5 tabular-nums text-right">
                                {idx + 1}
                            </span>

                            {/* Content + Date */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 font-medium line-clamp-2 leading-relaxed">
                                    {post.content}
                                </p>
                                {post.published_at && (
                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                        {format(new Date(post.published_at), "MMM d, yyyy")}
                                    </p>
                                )}
                            </div>

                            {/* Metrics */}
                            <div className="flex items-center gap-3 shrink-0 text-sm">
                                <MetricPill
                                    icon={<Heart className="h-3.5 w-3.5" />}
                                    value={post.likes ?? 0}
                                    active={sortBy === "likes"}
                                    color="text-rose-600"
                                />
                                <MetricPill
                                    icon={<Eye className="h-3.5 w-3.5" />}
                                    value={post.impressions ?? 0}
                                    active={sortBy === "impressions"}
                                    color="text-blue-600"
                                />
                                <MetricPill
                                    icon={<MessageCircle className="h-3.5 w-3.5" />}
                                    value={post.comments ?? 0}
                                    active={sortBy === "comments"}
                                    color="text-violet-600"
                                />
                                <MetricPill
                                    icon={<Share2 className="h-3.5 w-3.5" />}
                                    value={post.shares ?? 0}
                                    active={sortBy === "shares"}
                                    color="text-amber-600"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ───── Metric Pill ───── */

function MetricPill({
    icon,
    value,
    active,
    color,
}: {
    icon: React.ReactNode;
    value: number;
    active: boolean;
    color: string;
}) {
    return (
        <span
            className={`flex items-center gap-1 font-medium transition-opacity ${active ? color : "text-gray-700"
                }`}
        >
            {icon}
            {fmt(value)}
        </span>
    );
}

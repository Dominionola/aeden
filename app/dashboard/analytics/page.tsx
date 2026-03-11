import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Heart, MessageCircle, Eye, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { formatDistanceToNow } from "date-fns";
import AnalyticsSyncButton from "@/components/dashboard/analytics/sync-button";
import BackgroundPostSync from "@/components/dashboard/analytics/background-sync";
import AnalyticsTabs from "@/components/dashboard/analytics/analytics-tabs";

export const metadata = {
    title: "Analytics | Aeden",
    description: "Track your Threads post performance and engagement metrics.",
};

export default async function AnalyticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Fetch all published posts with engagement data
    const { data: posts } = await supabase
        .from("posts")
        .select("id, content, likes, comments, shares, impressions, published_at, last_analytics_sync, platform_post_id")
        .eq("user_id", user.id)
        .eq("status", "published")
        .eq("platform", "threads")
        .order("published_at", { ascending: false });

    // Fetch total posts (all statuses)
    const { count: totalPosts } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

    const { count: publishedCount } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "published");

    const publishedPosts = posts ?? [];

    // Fetch follower snapshots for the chart (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const { data: followerSnapshots } = await supabase
        .from("follower_snapshots")
        .select("follower_count, snapshot_date")
        .eq("user_id", user.id)
        .gte("snapshot_date", ninetyDaysAgo.toISOString().split("T")[0])
        .order("snapshot_date", { ascending: true });

    // Compute totals
    const totalLikes = publishedPosts.reduce((sum, p) => sum + (p.likes ?? 0), 0);
    const totalComments = publishedPosts.reduce((sum, p) => sum + (p.comments ?? 0), 0);
    const totalShares = publishedPosts.reduce((sum, p) => sum + (p.shares ?? 0), 0);
    const totalImpressions = publishedPosts.reduce((sum, p) => sum + (p.impressions ?? 0), 0);
    const totalEngagements = totalLikes + totalComments + totalShares;
    const avgEngagementRate = totalImpressions > 0
        ? ((totalEngagements / totalImpressions) * 100).toFixed(1)
        : "0.0";

    const lastSynced = publishedPosts
        .filter(p => p.last_analytics_sync)
        .sort((a, b) => new Date(b.last_analytics_sync!).getTime() - new Date(a.last_analytics_sync!).getTime())[0]
        ?.last_analytics_sync;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Silent background sync for new posts */}
            <BackgroundPostSync />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">Analytics</h1>
                    <p className="text-muted-foreground">
                        {publishedCount ?? 0} published posts · {lastSynced
                            ? `Last synced ${formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}`
                            : "Never synced"}
                    </p>
                </div>
                <AnalyticsSyncButton hasPublishedPosts={(publishedCount ?? 0) > 0} />
            </div>

            {/* Stat Cards — Always visible above tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Impressions"
                    value={formatNumber(totalImpressions)}
                    icon={<Eye className="h-5 w-5 text-blue-500" />}
                    bg="bg-blue-50"
                />
                <StatCard
                    label="Total Likes"
                    value={formatNumber(totalLikes)}
                    icon={<Heart className="h-5 w-5 text-rose-500" />}
                    bg="bg-rose-50"
                />
                <StatCard
                    label="Total Replies"
                    value={formatNumber(totalComments)}
                    icon={<MessageCircle className="h-5 w-5 text-violet-500" />}
                    bg="bg-violet-50"
                />
                <StatCard
                    label="Avg Engagement"
                    value={`${avgEngagementRate}%`}
                    icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
                    bg="bg-emerald-50"
                    subtitle="likes + replies + shares / views"
                />
            </div>

            {/* Tabbed Content */}
            <AnalyticsTabs
                publishedPosts={publishedPosts}
                followerSnapshots={followerSnapshots ?? []}
                totalPosts={totalPosts ?? 0}
                publishedCount={publishedCount ?? 0}
                totalLikes={totalLikes}
                totalComments={totalComments}
                totalShares={totalShares}
                totalImpressions={totalImpressions}
            />
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    bg,
    subtitle,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    bg: string;
    subtitle?: string;
}) {
    return (
        <Card className="shadow-sm">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                        <p className="text-3xl font-bold tabular-nums text-gray-900">{value}</p>
                        {subtitle && (
                            <p className="text-[11px] text-gray-400 mt-1 leading-tight">{subtitle}</p>
                        )}
                    </div>
                    <div className={`p-2.5 rounded-xl ${bg}`}>{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

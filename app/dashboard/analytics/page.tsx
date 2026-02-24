import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BarChart3, Heart, MessageCircle, Eye, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatDistanceToNow } from "date-fns";
import AnalyticsSyncButton from "@/components/dashboard/analytics/sync-button";
import EngagementChart from "@/components/dashboard/analytics/engagement-chart";
import BackgroundPostSync from "@/components/dashboard/analytics/background-sync";
import PostAnalyticsList from "@/components/dashboard/analytics/post-analytics-list";

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

    const hasThreadsConnected = publishedPosts.some(p => p.platform_post_id);

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

            {/* Stat Cards */}
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

            {/* Performance Chart — Full Width */}
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                        Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {publishedPosts.length > 0 ? (
                        <EngagementChart posts={publishedPosts.map(p => ({
                            published_at: p.published_at,
                            likes: p.likes,
                            comments: p.comments,
                            shares: p.shares,
                            impressions: p.impressions,
                        }))} />
                    ) : (
                        <EmptyChartState />
                    )}
                </CardContent>
            </Card>

            {/* Overview — Horizontal Grid */}
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <OverviewStat label="Total Posts" value={totalPosts ?? 0} color="text-gray-900" />
                        <OverviewStat label="Published" value={publishedCount ?? 0} color="text-gray-900" />
                        <OverviewStat label="Total Likes" value={formatNumber(totalLikes)} color="text-rose-600" />
                        <OverviewStat label="Total Replies" value={formatNumber(totalComments)} color="text-violet-600" />
                        <OverviewStat label="Reposts + Quotes" value={formatNumber(totalShares)} color="text-amber-600" />
                        <OverviewStat label="Total Views" value={formatNumber(totalImpressions)} color="text-blue-600" />
                    </div>
                </CardContent>
            </Card>

            {/* Post Analytics List — Sortable & Scrollable */}
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        Post Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <PostAnalyticsList posts={publishedPosts} />
                </CardContent>
            </Card>
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
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
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

function OverviewStat({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
        <div className="text-center py-2">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function EmptyChartState() {
    return (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <BarChart3 className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">No data yet</p>
            <p className="text-xs mt-1">Publish posts and sync to see your chart</p>
        </div>
    );
}

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BarChart3, Heart, MessageCircle, Eye, Share2, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format, subDays } from "date-fns";
import AnalyticsSyncButton from "@/components/dashboard/analytics/sync-button";
import EngagementChart from "@/components/dashboard/analytics/engagement-chart";

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

    // Top 5 posts by likes
    const topPosts = [...publishedPosts]
        .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
        .slice(0, 5);

    // Chart data — last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        const dateStr = format(date, "yyyy-MM-dd");
        const dayPosts = publishedPosts.filter(p =>
            p.published_at && p.published_at.startsWith(dateStr)
        );
        return {
            date: format(date, "MMM d"),
            likes: dayPosts.reduce((s, p) => s + (p.likes ?? 0), 0),
            impressions: dayPosts.reduce((s, p) => s + (p.impressions ?? 0), 0),
            posts: dayPosts.length,
        };
    });

    const lastSynced = publishedPosts
        .filter(p => p.last_analytics_sync)
        .sort((a, b) => new Date(b.last_analytics_sync!).getTime() - new Date(a.last_analytics_sync!).getTime())[0]
        ?.last_analytics_sync;

    const hasThreadsConnected = publishedPosts.some(p => p.platform_post_id);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
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

            {/* Chart + Top Posts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Engagement Chart */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            Likes · Last 30 Days
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {publishedPosts.length > 0 ? (
                            <EngagementChart data={last30Days} />
                        ) : (
                            <EmptyChartState />
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Total Posts</span>
                            <span className="font-semibold text-gray-900">{totalPosts ?? 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Published</span>
                            <span className="font-semibold text-gray-900">{publishedCount ?? 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Total Likes</span>
                            <span className="font-semibold text-rose-600">{formatNumber(totalLikes)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Total Replies</span>
                            <span className="font-semibold text-violet-600">{formatNumber(totalComments)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Reposts + Quotes</span>
                            <span className="font-semibold text-gray-900">{formatNumber(totalShares)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-600">Total Views</span>
                            <span className="font-semibold text-blue-600">{formatNumber(totalImpressions)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Posts Table */}
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        Top Performing Posts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {topPosts.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {topPosts.map((post, idx) => (
                                <div key={post.id} className="flex items-start gap-4 py-4">
                                    <span className="text-xl font-bold text-gray-200 w-6 shrink-0 mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                                            {post.content}
                                        </p>
                                        {post.published_at && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {format(new Date(post.published_at), "MMM d, yyyy")}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 text-sm">
                                        <span className="flex items-center gap-1 text-rose-600 font-medium">
                                            <Heart className="h-3.5 w-3.5" />
                                            {post.likes ?? 0}
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-500">
                                            <Eye className="h-3.5 w-3.5" />
                                            {formatNumber(post.impressions ?? 0)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No published posts yet.</p>
                            <p className="text-xs mt-1">Publish a post to see your analytics here.</p>
                        </div>
                    )}
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

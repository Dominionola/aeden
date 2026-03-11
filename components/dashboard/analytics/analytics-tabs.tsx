"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Zap, TrendingUp } from "lucide-react";
import EngagementChart from "./engagement-chart";
import PostAnalyticsList from "./post-analytics-list";
import StrategyInsights from "./strategy-insights";
import WeeklyGoals from "./weekly-goals";

interface AnalyticsTabsProps {
    publishedPosts: any[];
    followerSnapshots: any[];
    totalPosts: number;
    publishedCount: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalImpressions: number;
}

export default function AnalyticsTabs({
    publishedPosts,
    followerSnapshots,
    totalPosts,
    publishedCount,
    totalLikes,
    totalComments,
    totalShares,
    totalImpressions,
}: AnalyticsTabsProps) {
    return (
        <Tabs defaultValue="overview" className="w-full space-y-6">
            <TabsList variant="line" className="w-full justify-start border-b border-gray-200 rounded-none bg-transparent h-auto p-0 gap-8">
                <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:text-blue-600 data-[state=active]:after:bg-blue-600 py-3 px-1 text-sm font-medium transition-colors"
                >
                    Overview
                </TabsTrigger>
                <TabsTrigger 
                    value="performance" 
                    className="data-[state=active]:text-blue-600 data-[state=active]:after:bg-blue-600 py-3 px-1 text-sm font-medium transition-colors"
                >
                    Performance
                </TabsTrigger>
                <TabsTrigger 
                    value="posts" 
                    className="data-[state=active]:text-blue-600 data-[state=active]:after:bg-blue-600 py-3 px-1 text-sm font-medium transition-colors"
                >
                    Posts
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
                {/* AI Advisor - Strategy */}
                <StrategyInsights posts={publishedPosts} />

                {/* Weekly Goals */}
                <WeeklyGoals posts={publishedPosts} />

                {/* Overview Stat Grid */}
                <Card className="shadow-sm border-gray-200 overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            <OverviewStat label="Total Posts" value={totalPosts} color="text-gray-900" />
                            <OverviewStat label="Published" value={publishedCount} color="text-gray-900" />
                            <OverviewStat label="Total Likes" value={formatNumber(totalLikes)} color="text-rose-600" />
                            <OverviewStat label="Total Replies" value={formatNumber(totalComments)} color="text-violet-600" />
                            <OverviewStat label="Reposts" value={formatNumber(totalShares)} color="text-amber-600" />
                            <OverviewStat label="Total Views" value={formatNumber(totalImpressions)} color="text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6 focus-visible:outline-none">
                <Card className="shadow-sm border-gray-200 overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            Performance Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {publishedPosts.length > 0 ? (
                            <EngagementChart
                                posts={publishedPosts.map(p => ({
                                    published_at: p.published_at,
                                    likes: p.likes,
                                    comments: p.comments,
                                    shares: p.shares,
                                    impressions: p.impressions,
                                }))}
                                followerSnapshots={followerSnapshots}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <BarChart3 className="h-10 w-10 mb-3 opacity-30" />
                                <p className="text-sm">No performance data yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="posts" className="space-y-6 focus-visible:outline-none">
                <Card className="shadow-sm border-gray-200 overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            Post Engagement Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PostAnalyticsList posts={publishedPosts} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
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

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

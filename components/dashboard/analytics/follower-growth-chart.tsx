"use client";

import { useState, useEffect, useCallback } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
} from "recharts";
import { format } from "date-fns";
import { UserPlus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

/* ───── Types ───── */

interface Snapshot {
    follower_count: number;
    snapshot_date: string;
}

interface ChartPoint {
    date: string;
    label: string;
    followers: number;
    delta: number;
    hasPost?: boolean;
}

interface FollowerGrowthChartProps {
    postDates: string[]; // ISO dates of published posts for markers
}

/* ───── Helpers ───── */

function formatAxisValue(v: number): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return String(v);
}

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

const TIME_RANGES = [
    { days: 7, label: "7D" },
    { days: 14, label: "14D" },
    { days: 30, label: "30D" },
    { days: 60, label: "60D" },
    { days: 90, label: "90D" },
];

/* ───── Tooltip ───── */

function FollowerTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const point = payload[0]?.payload as ChartPoint;
    if (!point) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm min-w-[160px]">
            <p className="font-semibold text-gray-900 mb-1">{point.label}</p>
            <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Followers</span>
                <span className="font-medium text-gray-900">
                    {point.followers.toLocaleString()}
                </span>
            </div>
            {point.delta !== 0 && (
                <div className="flex items-center justify-between gap-4 mt-0.5">
                    <span className="text-gray-500">Change</span>
                    <span
                        className={`font-medium ${point.delta > 0 ? "text-emerald-600" : "text-red-500"
                            }`}
                    >
                        {point.delta > 0 ? "+" : ""}
                        {point.delta.toLocaleString()}
                    </span>
                </div>
            )}
            {point.hasPost && (
                <p className="text-xs text-blue-500 mt-1.5 border-t border-gray-100 pt-1.5">
                    📝 Posted on this day
                </p>
            )}
        </div>
    );
}

/* ───── Component ───── */

export default function FollowerGrowthChart({ postDates }: FollowerGrowthChartProps) {
    const [selectedDays, setSelectedDays] = useState(30);
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSnapshots = useCallback(async (days: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/analytics/followers?days=${days}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch");
            setSnapshots(data.snapshots ?? []);
        } catch (err: any) {
            setError(err.message);
            setSnapshots([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSnapshots(selectedDays);
    }, [selectedDays, fetchSnapshots]);

    // Build chart data with daily deltas
    const postDateSet = new Set(postDates.map((d) => d?.split("T")[0]));

    const chartData: ChartPoint[] = snapshots.map((s, i) => ({
        date: s.snapshot_date,
        label: format(new Date(s.snapshot_date + "T00:00:00"), "MMM d"),
        followers: s.follower_count,
        delta: i > 0 ? s.follower_count - snapshots[i - 1].follower_count : 0,
        hasPost: postDateSet.has(s.snapshot_date),
    }));

    // Compute summary stats
    const currentCount = snapshots.length > 0 ? snapshots[snapshots.length - 1].follower_count : 0;
    const firstCount = snapshots.length > 0 ? snapshots[0].follower_count : 0;
    const periodChange = currentCount - firstCount;
    const isGrowing = periodChange >= 0;

    // Find post marker points for ReferenceDots
    const postMarkers = chartData.filter((p) => p.hasPost);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Loading follower data…</span>
            </div>
        );
    }

    if (error || snapshots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <UserPlus className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">No follower data yet</p>
                <p className="text-xs mt-1">
                    Click &quot;Sync Analytics&quot; to start tracking your follower growth
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Header: count + change + time pills */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {formatCount(currentCount)}
                        </span>
                        <span className="text-sm text-gray-500">followers</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                        {isGrowing ? (
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span
                            className={`text-sm font-medium ${isGrowing ? "text-emerald-600" : "text-red-500"
                                }`}
                        >
                            {periodChange > 0 ? "+" : ""}
                            {formatCount(periodChange)}
                        </span>
                        <span className="text-xs text-gray-400">this period</span>
                    </div>
                </div>

                {/* Time range pills */}
                <div className="flex gap-1">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range.days}
                            onClick={() => setSelectedDays(range.days)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${selectedDays === range.days
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatAxisValue}
                        domain={["dataMin - 10", "dataMax + 10"]}
                    />
                    <Tooltip content={<FollowerTooltip />} />
                    <Area
                        type="linear"
                        dataKey="followers"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#followerGradient)"
                        dot={false}
                        activeDot={{ r: 4, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                    />
                    {/* Post day markers */}
                    {postMarkers.map((marker) => (
                        <ReferenceDot
                            key={marker.date}
                            x={marker.label}
                            y={marker.followers}
                            r={4}
                            fill="#3b82f6"
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full inline-block" />
                    Follower count
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
                    Post published
                </div>
            </div>
        </div>
    );
}

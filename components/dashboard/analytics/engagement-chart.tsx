"use client";

import { useState, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";

/* ───── Types ───── */

export interface PostDataPoint {
    published_at: string | null;
    likes: number | null;
    comments: number | null;
    shares: number | null;
    impressions: number | null;
}

type MetricKey = "likes" | "replies" | "views" | "reposts" | "engagement";

interface MetricOption {
    key: MetricKey;
    label: string;
    color: string;
    gradientId: string;
    /** Maps the raw PostDataPoint fields into a single number */
    getValue: (p: PostDataPoint) => number;
}

const METRICS: MetricOption[] = [
    {
        key: "likes",
        label: "Likes",
        color: "#e11d48",       // rose-600
        gradientId: "likesG",
        getValue: (p) => p.likes ?? 0,
    },
    {
        key: "replies",
        label: "Replies",
        color: "#8b5cf6",       // violet-500
        gradientId: "repliesG",
        getValue: (p) => p.comments ?? 0,
    },
    {
        key: "views",
        label: "Views",
        color: "#3b82f6",       // blue-500
        gradientId: "viewsG",
        getValue: (p) => p.impressions ?? 0,
    },
    {
        key: "reposts",
        label: "Reposts & Quotes",
        color: "#f59e0b",       // amber-500
        gradientId: "repostsG",
        getValue: (p) => p.shares ?? 0,
    },
    {
        key: "engagement",
        label: "Total Engagement",
        color: "#22c55e",       // green-500
        gradientId: "engagementG",
        getValue: (p) => (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
    },
];

const TIME_RANGES = [
    { days: 7, label: "7D" },
    { days: 14, label: "14D" },
    { days: 21, label: "21D" },
    { days: 30, label: "30D" },
    { days: 60, label: "60D" },
    { days: 90, label: "90D" },
];

/* ───── Component ───── */

interface EngagementChartProps {
    posts: PostDataPoint[];
}

export default function EngagementChart({ posts }: EngagementChartProps) {
    const [selectedMetric, setSelectedMetric] = useState<MetricKey>("likes");
    const [selectedDays, setSelectedDays] = useState(30);

    const metric = METRICS.find((m) => m.key === selectedMetric)!;

    // Aggregate posts into daily buckets based on selected metric + range
    const chartData = useMemo(() => {
        return Array.from({ length: selectedDays }, (_, i) => {
            const date = subDays(new Date(), selectedDays - 1 - i);
            const dateStr = format(date, "yyyy-MM-dd");

            const dayPosts = posts.filter(
                (p) => p.published_at && p.published_at.startsWith(dateStr)
            );

            return {
                date: format(date, "MMM d"),
                value: dayPosts.reduce((sum, p) => sum + metric.getValue(p), 0),
            };
        });
    }, [posts, selectedMetric, selectedDays, metric]);

    // Adaptive tick spacing based on range
    const tickInterval = selectedDays <= 14 ? 1 : selectedDays <= 30 ? 4 : selectedDays <= 60 ? 7 : 10;

    return (
        <div>
            {/* Controls row */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                {/* Metric dropdown */}
                <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as MetricKey)}
                    className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                >
                    {METRICS.map((m) => (
                        <option key={m.key} value={m.key}>
                            {m.label}
                        </option>
                    ))}
                </select>

                {/* Time range pills */}
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range.days}
                            onClick={() => setSelectedDays(range.days)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all ${selectedDays === range.days
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id={metric.gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metric.color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={false}
                        interval={tickInterval}
                    />

                    <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) =>
                            v >= 1_000_000
                                ? `${(v / 1_000_000).toFixed(1)}M`
                                : v >= 1_000
                                    ? `${(v / 1_000).toFixed(1)}K`
                                    : String(v)
                        }
                    />

                    <Tooltip content={<ChartTooltip metricLabel={metric.label} color={metric.color} />} />

                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={metric.color}
                        strokeWidth={2}
                        fill={`url(#${metric.gradientId})`}
                        dot={false}
                        activeDot={{ r: 4, fill: metric.color, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ───── Tooltip ───── */

function ChartTooltip({ active, payload, label, metricLabel, color }: any) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
            <p className="font-semibold text-gray-900 mb-1">{label}</p>
            <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">{metricLabel}</span>
                <span className="font-medium" style={{ color }}>
                    {payload[0].value.toLocaleString()}
                </span>
            </div>
        </div>
    );
}

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
    Legend,
} from "recharts";
import { format, subDays } from "date-fns";
import { GitCompareArrows, X } from "lucide-react";

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
    getValue: (p: PostDataPoint) => number;
}

const METRICS: MetricOption[] = [
    {
        key: "likes",
        label: "Likes",
        color: "#e11d48",
        gradientId: "likesG",
        getValue: (p) => p.likes ?? 0,
    },
    {
        key: "replies",
        label: "Replies",
        color: "#8b5cf6",
        gradientId: "repliesG",
        getValue: (p) => p.comments ?? 0,
    },
    {
        key: "views",
        label: "Views",
        color: "#3b82f6",
        gradientId: "viewsG",
        getValue: (p) => p.impressions ?? 0,
    },
    {
        key: "reposts",
        label: "Reposts & Quotes",
        color: "#f59e0b",
        gradientId: "repostsG",
        getValue: (p) => p.shares ?? 0,
    },
    {
        key: "engagement",
        label: "Total Engagement",
        color: "#22c55e",
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

function formatAxisValue(v: number): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return String(v);
}

/* ───── Component ───── */

interface EngagementChartProps {
    posts: PostDataPoint[];
}

export default function EngagementChart({ posts }: EngagementChartProps) {
    const [primaryMetric, setPrimaryMetric] = useState<MetricKey>("likes");
    const [compareMetric, setCompareMetric] = useState<MetricKey | null>(null);
    const [selectedDays, setSelectedDays] = useState(30);

    const primary = METRICS.find((m) => m.key === primaryMetric)!;
    const compare = compareMetric ? METRICS.find((m) => m.key === compareMetric)! : null;
    const isComparing = compare !== null;

    // Build chart data with primary + optional compare values
    const chartData = useMemo(() => {
        return Array.from({ length: selectedDays }, (_, i) => {
            const date = subDays(new Date(), selectedDays - 1 - i);
            const dateStr = format(date, "yyyy-MM-dd");

            const dayPosts = posts.filter(
                (p) => p.published_at && p.published_at.startsWith(dateStr)
            );

            const point: Record<string, string | number> = {
                date: format(date, "MMM d"),
                primary: dayPosts.reduce((sum, p) => sum + primary.getValue(p), 0),
            };

            if (compare) {
                point.compare = dayPosts.reduce((sum, p) => sum + compare.getValue(p), 0);
            }

            return point;
        });
    }, [posts, primaryMetric, compareMetric, selectedDays, primary, compare]);

    const tickInterval = selectedDays <= 14 ? 1 : selectedDays <= 30 ? 4 : selectedDays <= 60 ? 7 : 10;

    const handleToggleCompare = () => {
        if (isComparing) {
            setCompareMetric(null);
        } else {
            // Default the second metric to something different
            const defaultCompare = METRICS.find((m) => m.key !== primaryMetric)!;
            setCompareMetric(defaultCompare.key);
        }
    };

    return (
        <div>
            {/* Controls row */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                {/* Left: metric selectors + compare toggle */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Primary metric */}
                    <select
                        value={primaryMetric}
                        onChange={(e) => {
                            const val = e.target.value as MetricKey;
                            setPrimaryMetric(val);
                            if (val === compareMetric) setCompareMetric(null);
                        }}
                        className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                    >
                        {METRICS.map((m) => (
                            <option key={m.key} value={m.key}>
                                {m.label}
                            </option>
                        ))}
                    </select>

                    {/* Compare toggle */}
                    <button
                        onClick={handleToggleCompare}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${isComparing
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        {isComparing ? (
                            <X className="h-3.5 w-3.5" />
                        ) : (
                            <GitCompareArrows className="h-3.5 w-3.5" />
                        )}
                        {isComparing ? "Remove" : "Compare"}
                    </button>

                    {/* Compare metric dropdown (only visible when comparing) */}
                    {isComparing && (
                        <>
                            <span className="text-xs text-gray-400">vs</span>
                            <select
                                value={compareMetric ?? ""}
                                onChange={(e) => setCompareMetric(e.target.value as MetricKey)}
                                className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                            >
                                {METRICS.filter((m) => m.key !== primaryMetric).map((m) => (
                                    <option key={m.key} value={m.key}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                </div>

                {/* Right: time range pills */}
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

            {/* Legend when comparing */}
            {isComparing && compare && (
                <div className="flex items-center gap-4 mb-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: primary.color }} />
                        <span className="text-gray-600">{primary.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: compare.color }} />
                        <span className="text-gray-600">{compare.label}</span>
                    </div>
                </div>
            )}

            {/* Chart */}
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: isComparing ? 10 : 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id={`${primary.gradientId}_p`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={primary.color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={primary.color} stopOpacity={0} />
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

                    {/* Left Y-axis — Primary metric */}
                    <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: primary.color }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatAxisValue}
                    />

                    {/* Right Y-axis — Compare metric (only when comparing) */}
                    {isComparing && (
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 11, fill: compare!.color }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatAxisValue}
                        />
                    )}

                    <Tooltip
                        content={
                            <CompareTooltip
                                primaryLabel={primary.label}
                                primaryColor={primary.color}
                                compareLabel={compare?.label}
                                compareColor={compare?.color}
                            />
                        }
                    />

                    {isComparing ? (
                        <>
                            {/* Compare mode: no fills, just clean lines. Render both so they're both visible */}
                            <Area
                                type="linear"
                                dataKey="primary"
                                yAxisId="left"
                                name={primary.label}
                                stroke={primary.color}
                                strokeWidth={2.5}
                                fill="none"
                                dot={false}
                                activeDot={{ r: 4, fill: primary.color, strokeWidth: 0 }}
                            />
                            <Area
                                type="linear"
                                dataKey="compare"
                                yAxisId="right"
                                name={compare!.label}
                                stroke={compare!.color}
                                strokeWidth={2.5}
                                fill="none"
                                dot={false}
                                activeDot={{ r: 4, fill: compare!.color, strokeWidth: 0 }}
                            />
                        </>
                    ) : (
                        /* Single mode: area fill with gradient */
                        <Area
                            type="linear"
                            dataKey="primary"
                            yAxisId="left"
                            name={primary.label}
                            stroke={primary.color}
                            strokeWidth={2}
                            fill={`url(#${primary.gradientId}_p)`}
                            dot={false}
                            activeDot={{ r: 4, fill: primary.color, strokeWidth: 0 }}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ───── Compare Tooltip ───── */

function CompareTooltip({
    active,
    payload,
    label,
    primaryLabel,
    primaryColor,
    compareLabel,
    compareColor,
}: any) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm min-w-[140px]">
            <p className="font-semibold text-gray-900 mb-2">{label}</p>
            {payload.map((entry: any, idx: number) => {
                const isCompare = entry.dataKey === "compare";
                const entryLabel = isCompare ? compareLabel : primaryLabel;
                const entryColor = isCompare ? compareColor : primaryColor;
                return (
                    <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entryColor }}
                            />
                            <span className="text-gray-500">{entryLabel}</span>
                        </div>
                        <span className="font-medium" style={{ color: entryColor }}>
                            {entry.value.toLocaleString()}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

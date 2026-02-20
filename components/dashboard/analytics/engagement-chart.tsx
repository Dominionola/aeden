"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
    date: string;
    likes: number;
    impressions: number;
    posts: number;
}

interface EngagementChartProps {
    data: ChartDataPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
            <p className="font-semibold text-gray-900 mb-2">{label}</p>
            {payload.map((entry: any) => (
                <div key={entry.name} className="flex items-center justify-between gap-4">
                    <span className="text-gray-500 capitalize">{entry.name}</span>
                    <span className="font-medium" style={{ color: entry.color }}>
                        {entry.value.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function EngagementChart({ data }: EngagementChartProps) {
    // Only show every 5th label to avoid crowding
    const tickFormatter = (value: string, index: number) =>
        index % 5 === 0 ? value : "";

    return (
        <ResponsiveContainer width="100%" height={220}>
            <AreaChart
                data={data}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={tickFormatter}
                />

                <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                    type="monotone"
                    dataKey="likes"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#likesGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

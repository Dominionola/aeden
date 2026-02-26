"use client";

import { useState, useEffect } from "react";
import { Calendar, RefreshCw, AlertCircle, Target } from "lucide-react";

interface Goal {
    label: string;
    current: number;
    target: number;
    unit: string;
}

interface WeeklyGoalsData {
    weekLabel: string;
    goals: Goal[];
    weeklyFocus: string;
}

function getProgressColor(pct: number) {
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 50) return "bg-amber-400";
    return "bg-gray-300";
}

function getProgressBg(pct: number) {
    if (pct >= 80) return "bg-emerald-50";
    if (pct >= 50) return "bg-amber-50";
    return "bg-gray-100";
}

export default function WeeklyGoals({ posts }: { posts: any[] }) {
    const [data, setData] = useState<WeeklyGoalsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGoals = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/analytics/weekly-goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ posts }),
            });
            if (!res.ok) throw new Error("Failed to load goals");
            const json = await res.json();
            if (json.error) {
                setError(json.error);
            } else {
                setData(json);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (posts.length > 0) {
            fetchGoals();
        } else {
            setLoading(false);
            setError("Publish posts to start tracking weekly goals.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Target className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold tracking-tight text-gray-900">This Week&apos;s Goals</h2>
                        {data?.weekLabel && (
                            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3" />
                                {data.weekLabel}
                            </p>
                        )}
                    </div>
                </div>
                {!loading && data && (
                    <button
                        onClick={fetchGoals}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        title="Refresh Goals"
                        aria-label="Refresh weekly goals"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                            <div className="h-2.5 bg-gray-100 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <AlertCircle className="h-6 w-6 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">{error}</p>
                    {posts.length > 0 && (
                        <button
                            onClick={fetchGoals}
                            className="mt-3 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition-colors"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            ) : data ? (
                <div className="space-y-5">
                    {/* Goal rows */}
                    <div className="space-y-4">
                        {data.goals.map((goal, i) => {
                            const pct = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
                            return (
                                <div key={i}>
                                    <div className="flex items-baseline justify-between mb-1.5">
                                        <span className="text-sm font-medium text-gray-700">{goal.label}</span>
                                        <span className="text-xs tabular-nums text-gray-500">
                                            <span className="font-semibold text-gray-900">{goal.current}</span>
                                            <span className="text-gray-300 mx-0.5">/</span>
                                            {goal.target}{goal.unit !== "posts" ? goal.unit : ""}
                                        </span>
                                    </div>
                                    <div className={`h-2 rounded-full ${getProgressBg(pct)} overflow-hidden`}>
                                        <div
                                            className={`h-full rounded-full ${getProgressColor(pct)} transition-all duration-500 ease-out`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Weekly Focus */}
                    {data.weeklyFocus && (
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1">Weekly Focus</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{data.weeklyFocus}</p>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}

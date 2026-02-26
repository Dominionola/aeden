"use client";

import { useState, useEffect } from "react";
import { Sparkles, TrendingDown, Target, Zap, RefreshCw, AlertCircle } from "lucide-react";

interface InsightData {
    diagnosis: string;
    weakestMetric: string;
    fix: string;
}

export default function StrategyInsights({ posts }: { posts: any[] }) {
    const [data, setData] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStrategy = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/analytics/strategy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ posts }),
            });

            if (!res.ok) throw new Error("Failed to generate strategy");

            const json = await res.json();
            if (json.error || json.diagnosis === "Not enough data") {
                setError(json.error || json.fix);
            } else {
                setData(json);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (posts.length > 0) {
            fetchStrategy();
        } else {
            setLoading(false);
            setError("Publish a post to unlock AI growth strategy.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="bg-white border text-gray-900 border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group transition-all">
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-50 to-transparent rounded-full blur-3xl opacity-50 -z-10 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary-600" />
                    </div>
                    <h2 className="text-base font-semibold tracking-tight">Strategy Advisor</h2>
                </div>
                {!loading && data && (
                    <button
                        onClick={fetchStrategy}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        title="Regenerate Strategy"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-5 bg-gray-100 rounded w-3/4"></div>
                    <div className="flex gap-4">
                        <div className="h-24 bg-gray-100 rounded flex-1"></div>
                        <div className="h-24 bg-gray-100 rounded flex-1"></div>
                    </div>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <AlertCircle className="h-6 w-6 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">{error}</p>
                    {posts.length > 0 && (
                        <button
                            onClick={fetchStrategy}
                            className="mt-3 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            ) : data ? (
                <div className="space-y-6">
                    {/* Diagnosis */}
                    <div>
                        <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1.5 flex items-center gap-1.5">
                            <Target className="h-3 w-3" />
                            Current Standing
                        </p>
                        <p className="text-lg font-medium leading-snug tracking-tight text-gray-800">
                            {data.diagnosis}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Weakest Metric Box */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase flex items-center gap-1.5 mb-1.5">
                                <TrendingDown className="h-3 w-3 text-rose-500" />
                                Growth Bottleneck
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                                {data.weakestMetric}
                            </p>
                        </div>

                        {/* Actionable Fix Box */}
                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 rounded-full blur-2xl opacity-10 pointer-events-none" />
                            <p className="text-[11px] font-bold tracking-wider text-blue-600 uppercase flex items-center gap-1.5 mb-1.5 relative z-10">
                                <Zap className="h-3 w-3" />
                                Next Post Action
                            </p>
                            <p className="text-sm font-medium text-gray-800 leading-relaxed relative z-10">
                                {data.fix}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

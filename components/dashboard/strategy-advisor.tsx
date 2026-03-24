"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Target, Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StrategyInsight {
    winning_archetype: string;
    resonance_score: number;
    adjustment_tips: string[];
    weekly_goal: string;
}

interface StrategyAdvisorProps {
    initialStrategy?: StrategyInsight | null;
}

export function StrategyAdvisor({ initialStrategy }: StrategyAdvisorProps) {
    const [strategy, setStrategy] = useState<StrategyInsight | null>(initialStrategy || null);
    const [isLoading, setIsLoading] = useState(!initialStrategy);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchStrategy = async (sync = false) => {
        if (sync) setIsSyncing(true);
        try {
            const res = await fetch("/api/persona/strategy");
            const data = await res.json();
            if (res.ok) {
                setStrategy(data.strategy);
            }
        } catch (error) {
            console.error("Failed to fetch strategy", error);
        } finally {
            setIsLoading(false);
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (!initialStrategy) {
            fetchStrategy();
        }
    }, [initialStrategy]);

    if (isLoading) {
        return (
            <Card className="border-gray-100 shadow-sm animate-pulse">
                <CardContent className="p-6 h-[200px] flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-primary-400 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!strategy) return null;

    return (
        <Card className="border-none bg-gradient-to-br from-primary-50 via-white to-white shadow-lg shadow-primary-500/5 overflow-hidden group border-l-4 border-l-primary-500">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                        <Sparkles className="h-5 w-5 text-primary-500" />
                        AI Strategy Advisor
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary-100 text-primary-700 hover:bg-primary-100 border-none px-3">
                        {strategy.resonance_score}% Resonance
                    </Badge>
                </div>
                <CardDescription className="text-gray-500">
                    Growth delta based on your persona performance.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-3 bg-primary-500/5 rounded-xl border border-primary-100/50">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-3.5 w-3.5 text-primary-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600">Winning Archetype</span>
                    </div>
                    <p className="text-md font-bold text-primary-900">{strategy.winning_archetype}</p>
                </div>

                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Weekly Adjustments</h4>
                    <div className="space-y-1.5">
                        {strategy.adjustment_tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 group/item">
                                <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-primary-400 group-hover/item:text-primary-600 transition-colors" />
                                <span>{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-bold text-gray-900">Growth Goal</span>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                        "{strategy.weekly_goal}"
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchStrategy(true)}
                    disabled={isSyncing}
                    className="w-full text-primary-600 hover:bg-primary-50 hover:text-primary-700 h-9"
                >
                    {isSyncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Refresh Strategy
                </Button>
            </CardContent>
        </Card>
    );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileText, Github, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
    title: "Sources | Aeden",
    description: "Connect your work sources — GitHub, Notion, and more.",
};

const SOURCES = [
    {
        id: "github",
        name: "GitHub",
        description: "Auto-generate posts from commits, PRs, and releases.",
        icon: Github,
        color: "text-gray-900",
        bg: "bg-gray-100",
        status: "coming_soon",
    },
    {
        id: "notion",
        name: "Notion",
        description: "Turn your Notion pages and docs into shareable posts.",
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-50",
        status: "coming_soon",
    },
    {
        id: "manual",
        name: "Manual Input",
        description: "Write your own updates and let AI polish them for Threads.",
        icon: Layers,
        color: "text-violet-600",
        bg: "bg-violet-50",
        status: "active",
    },
];

export default async function SourcesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: workSources } = await supabase
        .from("work_sources")
        .select("*")
        .eq("user_id", user.id);

    const connectedIds = new Set((workSources ?? []).map((s: any) => s.source_type));

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">Sources</h1>
                <p className="text-muted-foreground">
                    Connect your work tools to automatically generate posts from your activity.
                </p>
            </div>

            <div className="grid gap-4">
                {SOURCES.map((source) => {
                    const Icon = source.icon;
                    const isConnected = connectedIds.has(source.id);
                    const isComingSoon = source.status === "coming_soon";

                    return (
                        <Card key={source.id} className="shadow-sm">
                            <CardContent className="flex items-center gap-5 pt-6">
                                <div className={`p-3 rounded-xl ${source.bg} shrink-0`}>
                                    <Icon className={`h-6 w-6 ${source.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                                        {isComingSoon && (
                                            <Badge variant="secondary" className="text-xs">Coming soon</Badge>
                                        )}
                                        {isConnected && (
                                            <Badge className="text-xs bg-emerald-100 text-emerald-700 border-none">Connected</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{source.description}</p>
                                </div>
                                {source.id === "manual" ? (
                                    <Link href="/dashboard/posts/new">
                                        <Button size="sm" variant="outline">Create Post</Button>
                                    </Link>
                                ) : (
                                    <Button size="sm" variant="outline" disabled={isComingSoon}>
                                        {isConnected ? "Manage" : "Connect"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MessageCircle, BookOpen, Zap } from "lucide-react";

export const metadata = {
    title: "Help | Aeden",
    description: "Get help with Aeden — docs, tips, and support.",
};

const QUICK_TIPS = [
    {
        title: "Publish your first post",
        description: "Go to Posts → Create Post, write what you're building, hit Generate, then Publish.",
        icon: Zap,
        bg: "bg-amber-50",
        color: "text-amber-500",
    },
    {
        title: "Connect Threads",
        description: "Go to Settings → Connections and connect your Threads account to start publishing.",
        icon: MessageCircle,
        bg: "bg-blue-50",
        color: "text-blue-500",
    },
    {
        title: "Set your Voice & Persona",
        description: "Go to Voice & Persona in Settings to customize your tone so AI posts sound like you.",
        icon: BookOpen,
        bg: "bg-violet-50",
        color: "text-violet-500",
    },
];

const RESOURCES = [
    {
        label: "Threads API Docs",
        url: "https://developers.facebook.com/docs/threads",
        description: "Official Threads developer documentation.",
    },
    {
        label: "Supabase Docs",
        url: "https://supabase.com/docs",
        description: "Authentication, database, and storage documentation.",
    },
    {
        label: "Next.js Docs",
        url: "https://nextjs.org/docs",
        description: "App Router, Server Components, and more.",
    },
];

export default async function HelpPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">Help</h1>
                <p className="text-muted-foreground">Quick tips and resources to get the most out of Aeden.</p>
            </div>

            {/* Quick Start */}
            <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Start</h2>
                <div className="grid gap-3">
                    {QUICK_TIPS.map((tip) => {
                        const Icon = tip.icon;
                        return (
                            <Card key={tip.title} className="shadow-sm">
                                <CardContent className="flex gap-4 pt-5 pb-5">
                                    <div className={`p-2.5 rounded-xl ${tip.bg} shrink-0 h-fit`}>
                                        <Icon className={`h-5 w-5 ${tip.color}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-0.5">{tip.title}</p>
                                        <p className="text-sm text-gray-500 leading-relaxed">{tip.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Resources */}
            <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Resources</h2>
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                    {RESOURCES.map((res) => (
                        <a
                            key={res.url}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
                        >
                            <div>
                                <p className="font-medium text-gray-900">{res.label}</p>
                                <p className="text-sm text-gray-500">{res.description}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
                        </a>
                    ))}
                </div>
            </div>

            {/* Version */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Aeden</span>
                <Badge variant="secondary" className="text-xs">v0.1.0</Badge>
                <span>·</span>
                <span>Built by @olatheruler</span>
            </div>
        </div>
    );
}

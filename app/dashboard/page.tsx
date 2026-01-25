import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    TrendingUp,
    TrendingDown,
    FileText,
    MoreHorizontal,
    Heart,
    MessageCircle,
    Eye,
    Link2,
    Plus,
    Sparkles,
    Send,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-6" style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h1>
                    <p className="text-gray-500 mt-1">Ready to share what you&apos;ve been building?</p>
                </div>
                <Link href="/dashboard/posts/new">
                    <Button size="lg" className="gap-2 bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25">
                        <Plus className="h-5 w-5" />
                        Create Post
                    </Button>
                </Link>
            </div>

            {/* Quick Stats Row - Aeden Relevant */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Posts This Week"
                    value="3"
                    trend="+2"
                    trendDirection="up"
                    description="Keep the momentum going!"
                    icon={<FileText className="h-5 w-5 text-blue-500" />}
                />
                <StatCard
                    title="Total Impressions"
                    value="1,247"
                    trend="+18.2%"
                    trendDirection="up"
                    description="From your Threads posts"
                    icon={<Eye className="h-5 w-5 text-emerald-500" />}
                />
                <StatCard
                    title="Engagement Rate"
                    value="4.8%"
                    trend="+0.6%"
                    trendDirection="up"
                    description="Likes + comments / impressions"
                    icon={<Heart className="h-5 w-5 text-rose-500" />}
                />
                <StatCard
                    title="Connected Sources"
                    value="1"
                    trend=""
                    trendDirection="up"
                    description="Manual input active"
                    icon={<Link2 className="h-5 w-5 text-violet-500" />}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Posts - Takes 2 columns */}
                <Card className="lg:col-span-2 border-0 shadow-sm bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg font-semibold text-gray-900">Recent Posts</CardTitle>
                        <Link href="/dashboard/posts">
                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                View all
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Sample Posts - Will be dynamic */}
                        <PostItem
                            content="Just shipped a new AI feature for Aeden! It can now analyze your writing style from bookmarked creators 🚀"
                            status="published"
                            impressions={432}
                            engagement={21}
                            timeAgo="2 hours ago"
                        />
                        <PostItem
                            content="Building in public update: Week 3 of working on the Threads integration. OAuth flow is tricky but almost there..."
                            status="published"
                            impressions={287}
                            engagement={15}
                            timeAgo="1 day ago"
                        />
                        <PostItem
                            content="Quick tip: If you're a developer building in public, focus on ONE platform first. For me, it's Threads."
                            status="draft"
                            impressions={0}
                            engagement={0}
                            timeAgo="Draft"
                        />

                        {/* Empty State (show when no posts) */}
                        {false && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-blue-50 p-4 mb-4">
                                    <Sparkles className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                                <p className="text-gray-500 mb-4 max-w-sm">
                                    Share what you&apos;re working on. Aeden will transform your updates into engaging Threads posts.
                                </p>
                                <Link href="/dashboard/posts/new">
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Your First Post
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="border-0 shadow-sm bg-white rounded-2xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/dashboard/posts/new" className="block">
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-gray-50 transition-colors group">
                                    <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                        <Plus className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">New Post</div>
                                        <div className="text-xs text-gray-500">Share your progress</div>
                                    </div>
                                </button>
                            </Link>
                            <Link href="/dashboard/sources" className="block">
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-gray-50 transition-colors group">
                                    <div className="p-2 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
                                        <Link2 className="h-4 w-4 text-violet-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">Connect Source</div>
                                        <div className="text-xs text-gray-500">GitHub, Notion, etc.</div>
                                    </div>
                                </button>
                            </Link>
                            <Link href="/dashboard/settings/voice" className="block">
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-gray-50 transition-colors group">
                                    <div className="p-2 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors">
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">Train Your Voice</div>
                                        <div className="text-xs text-gray-500">Personalize AI output</div>
                                    </div>
                                </button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Connected Sources */}
                    <Card className="border-0 shadow-sm bg-white rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900">Sources</CardTitle>
                            <Link href="/dashboard/sources">
                                <Button variant="ghost" size="sm" className="h-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                    Manage
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Manual Source - Always Active */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white">
                                        <FileText className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">Manual Input</div>
                                        <div className="text-xs text-emerald-600">Active</div>
                                    </div>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            </div>

                            {/* GitHub - Not Connected */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white">
                                        <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">GitHub</div>
                                        <div className="text-xs text-gray-500">Not connected</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                    Connect
                                </Button>
                            </div>

                            {/* Notion - Not Connected */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white">
                                        <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 2.037c-.42-.326-.98-.7-2.055-.607L3.01 2.449c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.62c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM2.83 1.634l13.168-1.006c1.635-.14 2.054-.047 3.082.7l4.25 2.987c.7.513.933.653.933 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.967c0-.84.374-1.54 1.589-1.333z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">Notion</div>
                                        <div className="text-xs text-gray-500">Not connected</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                    Connect
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Threads Connection Status */}
                    <Card className="border-0 shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-100">
                                    <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579 0.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.868-.72 2.048-1.175 3.378-1.304.93-.09 1.864-.053 2.78.11-.04-.943-.261-1.67-.658-2.161-.47-.58-1.193-.874-2.145-.874-.865 0-1.54.253-2.003.751-.39.42-.64.988-.742 1.69l-2.054-.36c.165-1.125.596-2.053 1.283-2.764.9-.932 2.13-1.404 3.658-1.404 1.689 0 2.998.55 3.893 1.636.755.916 1.152 2.17 1.181 3.735l.006.442c.005.39.004.78-.003 1.17l-.002.143c.963.477 1.77 1.15 2.396 2.015.93 1.285 1.25 2.857.902 4.426-.532 2.403-2.158 4.292-4.582 5.32-1.548.656-3.27.96-5.095.96-.06 0-.12 0-.179 0zm1.227-7.607c1.035-.064 1.757-.445 2.212-1.164.36-.572.563-1.335.607-2.278-.678-.157-1.39-.209-2.123-.154-.9.067-1.64.322-2.14.739-.46.384-.69.854-.66 1.36.04.669.378 1.18.95 1.437.437.196.985.072 1.154.06z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 text-sm">Threads</div>
                                    <div className="text-xs text-amber-600">Not connected yet</div>
                                </div>
                                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                                    Connect
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                Connect your Threads account to publish posts directly.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({
    title,
    value,
    trend,
    trendDirection,
    description,
    icon,
}: {
    title: string;
    value: string;
    trend: string;
    trendDirection: "up" | "down";
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <Card className="border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">{value}</span>
                            {trend && (
                                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendDirection === "up"
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                    }`}>
                                    {trendDirection === "up" ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    {trend}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">{description}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-50">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Post Item Component
function PostItem({
    content,
    status,
    impressions,
    engagement,
    timeAgo,
}: {
    content: string;
    status: "draft" | "published" | "scheduled";
    impressions: number;
    engagement: number;
    timeAgo: string;
}) {
    const statusConfig = {
        draft: { label: "Draft", color: "bg-gray-100 text-gray-600", icon: Clock },
        published: { label: "Published", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
        scheduled: { label: "Scheduled", color: "bg-amber-50 text-amber-700", icon: Clock },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <div className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all group">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2">{content}</p>
                    <div className="flex items-center gap-4 mt-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                        </span>
                        {status === "published" && (
                            <>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Eye className="h-3 w-3" />
                                    {impressions.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Heart className="h-3 w-3" />
                                    {engagement}
                                </span>
                            </>
                        )}
                        <span className="text-xs text-gray-400">{timeAgo}</span>
                    </div>
                </div>
                <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
            </div>
        </div>
    );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Turn your daily work into engaging Threads posts.
                    </p>
                </div>
                <Link href="/dashboard/posts/new">
                    <Button size="lg">
                        + New Post
                    </Button>
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Posts This Week"
                    value="0"
                    description="Create your first post"
                />
                <MetricCard
                    title="Total Impressions"
                    value="0"
                    description="Publish to start tracking"
                />
                <MetricCard
                    title="Engagement Rate"
                    value="0%"
                    description="Likes + comments / impressions"
                />
                <MetricCard
                    title="Connected Sources"
                    value="1"
                    description="Manual input active"
                />
            </div>

            {/* Recent Posts */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-muted-foreground"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                        <p className="text-muted-foreground mb-4 max-w-sm">
                            Share what you&apos;re working on. Aeden will transform your updates
                            into engaging Threads posts.
                        </p>
                        <Link href="/dashboard/posts/new">
                            <Button>Create Your First Post</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function MetricCard({
    title,
    value,
    description,
}: {
    title: string;
    value: string;
    description: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

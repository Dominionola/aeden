
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Calendar, MoreHorizontal, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";

export default async function PostsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching posts:", error);
        return <div>Error loading posts.</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published":
                return "default"; // Greenish usually, or customize
            case "scheduled":
                return "secondary"; // Yellowish
            case "draft":
            default:
                return "outline"; // Gray
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Posts</h1>
                    <p className="text-lg text-muted-foreground">
                        Manage your drafts, scheduled, and published content.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/posts/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Post
                    </Link>
                </Button>
            </div>

            {posts && posts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Card key={post.id} className="flex flex-col shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2">
                                    <Badge variant={getStatusColor(post.status) as any} className="capitalize">
                                        {post.status}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="-mt-2 -mr-2 h-8 w-8 text-gray-500">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/posts/${post.id}`} className="cursor-pointer">
                                                    <Edit2 className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive cursor-pointer">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 pb-3">
                                <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                                    {post.content}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-3 border-t bg-gray-50/50 text-xs text-muted-foreground flex justify-between items-center">
                                <div className="flex items-center">
                                    <Calendar className="mr-1.5 h-3 w-3" />
                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </div>
                                <span className="capitalize text-gray-400">{post.platform}</span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed shadow-none bg-gray-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No posts yet</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Start by creating your first post manually or verify your AI settings.
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/posts/new">Create First Post</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

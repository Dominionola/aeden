
import { createClient } from "@/lib/supabase/server";
import { PostEditor } from "@/components/dashboard/post-editor";
import { notFound, redirect } from "next/navigation";

export default async function EditPostPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // Await params first (Next.js 15 requirement)
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error || !post) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Edit Post</h1>
                <p className="text-lg text-muted-foreground">
                    Refine your content before publishing.
                </p>
            </div>

            <PostEditor initialContent={post.content} postId={post.id} />
        </div>
    );
}

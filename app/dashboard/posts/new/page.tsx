import { PostEditor } from "@/components/dashboard/post-editor";

export default function NewPostPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Post</h1>
                <p className="text-muted-foreground">
                    Manually enter your updates or sync from a work source.
                </p>
            </div>

            <PostEditor />
        </div>
    );
}

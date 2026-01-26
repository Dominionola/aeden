import { PostEditor } from "@/components/dashboard/post-editor";

export default function NewPostPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Create New Post</h1>
                <p className="text-lg text-muted-foreground">
                    Manually enter your updates or sync from a work source.
                </p>
            </div>

            <PostEditor />
        </div>
    );
}

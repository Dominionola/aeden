
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Send, Save, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PostEditorProps {
    initialContent?: string;
    postId?: string;
}

export function PostEditor({ initialContent = "", postId }: PostEditorProps) {
    const [input, setInput] = useState("");
    const [generatedContent, setGeneratedContent] = useState(initialContent);
    const [isGenerating, setIsGenerating] = useState(false);
    const [model, setModel] = useState("gemini");
    const [tone, setTone] = useState("casual");
    const router = useRouter();

    const handleGenerate = async () => {
        if (!input.trim()) return;

        setIsGenerating(true);
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input,
                    model,
                    tone,
                }),
            });

            if (!response.ok) throw new Error("Generation failed");

            const data = await response.json();
            setGeneratedContent(data.content);
            toast.success("Post generated!");
        } catch (error) {
            toast.error("Failed to generate post");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (status: "draft" | "scheduled") => {
        if (!generatedContent.trim()) return;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error("You must be logged in to save posts");
            return;
        }

        let error;

        if (postId) {
            // Update existing post
            const { error: updateError } = await supabase
                .from("posts")
                .update({
                    content: generatedContent,
                    status,
                    ai_model_version: model,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", postId)
                .eq("user_id", user.id);
            error = updateError;
        } else {
            // Create new post
            const { error: insertError } = await supabase
                .from("posts")
                .insert({
                    content: generatedContent,
                    user_id: user.id,
                    status,
                    ai_model_version: model,
                    source_type: "manual",
                });
            error = insertError;
        }

        if (error) {
            toast.error("Failed to save post");
            console.error(error);
            return;
        }

        toast.success(status === "draft" ? "Draft saved!" : "Post scheduled!");
        router.push("/dashboard/posts");
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader>
                    <CardTitle>Input</CardTitle>
                    <CardDescription>
                        Paste your updates, commit messages, or rough notes here.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="input-content">What did you work on?</Label>
                        <Textarea
                            id="input-content"
                            placeholder="I built a new feature for... I fixed a bug in... I learned how to..."
                            className="min-h-[200px] font-mono text-sm resize-none bg-gray-50/50 focus:bg-white transition-colors"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>AI Model</Label>
                            <Select value={model} onValueChange={setModel}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gemini">Gemini 2.0 Flash</SelectItem>
                                    <SelectItem value="claude">Claude Sonnet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tone</Label>
                            <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="casual">Casual</SelectItem>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="humorous">Humorous</SelectItem>
                                    <SelectItem value="inspirational">Inspirational</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleGenerate}
                        disabled={isGenerating || !input.trim()}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Post
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Preview Section */}
            <Card className="shadow-sm border-gray-200 flex flex-col h-full">
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                        Review and edit generated content.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="space-y-2 h-full">
                        <Label htmlFor="preview-content" className="sr-only">Preview Content</Label>
                        <Textarea
                            id="preview-content"
                            value={generatedContent}
                            onChange={(e) => setGeneratedContent(e.target.value)}
                            className="min-h-[300px] h-full border-0 focus-visible:ring-0 resize-none text-base leading-relaxed p-0 shadow-none -ml-1"
                            placeholder="Generated post will appear here..."
                        />
                    </div>
                </CardContent>
                <div className="px-6 pb-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
                        <span>{generatedContent.length}/500 chars</span>
                        <span className={generatedContent.length > 500 ? "text-destructive font-medium" : ""}>
                            {500 - generatedContent.length} remaining
                        </span>
                    </div>
                </div>
                <CardFooter className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => handleSave("draft")}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                    </Button>
                    <Button variant="secondary" className="flex-1" onClick={() => handleSave("scheduled")}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule
                    </Button>
                    {/* Placeholder for future specific publish action if needed, or keep secondary */}
                </CardFooter>
            </Card>
        </div>
    );
}

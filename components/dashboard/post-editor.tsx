"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PostEditorProps {
    initialContent?: string;
}

export function PostEditor({ initialContent = "" }: PostEditorProps) {
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

        const { error } = await supabase.from("posts").insert({
            content: generatedContent,
            user_id: user.id,
            status,
            ai_model_version: model,
            source_type: "manual",
        });

        if (error) {
            toast.error("Failed to save post");
            return;
        }

        toast.success(status === "draft" ? "Draft saved!" : "Post scheduled!");
        router.push("/dashboard/posts");
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2">What did you work on?</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Paste your updates, commit messages, or rough notes here.
                        Aeden will rewrite them into an engaging post.
                    </p>
                    <Textarea
                        placeholder="I built a new feature for... I fixed a bug in... I learned how to..."
                        className="min-h-[200px] font-mono text-sm"
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
                                <SelectItem value="gemini">Gemini 2.0 Flash (Fast)</SelectItem>
                                <SelectItem value="claude">Claude Sonnet (High Quality)</SelectItem>
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
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Preview</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Review and edit the generated post before publishing.
                    </p>
                    <Card>
                        <CardContent className="p-4">
                            <Textarea
                                value={generatedContent}
                                onChange={(e) => setGeneratedContent(e.target.value)}
                                className="min-h-[200px] border-0 focus-visible:ring-0 resize-none"
                                placeholder="Generated post will appear here..."
                            />
                            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                <span>{generatedContent.length}/500 chars</span>
                                <span className={generatedContent.length > 500 ? "text-destructive" : ""}>
                                    {500 - generatedContent.length} remaining
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => handleSave("draft")}>
                        Save Draft
                    </Button>
                    <Button className="flex-1" onClick={() => handleSave("scheduled")}>
                        Schedule
                    </Button>
                </div>
            </div>
        </div>
    );
}

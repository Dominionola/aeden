"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Save } from "lucide-react";

const USER_TYPES = [
    { value: "developer", label: "🧑‍💻 Developer" },
    { value: "designer", label: "🎨 Designer" },
    { value: "product_manager", label: "📋 Product Manager" },
    { value: "no_code_builder", label: "🔧 No-Code Builder" },
    { value: "content_creator", label: "✍️ Content Creator" },
    { value: "founder", label: "🚀 Founder" },
    { value: "other", label: "💡 Other" },
];

const TONES = [
    { value: "casual", label: "😊 Casual — Friendly and relaxed" },
    { value: "professional", label: "💼 Professional — Polished and formal" },
    { value: "technical", label: "🔬 Technical — Precise and detailed" },
    { value: "humorous", label: "😄 Humorous — Fun and witty" },
    { value: "inspirational", label: "⭐ Inspirational — Motivating and bold" },
];

const AI_MODELS = [
    { value: "gemini", label: "✨ Gemini 2.0 Flash (Google)" },
    { value: "claude", label: "🤖 Claude (Anthropic)" },
];

interface VoiceFormProps {
    initialPrefs: {
        user_type: string;
        tone: string;
        brand_guidelines: string | null;
        preferred_ai_model: string;
    };
}

export default function VoiceForm({ initialPrefs }: VoiceFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [userType, setUserType] = useState(initialPrefs.user_type || "developer");
    const [tone, setTone] = useState(initialPrefs.tone || "casual");
    const [aiModel, setAiModel] = useState(initialPrefs.preferred_ai_model || "gemini");
    const [brandGuidelines, setBrandGuidelines] = useState(initialPrefs.brand_guidelines || "");

    const handleSave = async () => {
        startTransition(async () => {
            try {
                const res = await fetch("/api/user/preferences", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_type: userType,
                        tone,
                        preferred_ai_model: aiModel,
                        brand_guidelines: brandGuidelines || null,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to save");
                }

                toast.success("Voice & Persona saved!");
                router.refresh();
            } catch (err: any) {
                toast.error("Failed to save", { description: err.message });
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Who are you */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">Who are you?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="user-type">Your role</Label>
                    <Select value={userType} onValueChange={setUserType}>
                        <SelectTrigger id="user-type" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {USER_TYPES.map(t => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">This shapes how AI frames your posts.</p>
                </CardContent>
            </Card>

            {/* Tone */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">Writing Tone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="tone">Default tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger id="tone" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TONES.map(t => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Brand guidelines */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">Brand Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="brand">
                        Describe your voice, audience, and any rules AI should follow
                    </Label>
                    <Textarea
                        id="brand"
                        value={brandGuidelines}
                        onChange={e => setBrandGuidelines(e.target.value)}
                        placeholder={'Examples:\n• Always end posts with a question\n• Avoid jargon — write for a general audience\n• I\'m a solo dev building in public, keep it raw and honest'}
                        className="min-h-[140px] text-sm"
                    />
                    <p className="text-xs text-gray-400">
                        The more specific, the better. AI will follow these every time it generates content.
                    </p>
                </CardContent>
            </Card>

            {/* AI Model */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">AI Model</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="ai-model">Preferred model</Label>
                    <Select value={aiModel} onValueChange={setAiModel}>
                        <SelectTrigger id="ai-model" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {AI_MODELS.map(m => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Button
                onClick={handleSave}
                disabled={isPending}
                className="w-full gap-2 bg-blue-500 hover:bg-blue-600"
                id="save-voice-btn"
            >
                {isPending
                    ? <><Sparkles className="h-4 w-4 animate-spin" /> Saving...</>
                    : <><Save className="h-4 w-4" /> Save Preferences</>
                }
            </Button>
        </div>
    );
}

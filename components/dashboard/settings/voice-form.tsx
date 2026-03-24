"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, Save, Code, Palette, Briefcase, Video, Layers, TrendingUp, Landmark, Heart, Coffee, Loader2, RefreshCw, BrainCircuit, Type, FileText, ChevronDown, ChevronUp, Settings2, MessageSquare, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
    { id: "tech", label: "Tech & Development", icon: Code },
    { id: "design", label: "Design & Creative", icon: Palette },
    { id: "business", label: "Business & Startups", icon: Briefcase },
    { id: "content", label: "Content Creation", icon: Video },
    { id: "product", label: "Product Management", icon: Layers },
    { id: "marketing", label: "Marketing & Growth", icon: TrendingUp },
    { id: "finance", label: "Finance & Wealth", icon: Landmark },
    { id: "health", label: "Health & Wellness", icon: Heart },
    { id: "lifestyle", label: "Lifestyle & Personal", icon: Coffee },
] as const;

const TOPICS_BY_CATEGORY: Record<string, string[]> = {
    tech: ["AI", "Web Dev", "Mobile", "DevOps", "Cloud", "Blockchain", "Open Source", "Cybersecurity", "Data Science"],
    design: ["UI/UX", "Graphic Design", "Product Design", "Motion", "Branding", "Typography", "System Design"],
    business: ["Startups", "Entrepreneurship", "SaaS", "E-commerce", "Fundraising", "Bootstrapping", "Leadership"],
    content: ["Writing", "Video Editing", "Podcasting", "Newsletter", "Audience Growth", "Storytelling", "SEO"],
    product: ["Agile", "Roadmaps", "User Research", "Metrics", "Launch", "Product Strategy", "Wireframing"],
    marketing: ["Growth Hacks", "Social Media", "Performance Marketing", "Copywriting", "Email Marketing", "Brand Identity"],
    finance: ["Crypto", "Personal Finance", "Venture Capital", "Real Estate", "Investing", "Economics"],
    health: ["Fitness", "Mental Health", "Nutrition", "Biohacking", "Mindfulness", "Healthcare"],
    lifestyle: ["Productivity", "Travel", "Self-Improvement", "Digital Nomad", "Habits", "Photography"],
};

const TONES = [
    { id: "casual", label: "Casual", description: "Friendly, conversational" },
    { id: "professional", label: "Professional", description: "Polished, business-ready" },
    { id: "technical", label: "Technical", description: "In-depth, developer-focused" },
    { id: "humorous", label: "Humorous", description: "Witty, playful" },
    { id: "inspirational", label: "Inspirational", description: "Motivating, uplifting" },
] as const;

const AI_MODELS = [
    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", description: "Fast, efficient" },
    { id: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet", description: "Thoughtful, detailed" },
] as const;

interface VoiceFormProps {
    initialPrefs: {
        categories: string[] | null;
        topics: string[];
        target_audience: string | null;
        refinement: string | null;
        brand_guidelines: string | null;
        auto_learn_persona?: boolean;
        voice_analysis?: {
            tone: string;
            characteristics: string[];
            voice_summary: string;
            common_patterns?: {
                sentence_length?: string;
                emoji_usage?: string;
                line_breaks?: string;
            };
        } | null;
        tone?: string;
        preferred_ai_model?: string;
    };
}

export default function VoiceForm({ initialPrefs }: VoiceFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [categories, setCategories] = useState<string[]>(initialPrefs.categories || []);
    const [topics, setTopics] = useState<string[]>(initialPrefs.topics || []);
    const [customTopic, setCustomTopic] = useState("");
    const [targetAudience, setTargetAudience] = useState(initialPrefs.target_audience || "");
    const [refinement, setRefinement] = useState(initialPrefs.refinement || "");
    const [brandGuidelines, setBrandGuidelines] = useState(initialPrefs.brand_guidelines || "");
    const [autoLearn, setAutoLearn] = useState(initialPrefs.auto_learn_persona !== false);
    const [voiceAnalysis, setVoiceAnalysis] = useState(initialPrefs.voice_analysis || null);
    const [tone, setTone] = useState(initialPrefs.tone || "professional");
    const [preferredAiModel, setPreferredAiModel] = useState(initialPrefs.preferred_ai_model || "gemini-2.0-flash");
    
    // Playground State
    const [isSaved, setIsSaved] = useState(!!voiceAnalysis || (initialPrefs.categories && initialPrefs.categories.length > 0));
    const [playgroundInput, setPlaygroundInput] = useState("");
    const [playgroundOutput, setPlaygroundOutput] = useState("");
    const [isGeneratingPlayground, setIsGeneratingPlayground] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isFormExpanded, setIsFormExpanded] = useState(!isSaved);

    const handleToggleTopic = (topic: string) => {
        setTopics((prev) =>
            prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
        );
    };

    const handleAddCustomTopic = () => {
        if (customTopic.trim() && !topics.includes(customTopic.trim())) {
            setTopics(prev => [...prev, customTopic.trim()]);
            setCustomTopic("");
        }
    };

    const handleSetCategory = (categoryId: string) => {
        setCategories((prev) => {
            if (prev.includes(categoryId)) {
                return prev.filter(c => c !== categoryId);
            }
            if (prev.length >= 3) {
                toast.error("You can select up to 3 primary categories.");
                return prev;
            }
            return [...prev, categoryId];
        });
    };

    const handleSave = async () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        startTransition(async () => {
            try {
                // Compile the ai_context based on structured data
                const categoryLabels = categories.length > 0
                    ? categories.map(c => CATEGORIES.find(cat => cat.id === c)?.label).filter(Boolean).join(", ")
                    : "Creator";
                const topicsLabel = topics.length > 0 ? topics.join(" and ") : "general topics";
                const audienceLabel = targetAudience ? ` writing to ${targetAudience}` : "";
                const refinementLabel = refinement ? ` (${refinement})` : "";

                const generatedContext = `${categoryLabels}${audienceLabel} focusing on ${topicsLabel}${refinementLabel}.`;

                const res = await fetch("/api/user/preferences", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        categories,
                        topics,
                        target_audience: targetAudience || null,
                        refinement,
                        ai_context: generatedContext,
                        brand_guidelines: brandGuidelines || null,
                        auto_learn_persona: autoLearn,
                        tone,
                        preferred_ai_model: preferredAiModel,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to save");
                }

                toast.success("Voice & Persona saved!");
                setIsSaved(true);
                setIsFormExpanded(false);
                router.refresh();
                
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1500);
            } catch (err: any) {
                toast.error("Failed to save", { description: err.message });
            }
        });
    };

    const handleRunAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch("/api/persona/analyze", { method: "POST" });
            const data = await res.json();
            
            if (!res.ok) {
                if (res.status === 400 && data.error === "Insufficient data") {
                    toast.info("Need more data", { description: data.message });
                } else {
                    throw new Error(data.message || data.error || "Failed to analyze");
                }
                return;
            }

            setVoiceAnalysis(data.analysis);
            toast.success("AI Persona updated!");
            router.refresh();
        } catch (err: any) {
            toast.error("Analysis failed", { description: err.message });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const [strategy, setStrategy] = useState<any>(null);
    useEffect(() => {
        if (isSaved) {
            fetch("/api/persona/strategy").then(r => r.json()).then(d => setStrategy(d.strategy));
        }
    }, [isSaved]);

    const handleTestPlayground = async () => {
        if (!playgroundInput.trim()) return;
        setIsGeneratingPlayground(true);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    input: playgroundInput,
                    tone,
                    preferred_ai_model: preferredAiModel,
                }),
            });
            if (!res.ok) throw new Error("Generation failed");
            const data = await res.json();
            setPlaygroundOutput(data.content);
            toast.success("Generated test post!");
        } catch (error) {
            toast.error("Failed to generate test post");
        } finally {
            setIsGeneratingPlayground(false);
        }
    };

    const predefinedTopics = categories.flatMap(cat => TOPICS_BY_CATEGORY[cat] || []);
    const customTopicsList = topics.filter(t => !predefinedTopics.includes(t));
    const allDisplayTopics = Array.from(new Set([...predefinedTopics, ...customTopicsList]));

    return (
        <div className="space-y-8 pb-10 relative">
            {/* Loading Overlay */}
            {isPending && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                    <Loader2 className="h-10 w-10 text-primary-600 animate-spin mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 animate-pulse">Compiling Your Persona...</h2>
                    <p className="text-sm text-gray-500 mt-2">Saving preferences and updating AI context</p>
                </div>
            )}

            {/* AI Voice Analysis Section */}
            {voiceAnalysis && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <Card className="border-none bg-gradient-to-br from-primary-600/10 via-primary-500/5 to-transparent shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleRunAnalysis}
                                disabled={isAnalyzing}
                                className="text-primary-600 hover:text-primary-700 hover:bg-white/50 gap-2"
                            >
                                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                Sync Patterns
                            </Button>
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex items-center gap-3 text-primary-900">
                                <BrainCircuit className="h-6 w-6 text-primary-600" />
                                AI Voice Analysis
                            </CardTitle>
                            <CardDescription className="text-primary-800/70 font-medium">
                                What Aeden has learned about your writing style:
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-primary-100/30">
                                <p className="text-sm text-gray-800 italic leading-relaxed">
                                    "{voiceAnalysis.voice_summary}"
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 flex items-center gap-1">
                                        <Type className="h-3 w-3" /> Learned Patterns
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {voiceAnalysis.characteristics.map((c: string, i: number) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                <span className="h-1 w-1 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 flex items-center gap-1">
                                        <FileText className="h-3 w-3" /> Style Metrics
                                    </h4>
                                    <div className="space-y-2">
                                        {voiceAnalysis.common_patterns && Object.entries(voiceAnalysis.common_patterns).map(([key, val]) => (
                                            <div key={key} className="flex items-center justify-between bg-white/40 px-3 py-1.5 rounded-lg border border-primary-50/50">
                                                <span className="text-xs font-medium text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                                                <Badge variant="secondary" className="text-[10px] uppercase bg-primary-100/50 text-primary-700 border-none">{String(val)}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Separator className="mt-8 mb-4" />
                </div>
            )}

            {/* Deep Strategy Analysis */}
            {strategy && (
                <Card className="border-none bg-gray-900 text-white overflow-hidden shadow-xl rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary-400" />
                            Deep Strategy Analysis
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            How your persona rules translate to growth.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Top Archetype</p>
                                <p className="text-xl font-bold">{strategy.winning_archetype}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Resonance Score</p>
                                <p className="text-xl font-bold">{strategy.resonance_score}%</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Weekly Goal</p>
                                <p className="text-sm font-medium leading-tight">{strategy.weekly_goal}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase text-gray-400">Tactical Adjustments</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {strategy.adjustment_tips.map((tip: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-primary-500" />
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Persona Setup Form (Collapsible when saved) */}
            <div className="space-y-6">
                <Collapsible
                    open={isFormExpanded}
                    onOpenChange={setIsFormExpanded}
                    className="w-full space-y-4"
                >
                    <div className="flex items-center justify-between px-2">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-gray-400" />
                                Persona Configuration
                            </h3>
                            {isSaved && !isFormExpanded && (
                                <p className="text-xs text-muted-foreground">
                                    {categories.length} Categories and {topics.length} Topics configured.
                                </p>
                            )}
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2">
                                {isFormExpanded ? (
                                    <>Collapse <ChevronUp className="h-4 w-4" /></>
                                ) : (
                                    <>Manage Setup <ChevronDown className="h-4 w-4" /></>
                                )}
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="space-y-8 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Step 1: Category */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-[10px]">1</span>
                                Primary Categories (Max 3)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isSelected = categories.includes(cat.id);
                                    return (
                                        <Card
                                            key={cat.id}
                                            role="button"
                                            onClick={() => handleSetCategory(cat.id)}
                                            className={cn(
                                                "cursor-pointer transition-all duration-200 border-gray-100 shadow-sm",
                                                isSelected ? "border-primary-500 bg-primary-50/50" : "hover:border-primary-200 hover:bg-gray-50 bg-white"
                                            )}
                                        >
                                            <CardContent className="p-4 flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    isSelected ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500"
                                                )}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <p className="font-medium text-xs text-gray-800">{cat.label}</p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Topics */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-[10px]">2</span>
                                Specific Topics
                            </h3>
                            <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {allDisplayTopics.map((topic) => {
                                        const isSelected = topics.includes(topic);
                                        return (
                                            <Badge
                                                key={topic}
                                                variant={isSelected ? "default" : "outline"}
                                                className={cn(
                                                    "cursor-pointer text-xs px-3 py-1 rounded-full",
                                                    isSelected ? "bg-primary-500 hover:bg-primary-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                                )}
                                                onClick={() => handleToggleTopic(topic)}
                                            >
                                                {topic}
                                            </Badge>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        placeholder="Add custom topic..."
                                        value={customTopic}
                                        onChange={e => setCustomTopic(e.target.value)}
                                        className="h-9 text-xs border-gray-100"
                                    />
                                    <Button size="sm" variant="secondary" onClick={handleAddCustomTopic}>Add</Button>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 & 4 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Target Audience</Label>
                                <Input value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="Indie hackers..." className="h-9 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Nuance</Label>
                                <Input value={refinement} onChange={e => setRefinement(e.target.value)} placeholder="Technical but chill..." className="h-9 text-sm" />
                            </div>
                        </div>

                        {/* Continuous Learning Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <Label className="text-sm font-bold block">Continuous Learning</Label>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Let AI learn from your edits automatically.</p>
                            </div>
                            <Switch checked={autoLearn} onCheckedChange={setAutoLearn} />
                        </div>

                        {/* Step 5: Tone & AI Model */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-[10px]">5</span>
                                Tone & AI Model
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" /> Default Tone
                                    </Label>
                                    <Select value={tone} onValueChange={setTone}>
                                        <SelectTrigger className="h-9 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TONES.map(t => (
                                                <SelectItem key={t.id} value={t.id}>
                                                    {t.label} - {t.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold flex items-center gap-1">
                                        <Cpu className="h-3 w-3" /> AI Model
                                    </Label>
                                    <Select value={preferredAiModel} onValueChange={setPreferredAiModel}>
                                        <SelectTrigger className="h-9 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AI_MODELS.map(m => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.label} - {m.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleSave} disabled={isPending} className="w-full bg-primary-600 hover:bg-primary-700 h-10">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Persona
                        </Button>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            <Separator className="my-2" />

            {/* Persona Playground */}
            {isSaved && (
                <div className="space-y-6 pt-4">
                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary-600" />
                            Persona Playground
                        </h2>
                        <p className="text-xs text-muted-foreground">Test how your persona speaks.</p>
                    </div>
                    <Card className="border-primary-100 shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Raw Thought</Label>
                                <div className="flex gap-2">
                                    <Input value={playgroundInput} onChange={e => setPlaygroundInput(e.target.value)} placeholder="Just launched something cool..." className="flex-1 h-10" />
                                    <Button onClick={handleTestPlayground} disabled={isGeneratingPlayground} className="bg-primary-600 h-10">
                                        {isGeneratingPlayground ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
                                    </Button>
                                </div>
                            </div>
                            {playgroundOutput && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <Label className="text-[10px] font-bold uppercase text-primary-600 mb-1 block">AI Output</Label>
                                    <p className="text-sm text-gray-800 leading-relaxed">{playgroundOutput}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

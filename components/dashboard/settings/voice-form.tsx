"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Save, Code, Palette, Briefcase, Video, Layers, TrendingUp, Landmark, Heart, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface VoiceFormProps {
    initialPrefs: {
        categories: string[] | null;
        topics: string[];
        target_audience: string | null;
        refinement: string | null;
        brand_guidelines: string | null;
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
        startTransition(async () => {
            try {
                // Compile the ai_context based on structured data
                const categoryLabels = categories.length > 0
                    ? categories.map(c => CATEGORIES.find(cat => cat.id === c)?.label).filter(Boolean).join(", ")
                    : "Creator";
                const topicsLabel = topics.length > 0 ? topics.join(" and ") : "general topics";
                const audienceLabel = targetAudience ? `writing to ${targetAudience}` : "";
                const refinementLabel = refinement ? ` (${refinement})` : "";
                
                // e.g., "Creator writing to Indie hackers focusing on AI and SEO (expert tone)."
                const generatedContext = `${categoryLabels} ${audienceLabel} focusing on ${topicsLabel}${refinementLabel}.`;

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

    const predefinedTopics = categories.flatMap(cat => TOPICS_BY_CATEGORY[cat] || []);
    const customTopicsList = topics.filter(t => !predefinedTopics.includes(t));
    const allDisplayTopics = Array.from(new Set([...predefinedTopics, ...customTopicsList]));

    return (
        <div className="space-y-8 pb-10">
            {/* Step 1: Category */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">1. Primary Categories (Max 3)</h3>
                    <p className="text-sm text-muted-foreground">Select the areas that best describe your work.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = categories.includes(cat.id);
                        return (
                            <Card
                                key={cat.id}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleSetCategory(cat.id);
                                    }
                                }}
                                className={cn(
                                    "cursor-pointer transition-all duration-200 ease-out active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                                    isSelected 
                                        ? "border-2 border-primary-500 bg-primary-50 shadow-md -translate-y-1" 
                                        : "border border-gray-200 hover:border-primary-300 hover:shadow-md hover:-translate-y-1 bg-white"
                                )}
                                onClick={() => handleSetCategory(cat.id)}
                            >
                                <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3">
                                    <div className={cn(
                                        "p-3 rounded-2xl transition-colors duration-200", 
                                        isSelected 
                                            ? "bg-primary-500 text-white shadow-md shadow-primary-500/30" 
                                            : "bg-gray-50 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-500"
                                    )}>
                                        <Icon className="w-6 h-6 stroke-[1.5]" />
                                    </div>
                                    <p className={cn("font-semibold text-sm transition-colors", isSelected ? "text-primary-800" : "text-gray-700")}>{cat.label}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Step 2: Topics */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">2. Specific Topics</h3>
                    <p className="text-sm text-muted-foreground">Select or add the key topics you usually post about.</p>
                </div>
                
                <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-4">
                    {categories.length === 0 && topics.length === 0 && (
                        <p className="text-sm text-gray-500 italic">Select a category above to see recommended topics, or add your own below.</p>
                    )}
                    
                    {allDisplayTopics.length > 0 && (
                        <div className="flex flex-wrap gap-2.5">
                            {allDisplayTopics.map((topic) => {
                                const isSelected = topics.includes(topic);
                                return (
                                    <Badge
                                        key={topic}
                                        variant={isSelected ? "default" : "outline"}
                                        role="checkbox"
                                        aria-checked={isSelected}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleToggleTopic(topic);
                                            }
                                        }}
                                        className={cn(
                                            "cursor-pointer text-sm font-medium py-1.5 px-4 rounded-full transition-all duration-200 ease-out active:scale-95 hover:-translate-y-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 select-none",
                                            isSelected 
                                                ? "bg-primary-500 text-white hover:bg-primary-600 hover:shadow-md shadow-primary-500/25 border-transparent" 
                                                : "bg-white text-gray-700 border border-gray-200 shadow-sm hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                                        )}
                                        onClick={() => handleToggleTopic(topic)}
                                    >
                                        {topic}
                                    </Badge>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex gap-2 pt-2 items-center">
                        <Input 
                            placeholder="Add custom topic..." 
                            value={customTopic}
                            onChange={e => setCustomTopic(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustomTopic();
                                }
                            }}
                            className="max-w-[240px] border-gray-200 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={handleAddCustomTopic}
                            className="text-gray-700"
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </div>

            {/* Step 3: Target Audience */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">3. Target Audience</h3>
                    <p className="text-sm text-muted-foreground">Who are you writing for?</p>
                </div>
                <div>
                    <Label htmlFor="audience" className="sr-only">Target Audience</Label>
                    <Input
                        id="audience"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g., Indie hackers, Non-technical founders, SEO experts"
                        className="bg-white border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm py-6 text-base rounded-xl"
                    />
                </div>
            </div>

            {/* Step 4: Refinement */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">4. Persona Nuance (Optional)</h3>
                    <p className="text-sm text-muted-foreground">Refine your identity for the AI context.</p>
                </div>
                <div>
                    <Label htmlFor="refinement" className="sr-only">Persona Refinement</Label>
                    <Input
                        id="refinement"
                        value={refinement}
                        onChange={(e) => setRefinement(e.target.value)}
                        placeholder="e.g., for non-technical founders, B2B SaaS focus, solopreneur building in public"
                        className="bg-white border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm py-6 text-base rounded-xl"
                    />
                </div>
            </div>

            <Separator className="my-6" />

            {/* Brand guidelines (Advanced) */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Strict Rules (Advanced)</h3>
                    <p className="text-sm text-muted-foreground">Hard rules the AI must follow every time.</p>
                </div>
                <Textarea
                    id="brand"
                    value={brandGuidelines}
                    onChange={e => setBrandGuidelines(e.target.value)}
                    placeholder={'Examples:\n• Never use hashtags\n• Always end with a question\n• Do not use the word "excited" or "thrilled"'}
                    className="min-h-[120px] text-base bg-white border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm rounded-xl p-4"
                />
            </div>

            <div className="pt-4">
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-md hover:shadow-lg transition-all duration-200 ease-out active:scale-[0.98]"
                    id="save-voice-btn"
                >
                    {isPending
                        ? <><Sparkles className="h-4 w-4 animate-spin" /> Compiling Persona...</>
                        : <><Save className="h-4 w-4" /> Save Persona Preferences</>
                    }
                </Button>
            </div>
        </div>
    );
}


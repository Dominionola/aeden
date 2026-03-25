"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
    BookOpen, 
    Plus, 
    Trash2, 
    ExternalLink, 
    Loader2, 
    ChevronDown, 
    ChevronUp,
    Sparkles,
    Lightbulb,
    Tag,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IntelligenceBlock {
    thesis: string;
    supporting_data: string[];
    threads_hook_draft: string;
}

interface VaultSource {
    id: string;
    source_title: string;
    source_url: string | null;
    source_type: string;
    metadata: {
        source_title: string;
        primary_niche: string;
        complexity_level: string;
    };
    voice_analysis: {
        tone_markers: string[];
        vocabulary_preferences: string[];
        sentence_structure: string;
    };
    intelligence_blocks: IntelligenceBlock[];
    contrarian_takes: string[];
    suggested_hashtags: string[];
    tags: string[];
    is_active: boolean;
    times_used: number;
    created_at: string;
}

export function KnowledgeVault() {
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [sources, setSources] = useState<VaultSource[]>([]);
    const [urlInput, setUrlInput] = useState("");
    const [isIngesting, setIsIngesting] = useState(false);
    const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/knowledge");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setSources(data.sources || []);
        } catch {
            toast.error("Failed to load Knowledge Vault");
        } finally {
            setIsLoading(false);
        }
    };

    const handleIngest = async () => {
        if (!urlInput.trim()) return;

        setIsIngesting(true);
        try {
            const res = await fetch("/api/knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source_url: urlInput }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to ingest");
            }

            toast.success("Source added!", { description: "Intelligence extracted and saved." });
            setUrlInput("");
            fetchSources();
        } catch (err: any) {
            toast.error("Failed to ingest", { description: err.message });
        } finally {
            setIsIngesting(false);
        }
    };

    const handleDelete = async (id: string) => {
        startTransition(async () => {
            try {
                const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Failed to delete");
                toast.success("Source removed");
                fetchSources();
            } catch {
                toast.error("Failed to remove source");
            }
        });
    };

    const handleToggleActive = async (id: string, currentState: boolean) => {
        try {
            const res = await fetch(`/api/knowledge/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !currentState }),
            });
            if (!res.ok) throw new Error("Failed to update");
            fetchSources();
        } catch {
            toast.error("Failed to update source");
        }
    };

    const activeCount = sources.filter(s => s.is_active).length;

    return (
        <div className="space-y-4">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Knowledge Vault</h3>
                            <p className="text-[11px] text-muted-foreground">
                                {isLoading ? "Loading..." : `${activeCount} active sources`}
                            </p>
                        </div>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                            {isExpanded ? (
                                <>Collapse <ChevronUp className="h-4 w-4" /></>
                            ) : (
                                <>Manage <ChevronDown className="h-4 w-4" /></>
                            )}
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* URL Input */}
                    <Card className="border-dashed border-2 bg-gray-50/50">
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Paste article URL to extract intelligence..."
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        className="flex-1 h-9 text-sm"
                                        onKeyDown={(e) => e.key === "Enter" && handleIngest()}
                                    />
                                    <Button 
                                        onClick={handleIngest} 
                                        disabled={isIngesting || !urlInput.trim()}
                                        size="sm"
                                        className="h-9 bg-primary-600 hover:bg-primary-700"
                                    >
                                        {isIngesting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Paste a blog post, article, or research URL. Aeden will extract key insights and structure them for post generation.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sources List */}
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : sources.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No sources yet</p>
                            <p className="text-[11px]">Add article URLs above to build your knowledge base</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {sources.map((source) => (
                                <SourceCard
                                    key={source.id}
                                    source={source}
                                    isExpanded={expandedSourceId === source.id}
                                    onToggleExpand={() => setExpandedSourceId(
                                        expandedSourceId === source.id ? null : source.id
                                    )}
                                    onToggleActive={() => handleToggleActive(source.id, source.is_active)}
                                    onDelete={() => handleDelete(source.id)}
                                />
                            ))}
                        </div>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}

interface SourceCardProps {
    source: VaultSource;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onToggleActive: () => void;
    onDelete: () => void;
}

function SourceCard({ source, isExpanded, onToggleExpand, onToggleActive, onDelete }: SourceCardProps) {
    return (
        <Card className={cn(
            "transition-all duration-200",
            source.is_active ? "border-primary-100" : "border-gray-100 opacity-60"
        )}>
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium truncate">{source.source_title}</h4>
                            {source.is_active && (
                                <CheckCircle2 className="h-3 w-3 text-primary-500 flex-shrink-0" />
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {source.source_url && (
                                <a
                                    href={source.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-muted-foreground hover:text-primary-600 flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Source
                                </a>
                            )}
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {source.metadata?.complexity_level || "Intermediate"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {source.intelligence_blocks?.length || 0} insights
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggleExpand}
                            className="h-7 w-7 p-0"
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleActive();
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary-600"
                            title={source.is_active ? "Disable" : "Enable"}
                        >
                            <CheckCircle2 className={cn(
                                "h-4 w-4",
                                source.is_active ? "text-primary-500" : ""
                            )} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {source.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {source.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardHeader>

            {isExpanded && (
                <CardContent className="p-4 pt-2 space-y-4 animate-in fade-in duration-200">
                    {/* Intelligence Blocks */}
                    {source.intelligence_blocks?.length > 0 && (
                        <div className="space-y-2">
                            <h5 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                                <Lightbulb className="h-3 w-3" /> Key Insights
                            </h5>
                            {source.intelligence_blocks.slice(0, 3).map((block, i) => (
                                <div key={i} className="p-3 bg-gray-50 rounded-lg text-xs">
                                    <p className="font-medium text-gray-800">{block.thesis}</p>
                                    {block.supporting_data?.length > 0 && (
                                        <p className="text-muted-foreground mt-1">
                                            {block.supporting_data.join(" • ")}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Contrarian Takes */}
                    {source.contrarian_takes?.length > 0 && (
                        <div className="space-y-2">
                            <h5 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> Contrarian Takes
                            </h5>
                            {source.contrarian_takes.slice(0, 2).map((take, i) => (
                                <p key={i} className="text-xs italic text-gray-600 border-l-2 border-primary-200 pl-2">
                                    {take}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Suggested Hashtags */}
                    {source.suggested_hashtags?.length > 0 && (
                        <div className="space-y-1">
                            <h5 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                                <Tag className="h-3 w-3" /> Suggested Tags
                            </h5>
                            <div className="flex flex-wrap gap-1">
                                {source.suggested_hashtags.slice(0, 8).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Voice Analysis */}
                    {source.voice_analysis?.tone_markers?.length > 0 && (
                        <div className="space-y-1">
                            <h5 className="text-[10px] font-bold uppercase text-muted-foreground">
                                Voice Profile
                            </h5>
                            <div className="flex flex-wrap gap-1">
                                {source.voice_analysis.tone_markers.map((marker) => (
                                    <Badge key={marker} variant="outline" className="text-[10px] px-2 py-0">
                                        {marker}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

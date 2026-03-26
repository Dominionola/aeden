"use client";

import { useState, useEffect, useTransition, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
    CheckCircle2,
    Search,
    Globe,
    Link,
    Triangle,
    ArrowRight,
    Clipboard,
    Upload,
    FileText,
    File,
    X,
    CloudUpload
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_FILE_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
    const [manualText, setManualText] = useState("");
    const [isIngesting, setIsIngesting] = useState(false);
    const [isManualOpen, setIsManualOpen] = useState(false);
    const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // File upload state
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<Array<{ name: string; progress: number; error?: string }>>([]);
    const urlInputRef = useRef<HTMLInputElement>(null);

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

    const handleManualIngest = async () => {
        if (!manualText.trim()) return;

        setIsIngesting(true);
        try {
            const res = await fetch("/api/knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    source_content: manualText,
                    source_title: "Manual Context (" + new Date().toLocaleDateString() + ")"
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to ingest");
            }

            toast.success("Manual context saved!");
            setManualText("");
            setIsManualOpen(false);
            fetchSources();
        } catch (err: any) {
            toast.error("Failed to save context", { description: err.message });
        } finally {
            setIsIngesting(false);
        }
    };

    // File upload handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFilesUpload(files);
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            handleFilesUpload(files);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const handleFilesUpload = async (files: File[]) => {
        const validFiles = files.filter(file => {
            const isValidType = Object.keys(ACCEPTED_FILE_TYPES).includes(file.type) || 
                                 file.type.startsWith("text/") ||
                                 file.type === "application/pdf" ||
                                 file.type.includes("word");
            const isValidSize = file.size <= MAX_FILE_SIZE;
            
            if (!isValidType) {
                toast.error(`${file.name}: Unsupported file type`);
                return false;
            }
            if (!isValidSize) {
                toast.error(`${file.name}: File too large (max 10MB)`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Initialize upload tracking
        const uploadTracks = validFiles.map(file => ({ name: file.name, progress: 0 }));
        setUploadingFiles(uploadTracks);

        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            try {
                setUploadingFiles(prev => 
                    prev.map((f, idx) => idx === i ? { ...f, progress: 10 } : f)
                );

                let content = "";
                let fileTitle = file.name.replace(/\.[^/.]+$/, "");

                // For PDFs, images, and other complex files, use server-side processing
                if (file.type === "application/pdf" || 
                    file.type.startsWith("image/") ||
                    file.type.includes("word") ||
                    file.name.endsWith(".docx")) {
                    
                    setUploadingFiles(prev => 
                        prev.map((f, idx) => idx === i ? { ...f, progress: 30 } : f)
                    );

                    // Upload to server for processing
                    const uploadFormData = new FormData();
                    uploadFormData.append("file", file);

                    const processRes = await fetch("/api/knowledge/process-file", {
                        method: "POST",
                        body: uploadFormData,
                    });

                    if (!processRes.ok) {
                        const data = await processRes.json();
                        throw new Error(data.error || "Failed to process file");
                    }

                    const processData = await processRes.json();
                    content = processData.content;
                    fileTitle = processData.fileName || fileTitle;

                } else {
                    // For text files, read client-side
                    setUploadingFiles(prev => 
                        prev.map((f, idx) => idx === i ? { ...f, progress: 40 } : f)
                    );
                    content = await readFileContent(file);
                }

                setUploadingFiles(prev => 
                    prev.map((f, idx) => idx === i ? { ...f, progress: 70 } : f)
                );

                // Send extracted content to knowledge vault
                const res = await fetch("/api/knowledge", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        source_content: content,
                        source_title: fileTitle,
                        source_type: file.type === "application/pdf" ? "pdf" : 
                                     file.type.startsWith("image/") ? "image" : "manual",
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to save");
                }

                setUploadingFiles(prev =>
                    prev.map((f, idx) => idx === i ? { ...f, progress: 100 } : f)
                );

                toast.success(`${file.name} uploaded!`);

            } catch (err: any) {
                setUploadingFiles(prev =>
                    prev.map((f, idx) => idx === i ? { ...f, error: err.message } : f)
                );
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        // Clear upload tracking after delay
        setTimeout(() => {
            setUploadingFiles([]);
            fetchSources();
        }, 1500);
    };

    const readFileContent = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            // For text-based files
            if (file.type.startsWith("text/") || 
                file.type === "application/json" ||
                file.name.endsWith(".md")) {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsText(file);
            }
            // For images, we'll extract text via AI vision in future
            else if (file.type.startsWith("image/")) {
                resolve(`[Image file: ${file.name} - Image analysis with AI vision coming soon]`);
            }
            // PDF should be handled server-side
            else if (file.type === "application/pdf") {
                reject(new Error("PDF should be processed server-side"));
            }
            else {
                reject(new Error("Unsupported file type"));
            }
        });
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleWebsitesClick = () => {
        urlInputRef.current?.focus();
        urlInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const handleDriveClick = () => {
        toast.info("Google Drive integration coming soon!", {
            description: "We'll notify you when this feature is available.",
        });
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
                    {/* New Intake Interface - Light Mode */}
                    <div className="space-y-6">
                        {/* URL/Search Bar */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary-500/5 rounded-2xl blur-xl transition-all duration-300 group-focus-within:bg-primary-500/10" />
                            <div className="relative flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-2xl shadow-sm transition-all duration-300 focus-within:border-primary-500/50">
                                <Search className="ml-3 h-5 w-5 text-gray-400" />
                                <Input
                                    ref={urlInputRef}
                                    placeholder="Search the web for new sources"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    className="flex-1 bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                                    onKeyDown={(e) => e.key === "Enter" && handleIngest()}
                                />
                                
                                <div className="flex items-center gap-1.5 px-1.5">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 rounded-lg bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200"
                                        onClick={handleWebsitesClick}
                                    >
                                        <Globe className="h-3.5 w-3.5 mr-1.5" />
                                        Web
                                        <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50" />
                                    </Button>
                                    <Button 
                                        onClick={handleIngest}
                                        disabled={isIngesting || !urlInput.trim()}
                                        size="icon" 
                                        className="h-8 w-8 rounded-full bg-primary-600 hover:bg-primary-700 transition-all shrink-0 ml-1 text-white"
                                    >
                                        {isIngesting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ArrowRight className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Drop Zone & Category Actions */}
                        <div 
                            className={cn(
                                "relative overflow-hidden rounded-3xl border-2 bg-white shadow-sm transition-all duration-300",
                                isDragging 
                                    ? "border-primary-500 bg-primary-50 scale-[1.02]" 
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={Object.values(ACCEPTED_FILE_TYPES).join(",")}
                                multiple
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <div className="px-6 py-12 md:py-16 text-center space-y-4">
                                {/* Uploading files indicator */}
                                {uploadingFiles.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        {uploadingFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 max-w-sm mx-auto">
                                                <FileText className="h-5 w-5 text-primary-500 flex-shrink-0" />
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                                    {file.error ? (
                                                        <p className="text-xs text-red-500">{file.error}</p>
                                                    ) : file.progress === 100 ? (
                                                        <p className="text-xs text-green-600">Complete!</p>
                                                    ) : (
                                                        <p className="text-xs text-gray-500">{file.progress === 50 ? "Processing..." : "Uploading..."}</p>
                                                    )}
                                                </div>
                                                {file.progress === 100 && !file.error && (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className={cn("space-y-2 transition-opacity", uploadingFiles.length > 0 && "opacity-50")}>
                                    <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                                        <CloudUpload className={cn(
                                            "h-8 w-8 text-primary-600 transition-transform",
                                            isDragging && "scale-110"
                                        )} />
                                    </div>
                                    <h4 className={cn(
                                        "text-xl md:text-2xl font-semibold tracking-tight transition-colors",
                                        isDragging ? "text-primary-600" : "text-gray-900"
                                    )}>
                                        {isDragging ? "Drop files here" : "or drop your files"}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        pdf, images, docs, <span className="underline underline-offset-4 decoration-gray-200">and more</span>
                                    </p>
                                </div>

                                <div className="pt-8 flex flex-wrap justify-center gap-3">
                                    <Button 
                                        variant="ghost" 
                                        onClick={handleUploadButtonClick}
                                        className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl h-11 px-6 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Upload files
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        onClick={handleWebsitesClick}
                                        className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl h-11 px-6 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Link className="h-4 w-4 mr-2 text-primary-500" />
                                        Websites
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        onClick={handleDriveClick}
                                        className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl h-11 px-6 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Triangle className="h-4 w-4 mr-2 rotate-180" />
                                        Drive
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setIsManualOpen(true)}
                                        className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl h-11 px-6 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Clipboard className="h-4 w-4 mr-2" />
                                        Copied text
                                    </Button>
                                </div>
                            </div>

                            {/* Decorative Dashed Border Overlay */}
                            <div className="absolute inset-4 pointer-events-none border-2 border-dashed border-gray-100 rounded-2xl" />
                        </div>
                    </div>

                    {/* Manual Intake Dialog - Light Mode */}
                    <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
                        <DialogContent className="sm:max-w-[500px] bg-white border-gray-200 text-gray-900 shadow-xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-900">Manual Intelligence Intake</DialogTitle>
                                <DialogDescription className="text-gray-500">
                                    Paste a long-form text, research notes, or a thread you want to deconstruct into your knowledge base.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Textarea
                                    placeholder="Paste your content here..."
                                    value={manualText}
                                    onChange={(e) => setManualText(e.target.value)}
                                    className="min-h-[300px] bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-primary-500 rounded-xl"
                                />
                            </div>
                            <DialogFooter>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setIsManualOpen(false)}
                                    className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleManualIngest}
                                    disabled={isIngesting || !manualText.trim()}
                                    className="bg-primary-600 hover:bg-primary-700 text-white gap-2 shadow-sm"
                                >
                                    {isIngesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Save Intelligence
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

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

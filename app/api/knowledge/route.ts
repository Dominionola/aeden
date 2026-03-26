import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchArticle, validateUrl } from "@/lib/web-scraper/client";
import { refactorContent } from "@/lib/ai/knowledge-architect";

export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("knowledge_vault")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch knowledge vault:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sources: data });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { source_url, source_title, tags } = body;

    if (!source_url && !source_title) {
        return NextResponse.json(
            { error: "Either source_url or source_title is required" },
            { status: 400 }
        );
    }

    let articleContent: { title: string; content: string; author: string | null; publishedAt: string | null; sourceUrl: string } | null = null;
    let contentToRefactor = "";
    let resolvedTitle = source_title || "Manual Entry";
    let resolvedUrl = source_url || null;
    let sourceType: "web" | "pdf" | "manual" = "web";

    if (source_url) {
        const urlValidation = validateUrl(source_url);
        if (!urlValidation.valid) {
            return NextResponse.json({ error: urlValidation.error }, { status: 400 });
        }

        const scrapeResult = await fetchArticle(source_url);

        if (!scrapeResult.success) {
            return NextResponse.json(
                { error: `Failed to fetch article: ${scrapeResult.error}` },
                { status: 422 }
            );
        }

        articleContent = scrapeResult.article!;
        contentToRefactor = articleContent.content;
        resolvedTitle = articleContent.title;
        resolvedUrl = articleContent.sourceUrl;
        sourceType = "web";
    } else if (source_title) {
        sourceType = "manual";
    }

    let intelligence;
    try {
        intelligence = await refactorContent(contentToRefactor, resolvedTitle);
    } catch (err) {
        console.error("Failed to process content with AI:", err);
        return NextResponse.json(
            { error: "Failed to process content" },
            { status: 502 }
        );
    }

    const { data, error } = await supabase
        .from("knowledge_vault")
        .insert({
            user_id: user.id,
            source_title: resolvedTitle,
            source_url: resolvedUrl,
            source_type: sourceType,
            source_content: articleContent?.content || null,
            metadata: intelligence.metadata,
            voice_analysis: intelligence.voice_analysis,
            intelligence_blocks: intelligence.intelligence_blocks,
            contrarian_takes: intelligence.contrarian_takes,
            suggested_hashtags: intelligence.suggested_hashtags_and_keywords,
            tags: tags || [],
            is_active: true,
        })
        .select()
        .single();

    if (error) {
        console.error("Failed to save to knowledge vault:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ source: data }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildKnowledgeContext, type IntelligenceModule } from "@/lib/ai/knowledge-architect";

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

    const { input, limit = 10, activeOnly = true } = body;

    let query = supabase
        .from("knowledge_vault")
        .select("id, metadata, voice_analysis, intelligence_blocks, contrarian_takes, suggested_hashtags, times_used, last_used_at")
        .eq("user_id", user.id);

    if (activeOnly) {
        query = query.eq("is_active", true);
    }

    const { data: entries, error } = await query
        .order("times_used", { ascending: false })
        .order("last_used_at", { ascending: false, nullsFirst: false })
        .limit(limit);

    if (error) {
        console.error("Failed to fetch vault entries for recall:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const intelligenceModules: IntelligenceModule[] = entries?.map(entry => ({
        metadata: entry.metadata as IntelligenceModule["metadata"],
        voice_analysis: entry.voice_analysis as IntelligenceModule["voice_analysis"],
        intelligence_blocks: entry.intelligence_blocks as IntelligenceModule["intelligence_blocks"],
        contrarian_takes: entry.contrarian_takes || [],
        suggested_hashtags_and_keywords: entry.suggested_hashtags || [],
    })) || [];

    const context = buildKnowledgeContext(intelligenceModules);

    return NextResponse.json({
        context,
        sources: entries?.map(e => ({
            id: e.id,
            title: e.metadata?.source_title,
            times_used: e.times_used,
            last_used_at: e.last_used_at,
        })),
    });
}

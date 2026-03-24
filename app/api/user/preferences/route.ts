import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
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
    const { user_id, user_type, brand_guidelines, target_audience, categories, topics, refinement, ai_context, auto_learn_persona, voice_analysis, tone, preferred_ai_model } = body;
    const { error } = await supabase
        .from("user_preferences")
        .upsert({
            user_id: user.id,
            user_type: user_type ?? "developer",
            brand_guidelines: brand_guidelines ?? null,
            target_audience: target_audience ?? null,
            categories: categories ?? [],
            topics: topics ?? [],
            refinement: refinement ?? null,
            ai_context: ai_context ?? null,
            auto_learn_persona: auto_learn_persona ?? true,
            voice_analysis: voice_analysis ?? null,
            tone: tone ?? "professional",
            preferred_ai_model: preferred_ai_model ?? "gemini-2.0-flash",
            updated_at: new Date().toISOString(),
        }, {
            onConflict: "user_id",
        });

    if (error) {
        console.error("Failed to save preferences:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}

export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preferences: data });
}

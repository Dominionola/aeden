import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generate, type GenerateOptions, type AiModel } from "@/lib/ai/client";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { input, archetype, creatorBookmarks, brandGuidelines, tone: bodyTone, preferred_ai_model: bodyModel } = body;

        if (!input) {
            return NextResponse.json({ error: "Input is required" }, { status: 400 });
        }

        // Fetch user preferences for fallback if not provided in body
        const { data: prefs, error: dbError } = await supabase
            .from('user_preferences')
            .select('voice_analysis, ai_context, brand_guidelines, tone, preferred_ai_model')
            .eq('user_id', user.id)
            .maybeSingle();

        if (dbError) {
            console.warn("Could not fetch user preferences:", dbError.message);
        }

        const options: GenerateOptions = {
            input,
            tone: (bodyTone || prefs?.tone || 'professional') as GenerateOptions['tone'],
            model: (bodyModel || prefs?.preferred_ai_model || 'gemini-2.0-flash') as AiModel,
            archetype,
            voiceAnalysis: prefs?.voice_analysis,
            aiContext: prefs?.ai_context,
            creatorBookmarks,
            brandGuidelines: brandGuidelines || prefs?.brand_guidelines,
        };

        const content = await generate(options);

        return NextResponse.json({
            content,
            model: options.model,
            tone: options.tone
        });

    } catch (error) {
        console.error("Generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate post" },
            { status: 500 }
        );
    }
}

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
        const { input, archetype, creatorBookmarks, brandGuidelines } = body;

        if (!input) {
            return NextResponse.json({ error: "Input is required" }, { status: 400 });
        }

        // Fetch user preferences for voice analysis if not provided in body
        // In a real flow, we might fetch this from DB here if the FE didn't send it
        const { data: prefs } = await supabase
            .from('user_preferences')
            .select('voice_analysis, ai_context, brand_guidelines')
            .eq('user_id', user.id)
            .single();

        const options: GenerateOptions = {
            input,
            tone: 'casual', // default ignored placeholder
            model: 'gemini', // default since model selection is removed
            archetype,
            voiceAnalysis: prefs?.voice_analysis,
            aiContext: prefs?.ai_context,
            creatorBookmarks,
            brandGuidelines: brandGuidelines || prefs?.brand_guidelines,
        };

        const content = await generate(options);

        return NextResponse.json({
            content,
            model: options.model
        });

    } catch (error) {
        console.error("Generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate post" },
            { status: 500 }
        );
    }
}

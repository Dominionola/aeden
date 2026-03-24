import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateAIStrategy } from "@/lib/ai/client";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Fetch User Data
        const { data: prefs } = await supabase
            .from("user_preferences")
            .select("categories, topics, brand_guidelines, voice_analysis, ai_context")
            .eq("user_id", user.id)
            .single();

        if (!prefs) {
            return NextResponse.json({ error: "User preferences not found" }, { status: 400 });
        }

        // 2. Fetch Top Performing Posts
        const { data: topPosts } = await supabase
            .from("posts")
            .select("content, template_id, id, created_at")
            .eq("user_id", user.id)
            .eq("status", "published")
            .order("likes", { ascending: false })
            .limit(5);

        if (!topPosts || topPosts.length < 3) {
            return NextResponse.json({ 
                error: "Insufficient data", 
                message: "Need at least 3 published posts with engagement to generate strategy." 
            }, { status: 400 });
        }

        // 3. Generate Strategy with AI
        const strategy = await generateAIStrategy({
            persona: prefs.ai_context || "",
            voiceAnalysis: prefs.voice_analysis,
            topPosts: topPosts.map(p => ({
                content: p.content,
                template: p.template_id,
            }))
        });

        // 4. Update Preferences with new Strategy Insights
        await supabase
            .from("user_preferences")
            .update({ 
                last_strategy_at: new Date().toISOString(),
                strategy_insights: strategy 
            })
            .eq("user_id", user.id);

        return NextResponse.json({ strategy });

    } catch (error: any) {
        console.error("[STRATEGY_API_ERROR]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

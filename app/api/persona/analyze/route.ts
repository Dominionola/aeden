import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeEdits } from "@/lib/ai/client";

/**
 * POST /api/persona/analyze
 * Triggers the "Layer 3" Pattern Extraction engine.
 * Analyzes the differences between AI drafts and user edits to learn writing rules.
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Check if user has auto-learn enabled
        const { data: prefs, error: prefsError } = await supabase
            .from("user_preferences")
            .select("auto_learn_persona, voice_analysis")
            .eq("user_id", user.id)
            .single();

        if (prefsError) throw prefsError;

        if (prefs?.auto_learn_persona === false) {
            return NextResponse.json({ 
                error: "Auto-learn disabled", 
                message: "Please enable 'Continuous Pattern Learning' in your settings to use this feature." 
            }, { status: 400 });
        }

        // 2. Fetch recent post edits for this user
        // We join with 'posts' to ensure we only get edits belonging to this user
        const { data: edits, error: editsError } = await supabase
            .from("post_edits")
            .select(`
                original_ai_text,
                user_edited_text,
                posts!inner(user_id)
            `)
            .eq("posts.user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10);

        if (editsError) throw editsError;

        if (!edits || edits.length < 3) {
            return NextResponse.json({ 
                error: "Insufficient data", 
                message: `You've edited ${edits?.length || 0}/3 posts. Edit a few more generated posts so the AI has enough data to learn your style!` 
            }, { status: 400 });
        }

        const editPairs = edits.map(e => ({
            original: e.original_ai_text,
            edited: e.user_edited_text
        }));

        // 3. Perform AI Analysis
        // We use Gemini 2.0 Flash for this as it's excellent at pattern recognition and very fast
        const result = await analyzeEdits(editPairs, "gemini") as any;
        
        if (!result.voice_analysis) {
            throw new Error("AI failed to extract voice analysis patterns");
        }

        // 4. Update User Preferences with the new "AI Brain" rules
        const { error: updateError } = await supabase
            .from("user_preferences")
            .update({
                voice_analysis: result.voice_analysis,
                updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);

        if (updateError) throw updateError;

        return NextResponse.json({
            message: "Persona patterns extracted successfully!",
            analysis: result.voice_analysis
        });

    } catch (error: any) {
        console.error("Pattern extraction error:", error);
        return NextResponse.json({ 
            error: "Internal server error", 
            message: error.message 
        }, { status: 500 });
    }
}

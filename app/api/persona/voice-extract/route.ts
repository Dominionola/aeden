import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeVoice } from "@/lib/ai/client";

/**
 * POST /api/persona/voice-extract
 * Takes 2-10 raw writing samples (past posts from anywhere),
 * extracts a structured voice profile, and saves it to user_preferences.
 *
 * Body: { posts: string[] }
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const { posts }: { posts: string[] } = body;

        if (!posts || !Array.isArray(posts)) {
            return NextResponse.json({ error: "posts array is required" }, { status: 400 });
        }

        const cleanedPosts = posts
            .map((p) => (typeof p === "string" ? p.trim() : ""))
            .filter((p) => p.length > 20);

        if (cleanedPosts.length < 2) {
            return NextResponse.json({
                error: "Insufficient samples",
                message: "Please provide at least 2 posts with meaningful content (20+ characters each).",
            }, { status: 400 });
        }

        if (cleanedPosts.length > 10) {
            return NextResponse.json({
                error: "Too many samples",
                message: "Please provide no more than 10 posts.",
            }, { status: 400 });
        }

        // Run AI voice extraction (Groq by default for speed)
        const result = await analyzeVoice(cleanedPosts, "groq") as any;

        if (!result || typeof result !== "object") {
            throw new Error("AI returned an unexpected response format.");
        }

        // The analyzeVoice function returns the full profile directly
        const voiceProfile = result.voice_analysis ?? result;

        const { error: updateError } = await supabase
            .from("user_preferences")
            .upsert({
                user_id: user.id,
                voice_analysis: voiceProfile,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        if (updateError) throw updateError;


    return NextResponse.json({
        message: "Voice profile extracted and saved!",
        analysis: voiceProfile,
        samplesAnalyzed: cleanedPosts.length,
    });

} catch (error: any) {
    console.error("Voice extraction error:", error);
    return NextResponse.json({
        error: "Extraction failed",
        message: error.message,
    }, { status: 500 });
}
}

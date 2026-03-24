import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VoiceForm from "@/components/dashboard/settings/voice-form";

export const metadata = {
    title: "Voice & Persona | Aeden",
    description: "Customize your writing tone and AI persona.",
};

export default async function VoicePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Get or create user preferences
    const { data: prefs } = await supabase
        .from("user_preferences")
        .select("user_type, brand_guidelines, categories, topics, refinement, target_audience, auto_learn_persona, voice_analysis, tone, preferred_ai_model")
        .eq("user_id", user.id)
        .maybeSingle();

    const initialPrefs = {
        user_type: prefs?.user_type ?? "developer",
        categories: prefs?.categories ?? [],
        topics: prefs?.topics ?? [],
        target_audience: prefs?.target_audience ?? null,
        refinement: prefs?.refinement ?? null,
        brand_guidelines: prefs?.brand_guidelines ?? null,
        auto_learn_persona: prefs?.auto_learn_persona ?? true,
        voice_analysis: prefs?.voice_analysis ?? null,
        tone: prefs?.tone ?? "professional",
        preferred_ai_model: prefs?.preferred_ai_model ?? "gemini-2.0-flash",
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">Voice & Persona</h1>
                <p className="text-muted-foreground">
                    Tell Aeden who you are — it uses this to write posts that actually sound like you.
                </p>
            </div>

            <VoiceForm initialPrefs={initialPrefs} />
        </div>
    );
}

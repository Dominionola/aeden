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
        .select("user_type, tone, brand_guidelines, preferred_ai_model")
        .eq("user_id", user.id)
        .maybeSingle();

    const initialPrefs = {
        user_type: prefs?.user_type ?? "developer",
        tone: prefs?.tone ?? "casual",
        brand_guidelines: prefs?.brand_guidelines ?? null,
        preferred_ai_model: prefs?.preferred_ai_model ?? "gemini",
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

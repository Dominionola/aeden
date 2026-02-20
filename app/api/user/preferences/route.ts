import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { user_type, tone, preferred_ai_model, brand_guidelines } = body;

    const { error } = await supabase
        .from("user_preferences")
        .upsert({
            user_id: user.id,
            user_type: user_type ?? "developer",
            tone: tone ?? "casual",
            preferred_ai_model: preferred_ai_model ?? "gemini",
            brand_guidelines: brand_guidelines ?? null,
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

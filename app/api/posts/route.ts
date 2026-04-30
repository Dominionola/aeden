
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { analyzeEdits } from "@/lib/ai/client";

/**
 * Auto-triggers voice pattern extraction when the user accumulates
 * enough edit pairs. Runs silently in the background — no user action needed.
 */
async function maybeRunAutoLearn(supabase: any, userId: string) {
    try {
        const { data: prefs } = await supabase
            .from("user_preferences")
            .select("auto_learn_persona")
            .eq("user_id", userId)
            .single();

        if (!prefs?.auto_learn_persona) return;

        // Count how many unprocessed edits exist
        const { count } = await supabase
            .from("post_edits")
            .select("id", { count: "exact", head: true })
            .eq("posts.user_id", userId)
            .not("original_ai_text", "is", null);

        // Only run analysis at every 3rd edit (3, 6, 9…)
        if (!count || count % 3 !== 0) return;

        const { data: edits } = await supabase
            .from("post_edits")
            .select(`original_ai_text, user_edited_text, posts!inner(user_id)`)
            .eq("posts.user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10);

        if (!edits || edits.length < 3) return;

        const editPairs = edits.map((e: any) => ({
            original: e.original_ai_text,
            edited: e.user_edited_text,
        }));

        const result = await analyzeEdits(editPairs, "groq") as any;
        const voiceAnalysis = result?.voice_analysis ?? result;

        if (voiceAnalysis?.tone && voiceAnalysis?.characteristics) {
            await supabase
                .from("user_preferences")
                .update({ voice_analysis: voiceAnalysis, updated_at: new Date().toISOString() })
                .eq("user_id", userId);
            console.log(`[AutoLearn] Voice model updated for user ${userId} after ${count} edits.`);
        }
    } catch (err) {
        // Silently fail — this is a background enrichment, never block the main request
        console.warn("[AutoLearn] Background pattern extraction failed:", err);
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { content, image_url, tone, original_ai_text } = body;

        // Basic validation
        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("posts")
            .insert({
                user_id: user.id,
                content,
                image_url,
                source_type: "manual",
                status: "draft",
                // If tone was passed, we might want to store it or use it during generation
                // For now, we just store the post.
                // If we need to store tone specifically for this post, we'd need a column for it
                // or put it in source_data.
            })
            .select()
            .single();

        if (error) {
            console.error("Create post error:", error);
            return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
        }

        if (original_ai_text && content !== original_ai_text) {
            const { error: editError } = await supabase.from("post_edits").insert({
                post_id: data.id,
                original_ai_text,
                user_edited_text: content,
                changes: { modified: true, length_diff: content.length - original_ai_text.length }
            });
            if (editError) {
                console.error("Failed to record post edit:", editError);
            } else {
                // Silently auto-learn in the background — don't await, never block the response
                maybeRunAutoLearn(supabase, user.id);
            }
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error("Create post route error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, content, image_url, status, original_ai_text } = body;

        if (!id) {
            return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
        }

        // Verify ownership (Row Level Security handles this on DB, but good to check or handle 0 rows updated)
        const { data, error } = await supabase
            .from("posts")
            .update({
                content,
                image_url,
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", user.id) // Extra safety
            .select()
            .single();

        if (error) {
            console.error("Update post error:", error);
            if (error.code === "PGRST116") {
                return NextResponse.json({ error: "Post not found" }, { status: 404 });
            }
            return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
        }

        if (original_ai_text && content && content !== original_ai_text) {
            const { error: editError } = await supabase.from("post_edits").insert({
                post_id: id,
                original_ai_text,
                user_edited_text: content,
                changes: { modified: true, length_diff: content.length - original_ai_text.length }
            });
            if (editError) {
                console.error("Failed to record post edit:", editError);
            } else {
                // Silently auto-learn in the background — don't await, never block the response
                maybeRunAutoLearn(supabase, user.id);
            }
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error("Update post route error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("posts")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            console.error("Delete post error:", error);
            return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete post route error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch posts error:", error);
            return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Fetch posts route error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
        const { content, image_url, tone } = body;

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
        const { id, content, image_url, status } = body;

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
            return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
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

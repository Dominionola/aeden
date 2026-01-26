
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

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }
        // Validation
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File too large. Max 5MB." },
                { status: 400 }
            );
        }

        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP allowed." },
                { status: 400 }
            );
        }

        const fileExt = file.name.split(".").pop();
        const MIME_TO_EXT: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/webp": "webp",
        };

        const fileExt = MIME_TO_EXT[file.type];
        const fileName = `${user.id}/${Date.now()}.${fileExt}`; const { error: uploadError } = await supabase.storage
            .from("post-images")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json(
                { error: "Failed to upload image" },
                { status: 500 }
            );
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error("Upload route error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

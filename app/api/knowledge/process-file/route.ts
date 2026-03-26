import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPDF, extractTextFromImage } from "@/lib/ai/file-extractor";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
        }

        let content = "";
        let fileName = file.name.replace(/\.[^/.]+$/, "");

        // Read file buffer
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Handle different file types using Gemini
        if (file.type === "application/pdf") {
            // Use Gemini to natively extract text from PDF
            try {
                content = await extractTextFromPDF(fileBuffer, file.name);
            } catch (extractError) {
                console.error("PDF extraction failed:", extractError);
                return NextResponse.json({ 
                    error: `Failed to extract text from PDF: ${extractError instanceof Error ? extractError.message : "Unknown error"}` 
                }, { status: 422 });
            }
        } else if (file.type.startsWith("image/")) {
            // Use Gemini Vision to extract text from images
            try {
                content = await extractTextFromImage(fileBuffer, file.type, file.name);
            } catch (extractError) {
                console.error("Image extraction failed:", extractError);
                return NextResponse.json({ 
                    error: `Failed to extract text from image: ${extractError instanceof Error ? extractError.message : "Unknown error"}` 
                }, { status: 422 });
            }
        } else if (file.type.startsWith("text/") || 
                   file.type === "application/json" ||
                   file.name.endsWith(".md")) {
            // Text files - read directly
            content = await file.text();
        } else if (file.type.includes("word") || file.name.endsWith(".docx")) {
            // Word documents - return placeholder for now
            content = `[Word document: ${file.name} - For best results, copy the text content and paste it using "Copied text" option, or convert to PDF]`;
        } else {
            return NextResponse.json({ 
                error: `Unsupported file type: ${file.type}` 
            }, { status: 400 });
        }

        if (content.length < 50) {
            return NextResponse.json({ 
                error: "File content too short to extract meaningful intelligence" 
            }, { status: 422 });
        }

        return NextResponse.json({
            success: true,
            content,
            fileName,
            fileType: file.type,
            processedBy: "gemini-native"
        });

    } catch (error) {
        console.error("File processing error:", error);
        return NextResponse.json(
            { error: "Failed to process file" },
            { status: 500 }
        );
    }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function extractTextFromPDF(fileBuffer: Buffer, fileName: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Convert buffer to base64
        const base64Data = fileBuffer.toString("base64");
        
        // For Gemini 2.0, we use inline data with the correct MIME type
        // The model will parse the PDF natively
        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [{
                    inlineData: {
                        mimeType: "application/pdf",
                        data: base64Data
                    }
                }, {
                    text: `Extract all text content from this PDF document "${fileName}". 
                    
Return ONLY the raw text content, preserving:
- Paragraph structure
- List items
- Table content (as plain text)
- Section headers

Do NOT include page numbers, headers, footers, or formatting notes.
Just the actual readable content.`
                }]
            }]
        });

        const response = result.response;
        return response.text();

    } catch (error) {
        console.error("Gemini PDF extraction error:", error);
        throw new Error(`Failed to extract text from PDF using Gemini: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function extractTextFromImage(fileBuffer: Buffer, mimeType: string, fileName: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Convert buffer to base64
        const base64Data = fileBuffer.toString("base64");

        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [{
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                }, {
                    text: `Analyze this image "${fileName}" and extract all readable text content.
                    
If this is a screenshot or document image, extract all visible text.
If this is a photo without text, describe the key visual elements that could be relevant for creating social media content.
                    
Return the extracted text or visual description.`
                }]
            }]
        });

        const response = result.response;
        return response.text();

    } catch (error) {
        console.error("Gemini image extraction error:", error);
        throw new Error(`Failed to extract text from image using Gemini: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function analyzeDocumentWithGemini(
    content: string, 
    fileName: string, 
    fileType: string
): Promise<{
    summary: string;
    keyTopics: string[];
    suggestedTags: string[];
}> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [{
                    text: `Analyze this ${fileType} document "${fileName}" and provide:

Content:
${content.substring(0, 5000)}${content.length > 5000 ? "..." : ""}

Respond ONLY with valid JSON:
{
    "summary": "2-3 sentence summary of the document",
    "keyTopics": ["topic1", "topic2", "topic3"],
    "suggestedTags": ["tag1", "tag2", "tag3"]
}`
                }]
            }]
        });

        const response = result.response;
        const text = response.text();

        // Try to parse as JSON
        try {
            // Remove markdown code blocks if present
            const jsonStr = text.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch {
            // Return default if parsing fails
            return {
                summary: "Document analyzed successfully",
                keyTopics: ["content"],
                suggestedTags: ["document"]
            };
        }

    } catch (error) {
        console.error("Gemini document analysis error:", error);
        return {
            summary: "Analysis unavailable",
            keyTopics: [],
            suggestedTags: []
        };
    }
}

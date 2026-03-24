import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt, getUserPrompt } from "./prompts";
import { type AiArchetype } from "./client";

export interface GeminiGenerateOptions {
    input: string;
    tone: string;
    archetype?: AiArchetype;
    voiceAnalysis?: {
        tone: string;
        characteristics: string[];
        voice_summary: string;
        common_patterns?: {
            emoji_usage?: string;
            line_breaks?: string;
        };
    };
    creatorBookmarks?: Array<{ username: string }>;
    brandGuidelines?: string;
    maxTokens?: number;
    aiContext?: string | null;
}

function getClient() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is required");
    }
    return new GoogleGenerativeAI(apiKey);
}

export async function generateWithGemini(options: GeminiGenerateOptions): Promise<string> {
    const genAI = getClient();
    const {
        input,
        tone,
        voiceAnalysis,
        aiContext,
        creatorBookmarks,
        brandGuidelines,
        maxTokens = 1000
    } = options;

    const charLimit = 500;

    // Build persona context
    let personaContext = "";

    if (voiceAnalysis) {
        personaContext += `\n\nWriter's voice characteristics:
- Tone: ${voiceAnalysis.tone}
- Patterns: ${voiceAnalysis.characteristics?.join(", ")}
- Style: ${voiceAnalysis.voice_summary}

Match this voice exactly while adopting the selected archetype.`;
    }

    if (creatorBookmarks && creatorBookmarks.length > 0) {
        personaContext += `\n\nStyle inspiration (blend elements from):
${creatorBookmarks.map((c) => `- ${c.username}'s storytelling approach`).join("\n")}

Study their patterns but maintain the user's authentic voice and the template's structure.`;
    }

    const systemPrompt = getSystemPrompt(aiContext, brandGuidelines, personaContext);
    const userPrompt = getUserPrompt(input, tone);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: systemPrompt
    });

    try {
        const result = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: userPrompt }] }
            ],
            generationConfig: {
                maxOutputTokens: maxTokens,
                temperature: 0.8,
            },
        });

        const response = result.response;
        const postText = response.text().trim();

        if (postText.length > charLimit) {
            return postText.substring(0, charLimit - 3) + "...";
        }

        return postText;
    } catch (error) {
        throw new Error(`Failed to generate content with Gemini: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function analyzeVoiceWithGemini(pastPosts: string[]): Promise<object> {
    const genAI = getClient();
    if (pastPosts.length === 0) {
        throw new Error("At least one post is required for voice analysis");
    }

    const prompt = `Analyze these social media posts and identify the writer's voice characteristics:

${pastPosts.map((p, i) => `Post ${i + 1}: "${p}"`).join("\n\n")}

Extract and return ONLY a JSON object with these keys:
{
  "tone": "casual|professional|technical|humorous|inspirational",
  "characteristics": [
    "list of 3-5 distinctive traits",
    "e.g., uses short sentences",
    "e.g., includes personal anecdotes",
    "e.g., ends with questions"
  ],
  "common_patterns": {
    "sentence_length": "short|medium|long",
    "emoji_usage": "none|occasional|frequent",
    "line_breaks": "none|some|many",
    "hashtag_usage": "none|minimal|moderate|heavy"
  },
  "voice_summary": "2-3 sentence description of their unique voice"
}

Output ONLY valid JSON, nothing else.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.3,
            },
        });

        const response = result.response;
        const analysisText = response.text().trim();

        return JSON.parse(analysisText);
    } catch (error) {
        throw new Error(`Failed to analyze voice with Gemini: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function analyzeEditsWithGemini(
    edits: Array<{ original: string; edited: string }>
): Promise<object> {
    const genAI = getClient();
    if (edits.length === 0) {
        throw new Error("At least one edit pair is required for pattern extraction");
    }

    const prompt = `Analyze these pairs of AI-generated text vs user-edited text to identify consistent stylistic patterns and rules the user follows:

${edits.map((e, i) => `Pair ${i + 1}:
Original AI: "${e.original}"
User Edited: "${e.edited}"`).join("\n\n")}

Extracted Writing Rules:
Based on the edits above, identify 5-7 clear, actionable writing rules that the AI should follow to match the user's style better. Focus on:
- Sentence structure and length
- Emoji density and placement
- Hook style (opening line)
- Structural patterns (line breaks, lists)
- Tone shifts (did they make it more raw? more professional?)

Return ONLY a JSON object with this key:
{
  "voice_analysis": {
    "tone": "casual|professional|technical|humorous|inspirational",
    "characteristics": ["rule 1", "rule 2", "rule 3", "rule 4", "rule 5"],
    "common_patterns": {
      "sentence_length": "short|medium|long", 
      "emoji_usage": "none|occasional|frequent",
      "line_breaks": "none|some|many"
    },
    "voice_summary": "A 2-3 sentence summary of the writing style."
  }
}

Output ONLY valid JSON.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.2,
            },
        });

        const text = result.response.text().trim();
        // Clean markdown if present
        const jsonStr = text.startsWith("```json") ? text.replace(/```json|```/g, "").trim() : text;
        return JSON.parse(jsonStr);
    } catch (error) {
        throw new Error(`Failed to extract patterns with Gemini: ${error instanceof Error ? error.message : String(error)}`);
    }
}

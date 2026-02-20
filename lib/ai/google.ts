import { GoogleGenerativeAI } from "@google/generative-ai";
import { ARC_PROMPTS, getSystemPrompt, getUserPrompt } from "./prompts";
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
        archetype = 'observer',
        voiceAnalysis,
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

Study their patterns but maintain the user's authentic voice and the archetype's structure.`;
    }

    if (brandGuidelines) {
        personaContext += `\n\nBrand guidelines (MUST follow):
${brandGuidelines}`;
    }

    const systemPrompt = getSystemPrompt(archetype);
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

import Anthropic from "@anthropic-ai/sdk";
import { ARC_PROMPTS, getSystemPrompt, getUserPrompt } from "./prompts";
import { type AiArchetype } from "./client";

export interface ClaudeGenerateOptions {
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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY environment variable is required");
    }
    return new Anthropic({ apiKey });
}

export async function generateWithClaude(options: ClaudeGenerateOptions): Promise<string> {
    const anthropic = getClient();
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

    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
        });

        const postText = message.content[0].type === "text" ? message.content[0].text.trim() : "";

        if (postText.length > charLimit) {
            return postText.substring(0, charLimit - 3) + "...";
        }

        return postText;
    } catch (error) {
        if (error instanceof Anthropic.APIError) {
            throw new Error(`Claude API error: ${error.message}`);
        }
        throw error;
    }
}

export async function analyzeVoiceWithClaude(pastPosts: string[]): Promise<object> {
    const anthropic = getClient();
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

    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            messages: [{ role: "user", content: prompt }],
        });

        const analysisText = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";

        return JSON.parse(analysisText);
    } catch (error) {
        if (error instanceof Anthropic.APIError) {
            throw new Error(`Claude API error: ${error.message}`);
        }
        throw error;
    }
}

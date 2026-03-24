import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt, getUserPrompt } from "./prompts";
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
    aiContext?: string | null;
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

export async function analyzeEditsWithClaude(
    edits: Array<{ original: string; edited: string }>
): Promise<object> {
    const anthropic = getClient();
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
- Tone shifts

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

    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            messages: [{ role: "user", content: prompt }],
        });

        const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
        // Clean markdown if present
        const jsonStr = text.startsWith("```json") ? text.replace(/```json|```/g, "").trim() : text;
        return JSON.parse(jsonStr);
    } catch (error) {
        if (error instanceof Anthropic.APIError) {
            throw new Error(`Claude API error: ${error.message}`);
        }
        throw error;
    }
}

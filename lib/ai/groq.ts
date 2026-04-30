import Groq from "groq-sdk";
import { getSystemPrompt, getUserPrompt } from "./prompts";
import { type AiArchetype } from "./client";

export interface GroqGenerateOptions {
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
    knowledgeContext?: string | null;
    useFastModel?: boolean;
}

function getClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY environment variable is required");
    }
    return new Groq({ apiKey });
}

export async function generateWithGroq(options: GroqGenerateOptions): Promise<string> {
    const groq = getClient();
    const {
        input,
        tone,
        voiceAnalysis,
        aiContext,
        knowledgeContext,
        creatorBookmarks,
        brandGuidelines,
        maxTokens = 1000,
        useFastModel = false
    } = options;

    const charLimit = 500;
    let personaContext = "";

    if (knowledgeContext) {
        personaContext += `\n\n${knowledgeContext}`;
    }

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

    const modelName = useFastModel ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile";

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: modelName,
            temperature: 0.8,
            max_tokens: maxTokens,
        });

        const postText = completion.choices[0]?.message?.content?.trim() || "";

        if (postText.length > charLimit) {
            return postText.substring(0, charLimit - 3) + "...";
        }

        return postText;
    } catch (error) {
        throw new Error(`Failed to generate content with Groq: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function analyzeVoiceWithGroq(pastPosts: string[]): Promise<object> {
    const groq = getClient();
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

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        });

        const analysisText = completion.choices[0]?.message?.content?.trim() || "{}";
        return JSON.parse(analysisText);
    } catch (error) {
        throw new Error(`Failed to analyze voice with Groq: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function analyzeEditsWithGroq(
    edits: Array<{ original: string; edited: string }>
): Promise<object> {
    const groq = getClient();
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

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        });

        const text = completion.choices[0]?.message?.content?.trim() || "{}";
        return JSON.parse(text);
    } catch (error) {
        throw new Error(`Failed to extract patterns with Groq: ${error instanceof Error ? error.message : String(error)}`);
    }
}

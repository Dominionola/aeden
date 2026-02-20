import { generateWithGemini, analyzeVoiceWithGemini, type GeminiGenerateOptions } from "./google";
import { generateWithClaude, analyzeVoiceWithClaude, type ClaudeGenerateOptions } from "./anthropic";

export type AiModel = "gemini" | "claude";
export type AiArchetype = "observer" | "prophet" | "devastator";

export interface GenerateOptions {
    input: string;
    tone: string;
    model?: AiModel;
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

/**
 * Unified AI generation function.
 * Defaults to Gemini 2.0 Flash for speed and cost.
 * Falls back to Claude for complex persona matching.
 */
export async function generate(options: GenerateOptions): Promise<string> {
    const { model = "gemini", ...rest } = options;

    if (model === "claude") {
        return generateWithClaude(rest as ClaudeGenerateOptions);
    }

    return generateWithGemini(rest as GeminiGenerateOptions);
}

/**
 * Analyze user's past posts to extract voice characteristics.
 * Uses the specified model or defaults to Gemini.
 */
export async function analyzeVoice(
    pastPosts: string[],
    model: AiModel = "gemini"
): Promise<object> {
    if (model === "claude") {
        return analyzeVoiceWithClaude(pastPosts);
    }

    return analyzeVoiceWithGemini(pastPosts);
}

/**
 * Get the model identifier for database storage.
 */
export function getModelVersion(model: AiModel): string {
    if (model === "claude") {
        return "claude-sonnet-4-20250514";
    }
    return "gemini-2.0-flash";
}

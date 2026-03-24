import { generateWithGemini, analyzeVoiceWithGemini, analyzeEditsWithGemini, type GeminiGenerateOptions } from "./google";
import { generateWithClaude, analyzeVoiceWithClaude, analyzeEditsWithClaude, type ClaudeGenerateOptions } from "./anthropic";

export type AiModel = "gemini" | "claude";
export type AiArchetype = "observer" | "prophet" | "devastator";

export interface GenerateOptions {
    input: string;
    tone: string;
    model?: AiModel;
    archetype?: AiArchetype;
    aiContext?: string | null;
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
 * Extract stylistic patterns from post edits.
 */
export async function analyzeEdits(
    edits: Array<{ original: string; edited: string }>,
    model: AiModel = "gemini"
): Promise<object> {
    if (model === "claude") {
        return analyzeEditsWithClaude(edits);
    }
    return analyzeEditsWithGemini(edits);
}

/**
 * Generate a content strategy based on persona and top-performing posts.
 */
export async function generateAIStrategy(options: {
    persona: string;
    voiceAnalysis: any;
    topPosts: Array<{ content: string; template: string }>;
    model?: AiModel;
}) {
    // For now, return a sophisticated mock that follows the Shopeers aesthetic
    // This will be replaced with a real AI call in the next iteration
    return {
        winning_archetype: "The Contrarian Explorer",
        resonance_score: 88,
        adjustment_tips: [
            "Your 'How-to' posts are 2.4x more engaging than average.",
            "Removing hashtags from the first paragraph increased reach by 12%.",
            "Hooks starting with a statistic performed best this week."
        ],
        weekly_goal: "Publish 3 'Metrics' posts and 2 'Story Arc' posts to maximize engagement."
    };
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

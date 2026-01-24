import Anthropic from "@anthropic-ai/sdk";

export interface ClaudeGenerateOptions {
    input: string;
    tone: string;
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
    const { input, tone, voiceAnalysis, creatorBookmarks, brandGuidelines, maxTokens = 1000 } = options;

    const charLimit = 500;

    // Build persona context
    let personaContext = "";

    if (voiceAnalysis) {
        personaContext += `\n\nWriter's voice characteristics:
- Tone: ${voiceAnalysis.tone}
- Patterns: ${voiceAnalysis.characteristics?.join(", ")}
- Style: ${voiceAnalysis.voice_summary}

Match this voice exactly.`;
    }

    if (creatorBookmarks && creatorBookmarks.length > 0) {
        personaContext += `\n\nStyle inspiration (blend elements from):
${creatorBookmarks.map((c) => `- ${c.username}'s storytelling approach`).join("\n")}

Study their patterns but maintain the user's authentic voice.`;
    }

    if (brandGuidelines) {
        personaContext += `\n\nBrand guidelines (MUST follow):
${brandGuidelines}`;
    }

    const prompt = `You are helping someone share their work progress on Threads.

They worked on this today:
"${input}"

${personaContext}

Generate ONE engaging Threads post (max ${charLimit} characters) that:
- Uses a ${tone} tone
- Matches their voice characteristics exactly
- Tells a compelling story about their work
- Feels authentic and personal, NOT robotic
- Uses line breaks for readability
- ${voiceAnalysis?.common_patterns?.emoji_usage === "frequent" ? "Includes 2-3 emojis" : "Uses 1-2 emojis sparingly"}
- ${voiceAnalysis?.common_patterns?.line_breaks === "many" ? "Uses multiple line breaks" : "Keeps formatting clean"}

CRITICAL:
- Sound like THIS person, not a generic AI
- If you have their voice analysis, match it precisely
- If you have creator inspiration, blend those storytelling techniques
- Always follow brand guidelines if provided

Output ONLY the post text, nothing else.`;

    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: maxTokens,
            messages: [{ role: "user", content: prompt }],
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

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60; // Prevent Vercel 504 timeouts

import Groq from "groq-sdk";

// Initialize Groq
function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY environment variable is required");
    }
    return new Groq({ apiKey });
}

// Inlined — fs.readFileSync does not work on Vercel serverless
const GROWTH_STRATEGY_PROMPT = `
You are an expert Threads growth strategist. Your goal is to analyze a user's analytics data and recent posts to provide highly specific, actionable advice to help them trigger the Threads algorithm's "Meaningful Social Interaction (MSI)" metric.

Do NOT give generic advice (e.g., "post consistently", "be authentic").
Use the following strict algorithmic rules to score their performance and give 1-2 pointed pieces of advice.

## 1. The Algorithm's Value Hierarchy
Threads ranks content using a specific point system to measure Meaningful Social Interaction (MSI).
Value Score Approximation:
- Replies = 10 points
- Reposts / Quotes = 8 points
- Profile Taps = 5 points
- Likes = 3 points

### Application:
- If a user has high likes but low replies, tell them they are stuck in the "Hub-and-Spoke" pattern (broadcasting). Advise them to use the "Chain" pattern (inviting dialogue, ending posts with open-ended constraints, or replying to their own comment section).
- If a user has low reposts, their content is not "carrying identity." Advise them to create frameworks, lists, or strong opinions that others want to share.

## 2. Topic Consistency & Identity Assignment
Threads does not rank individual posts in a vacuum. It builds an "Algorithmic Identity" based on accumulated patterns.
- If a creator talks about 10 different topics, they confuse the semantic engine and their reach plateaus.
- If they ruthlessly hammer 1-2 topics, they become a "classified node" and reach becomes targeted and predictable.

### Application:
- Check their recent posts. Are the topics scattered or hyper-focused? If scattered, advise them to pass the "Identity Clarity Test" (could a stranger reading their last 5 posts immediately know what they do?).

## 3. The Safety & Suppression Layer
Meta aggressively downranks spam-like patterns. Ensure their posts do not contain:
- Engagement Bait: "Like this if you agree", "Follow for more", "Tag someone".
- Hashtag Stuffing: Using more than 2 hashtags.
- Rage Bait: Content designed solely to provoke anger.

### Application:
- Flag any suppression risks in their recent posts.
`;


export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { posts } = body;

        if (!posts || !Array.isArray(posts)) {
            return NextResponse.json({ error: "Invalid posts data" }, { status: 400 });
        }

        // We only want to analyze a recent, meaningful sample to save tokens and focus on momentum
        const recentPosts = posts.slice(0, 15);

        if (recentPosts.length === 0) {
            return NextResponse.json({
                diagnosis: "Not enough data",
                weakestMetric: "N/A",
                fix: "Publish at least one post and wait for engagement data to sync."
            });
        }

        const groq = getGroqClient();
        const systemPrompt = GROWTH_STRATEGY_PROMPT;


        const promptText = `
Analyze the following recent posts and their analytics data for this user.
Apply the strict rules defined in your system prompt to calculate their algorithmic standing.

Output JSON only in this exact format:
{
  "diagnosis": "Short 1-2 sentence diagnosis of their current standing (e.g. You are building momentum but stuck in a Hub-and-Spoke pattern).",
  "weakestMetric": "Identify the main metric hurting them (e.g. Low Reply Weight Ratio).",
  "fix": "Specific, executable advice for their NEXT post (e.g. Try ending your next post with a controversial question to spark debate instead of just stating facts)."
}

USER POST DATA:
${JSON.stringify(recentPosts.map(p => ({
            content: p.content,
            likes: p.likes,
            replies: p.comments,
            reposts: p.shares,
            views: p.impressions
        })), null, 2)}
`;

        const result = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: promptText }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2, // Low temp for more clinical, rule-following advice
            response_format: { type: "json_object" }
        });

        const responseText = result.choices[0]?.message?.content?.trim() || "{}";
        
        let parsedData;
        try {
            parsedData = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse Groq response:", responseText);
            return NextResponse.json({ error: "Invalid JSON response from AI" }, { status: 500 });
        }

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error("Strategy generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate strategy" },
            { status: 500 }
        );
    }
}

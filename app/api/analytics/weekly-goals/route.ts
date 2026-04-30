import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60; // Prevent Vercel 504 timeouts

import Groq from "groq-sdk";

function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is required");
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
- If a user has high likes but low replies, tell them they are stuck in the "Hub-and-Spoke" pattern (broadcasting).
- If a user has low reposts, their content is not "carrying identity." Advise creating frameworks, lists, or strong opinions.

## 2. Topic Consistency & Identity Assignment
- If a creator talks about many different topics, they confuse the semantic engine.
- Hyper-focusing on 1-2 topics makes them a "classified node" with predictable reach.

## 3. The Safety & Suppression Layer
- Avoid engagement bait, hashtag stuffing (more than 2), and rage bait.
`;


function getWeekBounds(weeksAgo: number = 0) {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const start = new Date(now);
    start.setDate(now.getDate() + mondayOffset - weeksAgo * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

function computeWeekStats(posts: any[]) {
    const totalLikes = posts.reduce((s, p) => s + (p.likes ?? 0), 0);
    const totalReplies = posts.reduce((s, p) => s + (p.comments ?? 0), 0);
    const totalReposts = posts.reduce((s, p) => s + (p.shares ?? 0), 0);
    const totalImpressions = posts.reduce((s, p) => s + (p.impressions ?? 0), 0);
    const totalEngagements = totalLikes + totalReplies + totalReposts;

    return {
        postCount: posts.length,
        replyRatio: totalEngagements > 0 ? Math.round((totalReplies / totalEngagements) * 100) : 0,
        repostRatio: totalEngagements > 0 ? Math.round((totalReposts / totalEngagements) * 100) : 0,
        engagementRate: totalImpressions > 0 ? parseFloat(((totalEngagements / totalImpressions) * 100).toFixed(1)) : 0,
        totalLikes,
        totalReplies,
        totalReposts,
        totalImpressions,
    };
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { posts } = body;

        if (!posts || !Array.isArray(posts)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Split posts into current week and previous week
        const thisWeek = getWeekBounds(0);
        const lastWeek = getWeekBounds(1);

        const thisWeekPosts = posts.filter((p: any) => {
            if (!p.published_at) return false;
            const d = new Date(p.published_at);
            return d >= thisWeek.start && d <= thisWeek.end;
        });

        const lastWeekPosts = posts.filter((p: any) => {
            if (!p.published_at) return false;
            const d = new Date(p.published_at);
            return d >= lastWeek.start && d <= lastWeek.end;
        });

        const current = computeWeekStats(thisWeekPosts);
        const previous = computeWeekStats(lastWeekPosts);

        // Format week label
        const weekLabel = `${thisWeek.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${thisWeek.end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

        // Use AI to generate contextual goals
        const groq = getGroqClient();
        const systemPrompt = GROWTH_STRATEGY_PROMPT;


        const prompt = `
Based on the user's performance data, generate realistic weekly improvement targets.

CURRENT WEEK (${weekLabel}):
- Posts published: ${current.postCount}
- Reply Weight Ratio: ${current.replyRatio}%
- Repost Ratio: ${current.repostRatio}%
- Engagement Rate: ${current.engagementRate}%

PREVIOUS WEEK:
- Posts published: ${previous.postCount}
- Reply Weight Ratio: ${previous.replyRatio}%
- Repost Ratio: ${previous.repostRatio}%
- Engagement Rate: ${previous.engagementRate}%

Rules for setting targets:
- If current value is 0, set a small achievable target (e.g., 3 posts, 5% ratio)
- If they improved from last week, set target 10-15% above current
- If they regressed, set target to match last week's level
- Post count target should be at least 5 per week for consistency
- Keep weeklyFocus under 15 words

Return JSON only:
{
  "goals": [
    { "label": "Posts this week", "current": <number>, "target": <number>, "unit": "posts" },
    { "label": "Reply Weight", "current": <number>, "target": <number>, "unit": "%" },
    { "label": "Repost Rate", "current": <number>, "target": <number>, "unit": "%" },
    { "label": "Engagement Rate", "current": <number>, "target": <number>, "unit": "%" }
  ],
  "weeklyFocus": "<one direct sentence>"
}
`;

        const result = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt + `\n\nYou are now generating WEEKLY GOALS. Be concise. Follow the Aeden tone: direct, no fluff, no corporate speak. Do not use words like "leverage", "synergy", or "game-changing".` },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            response_format: { type: "json_object" }
        });

        const responseText = result.choices[0]?.message?.content?.trim() || "{}";
        let parsed;
        try {
            parsed = JSON.parse(responseText);
        } catch (parseError) {
            console.error("Failed to parse AI response:", responseText);
            return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
        }
        return NextResponse.json({
            weekLabel,
            ...parsed,
        });

    } catch (error) {
        console.error("Weekly goals error:", error);
        return NextResponse.json({ error: "Failed to generate goals" }, { status: 500 });
    }
}

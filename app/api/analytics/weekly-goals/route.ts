import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

function getGeminiClient() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required");
    return new GoogleGenerativeAI(apiKey);
}

function getSystemPrompt() {
    try {
        const filePath = path.join(process.cwd(), "ai_growth_strategy.md");
        return fs.readFileSync(filePath, "utf-8");
    } catch {
        return "You are an expert social media growth strategist.";
    }
}

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
        const genAI = getGeminiClient();
        const systemPrompt = getSystemPrompt();

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemPrompt + `\n\nYou are now generating WEEKLY GOALS. Be concise. Follow the Aeden tone: direct, no fluff, no corporate speak. Do not use words like "leverage", "synergy", or "game-changing".`,
        });

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

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
            },
        });

        const parsed = JSON.parse(result.response.text());

        return NextResponse.json({
            weekLabel,
            ...parsed,
        });

    } catch (error) {
        console.error("Weekly goals error:", error);
        return NextResponse.json({ error: "Failed to generate goals" }, { status: 500 });
    }
}

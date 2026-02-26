import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Initialize Gemini
function getGeminiClient() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is required");
    }
    return new GoogleGenerativeAI(apiKey);
}

// Load the AI Growth Strategy System Prompt
function getSystemPrompt() {
    try {
        const filePath = path.join(process.cwd(), "ai_growth_strategy.md");
        return fs.readFileSync(filePath, "utf-8");
    } catch (e) {
        console.error("Failed to load ai_growth_strategy.md:", e);
        return "You are an expert social media growth strategist.";
    }
}

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

        const genAI = getGeminiClient();
        const systemPrompt = getSystemPrompt();

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemPrompt,
        });

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

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: promptText }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2, // Low temp for more clinical, rule-following advice
            }
        });

        const responseText = result.response.text();
        const parsedData = JSON.parse(responseText);

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error("Strategy generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate strategy" },
            { status: 500 }
        );
    }
}

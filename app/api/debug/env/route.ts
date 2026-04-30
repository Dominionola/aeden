import { NextResponse } from "next/server";

/**
 * GET /api/debug/env
 * Checks which AI environment variables are present on this deployment.
 * REMOVE THIS ROUTE before going fully public.
 */
export async function GET() {
    const checks = {
        GROQ_API_KEY: !!process.env.GROQ_API_KEY,
        GROQ_API_KEY_prefix: process.env.GROQ_API_KEY?.substring(0, 6) ?? "missing",
        GOOGLE_GENERATIVE_AI_API_KEY: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        GOOGLE_API_KEY_prefix: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 6) ?? "missing",
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "not set",
        NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json(checks);
}

// API request and response types

import type { AiModel } from "@/lib/ai/client";

// Generate Post API
export interface GeneratePostRequest {
    input: string;
    model?: AiModel;
}

export interface GeneratePostResponse {
    content: string;
    model: string;
}

// Posts API
export interface CreatePostRequest {
    content: string;
    platform?: "threads" | "twitter" | "linkedin";
    image_url?: string;
    source_type?: string;
    source_data?: Record<string, unknown>;
    scheduled_at?: string;
}

export interface UpdatePostRequest {
    content?: string;
    image_url?: string;
    status?: "draft" | "scheduled";
    scheduled_at?: string;
}

export interface PublishPostRequest {
    post_id: string;
}

export interface PublishPostResponse {
    success: boolean;
    platform_post_id?: string;
    platform_post_url?: string;
    error?: string;
}

// User Preferences API
export interface UpdatePreferencesRequest {
    user_type?: string;
    tone?: string;
    brand_guidelines?: string;
    preferred_ai_model?: AiModel;
    auto_generate_on_sync?: boolean;
    default_posting_time?: string;
}

export interface AddBookmarkRequest {
    url: string;
    platform: string;
}

export interface AnalyzeVoiceRequest {
    past_posts: string[];
}

export interface AnalyzeVoiceResponse {
    success: boolean;
    analysis: {
        tone: string;
        characteristics: string[];
        common_patterns: Record<string, string>;
        voice_summary: string;
    };
}

// Generic API Response
export interface ApiError {
    error: string;
    code?: string;
    details?: Record<string, unknown>;
}

export interface ApiSuccess<T = unknown> {
    success: true;
    data: T;
}

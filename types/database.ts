// Database types generated from Supabase schema

export interface WorkSource {
    id: string;
    user_id: string;
    source_type:
    | "manual"
    | "github"
    | "notion"
    | "figma"
    | "linear"
    | "jira"
    | "youtube"
    | "substack"
    | "stripe"
    | "webflow"
    | "airtable";
    access_token: string | null;
    refresh_token: string | null;
    token_expires_at: string | null;
    account_username: string | null;
    account_id: string | null;
    is_active: boolean;
    last_synced_at: string | null;
    sync_cursor: string | null;
    created_at: string;
    updated_at: string;
}

export interface SocialAccount {
    id: string;
    user_id: string;
    platform: "threads" | "twitter" | "linkedin";
    access_token: string;
    token_expires_at: string | null;
    account_id: string;
    account_handle: string | null;
    profile_picture_url: string | null;
    biography: string | null;
    followers_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Post {
    id: string;
    user_id: string;
    content: string;
    platform: "threads" | "twitter" | "linkedin";
    status: "draft" | "scheduled" | "publishing" | "published" | "failed";
    image_url: string | null;
    source_type:
    | "manual"
    | "github"
    | "notion"
    | "figma"
    | "linear"
    | "jira"
    | "youtube"
    | "substack"
    | "stripe"
    | "webflow"
    | "airtable";
    source_data: Record<string, unknown> | null;
    ai_model_version: string;
    platform_post_id: string | null;
    platform_post_url: string | null;
    scheduled_at: string | null;
    published_at: string | null;
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    last_analytics_sync: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserPreferences {
    id: string;
    user_id: string;
    user_type:
    | "developer"
    | "designer"
    | "product_manager"
    | "no_code_builder"
    | "content_creator"
    | "founder"
    | "other";
    tone: "casual" | "professional" | "technical" | "humorous" | "inspirational";
    creator_bookmarks: CreatorBookmark[];
    brand_guidelines: string | null;
    voice_analysis: VoiceAnalysis | null;
    default_posting_time: string | null;
    preferred_ai_model: "gemini" | "claude";
    auto_generate_on_sync: boolean;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreatorBookmark {
    url: string;
    platform: string;
    username: string;
    added_at?: string;
}

export interface VoiceAnalysis {
    tone: string;
    characteristics: string[];
    common_patterns: {
        sentence_length: "short" | "medium" | "long";
        emoji_usage: "none" | "occasional" | "frequent";
        line_breaks: "none" | "some" | "many";
        hashtag_usage: "none" | "minimal" | "moderate" | "heavy";
    };
    voice_summary: string;
}

// Supabase Database type for type-safe queries
export interface Database {
    public: {
        Tables: {
            work_sources: {
                Row: WorkSource;
                Insert: Omit<WorkSource, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<WorkSource, "id" | "created_at" | "updated_at">>;
            };
            social_accounts: {
                Row: SocialAccount;
                Insert: Omit<SocialAccount, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<SocialAccount, "id" | "created_at" | "updated_at">>;
            };
            posts: {
                Row: Post;
                Insert: Omit<Post, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<Post, "id" | "created_at" | "updated_at">>;
            };
            user_preferences: {
                Row: UserPreferences;
                Insert: Omit<UserPreferences, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<UserPreferences, "id" | "created_at" | "updated_at">>;
            };
        };
    };
}

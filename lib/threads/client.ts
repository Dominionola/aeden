/**
 * Meta Threads Graph API Client
 * Official Documentation: https://developers.facebook.com/docs/threads/
 */

const THREADS_API_VERSION = "v1.0";
const THREADS_API_BASE_URL = `https://graph.threads.net/${THREADS_API_VERSION}`;

export class ThreadsApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly data: any
    ) {
        super(message);
        this.name = "ThreadsApiError";
    }
}

/**
 * Creates a media container for a Threads post
 * Step 1 of the Threads publishing process.
 */
export async function createMediaContainer(
    accountId: string,
    accessToken: string,
    text: string,
    imageUrl?: string | null
): Promise<string> {
    const url = new URL(`${THREADS_API_BASE_URL}/${accountId}/threads`);
    
    // Auth
    url.searchParams.append("access_token", accessToken);
    
    // Media Type and Content
    if (imageUrl) {
        url.searchParams.append("media_type", "IMAGE");
        url.searchParams.append("image_url", imageUrl);
        if (text) {
            url.searchParams.append("text", text);
        }
    } else {
        url.searchParams.append("media_type", "TEXT");
        url.searchParams.append("text", text);
    }

    const response = await fetch(url.toString(), {
        method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Threads API Create Container Error:", data);
        throw new ThreadsApiError(
            data.error?.message || "Failed to create Threads media container",
            response.status,
            data
        );
    }

    return data.id; // Returns the creation_id
}

/**
 * Publishes a previously created media container
 * Step 2 of the Threads publishing process.
 */
export async function publishMediaContainer(
    accountId: string,
    accessToken: string,
    creationId: string
): Promise<string> {
    const url = new URL(`${THREADS_API_BASE_URL}/${accountId}/threads_publish`);
    
    // Auth and Target
    url.searchParams.append("access_token", accessToken);
    url.searchParams.append("creation_id", creationId);

    const response = await fetch(url.toString(), {
        method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Threads API Publish Error:", data);
        throw new ThreadsApiError(
            data.error?.message || "Failed to publish Threads media container",
            response.status,
            data
        );
    }

    return data.id; // Returns the platform_post_id
}

/**
 * Helper function to completely publish a post to Threads
 * (Creates container -> Publishes container)
 */
export async function publishPost(
    accountId: string,
    accessToken: string,
    text: string,
    imageUrl?: string | null
): Promise<string> {
    try {
        const creationId = await createMediaContainer(accountId, accessToken, text, imageUrl);
        
        // Wait briefly for Media Container to be processed by Meta
        // Sometimes publishing immediately after creation fails on their end.
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const publishedPostId = await publishMediaContainer(accountId, accessToken, creationId);
        
        return publishedPostId;
    } catch (error) {
        console.error("Complete publish sequence failed:", error);
        throw error;
    }
}

/**
 * Threads Client Object
 * Provides OAuth and user profile methods.
 */
export const threadsClient = {
    getAuthUrl(state?: string): string {
        const appId = process.env.THREADS_APP_ID;
        const redirectUri = process.env.NEXT_PUBLIC_THREADS_REDIRECT_URI;
        
        if (!appId || !redirectUri) {
            console.error("Missing THREADS_APP_ID or NEXT_PUBLIC_THREADS_REDIRECT_URI");
            return "#";
        }

        const url = new URL("https://threads.net/oauth/authorize");
        url.searchParams.append("client_id", appId);
        url.searchParams.set("redirect_uri", redirectUri);
        url.searchParams.append("scope", "threads_basic,threads_content_publish");
        url.searchParams.append("response_type", "code");
        if (state) url.searchParams.append("state", state);

        return url.toString();
    },

    async exchangeCodeForToken(code: string): Promise<{ access_token: string; user_id: string }> {
        const appId = process.env.THREADS_APP_ID;
        const appSecret = process.env.THREADS_APP_SECRET;
        const redirectUri = process.env.NEXT_PUBLIC_THREADS_REDIRECT_URI;

        if (!appId || !appSecret || !redirectUri) {
            throw new Error("Missing Threads OAuth credentials");
        }

        const formData = new URLSearchParams();
        formData.append("client_id", appId);
        formData.append("client_secret", appSecret);
        formData.append("grant_type", "authorization_code");
        formData.append("redirect_uri", redirectUri);
        formData.append("code", code);

        const response = await fetch("https://graph.threads.net/oauth/access_token", {
            method: "POST",
            body: formData,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new ThreadsApiError(data.error?.message || "Token exchange failed", response.status, data);
        }

        return data; // { access_token, user_id }
    },

    async exchangeForLongLivedToken(shortLivedToken: string): Promise<{ access_token: string; expires_in: number }> {
        const appSecret = process.env.THREADS_APP_SECRET;
        if (!appSecret) throw new Error("Missing THREADS_APP_SECRET");

        const url = new URL("https://graph.threads.net/access_token");
        url.searchParams.append("grant_type", "th_exchange_token");
        url.searchParams.append("client_secret", appSecret);
        url.searchParams.append("access_token", shortLivedToken);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (!response.ok) {
            throw new ThreadsApiError(data.error?.message || "Long-lived token exchange failed", response.status, data);
        }

        return data;
    },

    async getUser(userId: string, accessToken: string): Promise<any> {
        const url = new URL(`${THREADS_API_BASE_URL}/${userId}`);
        url.searchParams.append("fields", "id,username,threads_profile_picture_url,threads_biography");
        url.searchParams.append("access_token", accessToken);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (!response.ok) {
            throw new ThreadsApiError(data.error?.message || "Failed to fetch user profile", response.status, data);
        }

        return data;
    }
};

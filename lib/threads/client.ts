import { ThreadsUser, ThreadsTokenResponse, ThreadsMediaContainerResponse, ThreadsPublishResponse, ThreadsError } from "./types";

const THREADS_API_BASE = "https://graph.threads.net/v1.0";

export class ThreadsClient {
    private appId: string;
    private appSecret: string;
    private redirectUri: string;

    constructor() {
        const appId = process.env.THREADS_APP_ID;
        const appSecret = process.env.THREADS_APP_SECRET;
        const redirectUri = process.env.NEXT_PUBLIC_THREADS_REDIRECT_URI;

        if (!appId || !appSecret || !redirectUri) {
            throw new Error("Threads environment variables are missing. Check .env");
        }

        this.appId = appId;
        this.appSecret = appSecret;
        this.redirectUri = redirectUri;
    }
    /**
     * Generate the OAuth Authorization URL
     */
    getAuthUrl(state?: string): string {
        const scopes = [
            "threads_basic",
            "threads_content_publish"
        ].join(",");

        const url = new URL("https://threads.net/oauth/authorize");
        url.searchParams.append("client_id", this.appId);
        url.searchParams.append("redirect_uri", this.redirectUri);
        url.searchParams.append("scope", scopes);
        url.searchParams.append("response_type", "code");
        if (state) {
            url.searchParams.append("state", state);
        }

        return url.toString();
    }

    /**
     * Exchange short-lived code for access token
     */
    async exchangeCodeForToken(code: string): Promise<ThreadsTokenResponse> {
        const url = "https://graph.threads.net/oauth/access_token";
        const formData = new FormData();
        formData.append("client_id", this.appId);
        formData.append("client_secret", this.appSecret);
        formData.append("grant_type", "authorization_code");
        formData.append("redirect_uri", this.redirectUri);
        formData.append("code", code);

        const response = await fetch(url, {
            method: "POST",
            if(!response.ok) {
                let errorMessage: string;
        try {
            const error = await response.json();
            errorMessage = JSON.stringify(error);
        } catch {
            errorMessage = response.statusText;
        }
        throw new Error(`Failed to exchange code: ${errorMessage}`);
    } const error = await response.json();
            throw new Error(`Failed to exchange code: ${JSON.stringify(error)}`);
        }

const data = await response.json();

// Threads API currently returns a short-lived token here if I recall correctly, 
// or a long-lived one directly? Docs say "Exchange the code for a short-lived user access token".
// We might need to swap for long-lived later, but for MVP let's assume valid.
// Actually, for Threads specifically, the doc says "Exchange the code for a user access token".
// Let's adhere to the standard flow.

return data as ThreadsTokenResponse;
    }

    /**
     * Get User Profile
     */
    async getUser(userId: string, accessToken: string): Promise < ThreadsUser > {
    const url = `${THREADS_API_BASE}/${userId}?fields=id,username,threads_profile_picture_url,threads_biography&access_token=${accessToken}`;

    const response = await fetch(url);

    if(!response.ok) {
    throw new Error("Failed to fetch user profile");
}

return await response.json();
    }

    /**
     * Publish a Text Post (Step 1 + Step 2)
     */
    async publishPost(userId: string, accessToken: string, text: string, imageUrl ?: string): Promise < string > {
    // Step 1: Create Media Container
    const containerId = await this.createMediaContainer(userId, accessToken, text, imageUrl);

    // Step 2: Publish Media Container
    const publishId = await this.publishMediaContainer(userId, accessToken, containerId);

    return publishId;
}

    /**
     * Step 1: Create a Media Container (Ready for publishing)
     */
    private async createMediaContainer(userId: string, accessToken: string, text: string, imageUrl ?: string): Promise < string > {
    const url = `${THREADS_API_BASE}/${userId}/threads`;
    const params = new URLSearchParams();

    params.append("media_type", imageUrl ? "IMAGE" : "TEXT");
    params.append("text", text);
    params.append("access_token", accessToken);

    if(imageUrl) {
        params.append("image_url", imageUrl);
    }

        const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
    });

    if(!response.ok) {
    const error = await response.json() as ThreadsError;
    throw new Error(`Failed to create media container: ${error.error.message}`);
}

const data = await response.json() as ThreadsMediaContainerResponse;
return data.id;
    }

    /**
     * Step 2: Publish the Container
     */
    private async publishMediaContainer(userId: string, accessToken: string, creationId: string): Promise < string > {
    const url = `${THREADS_API_BASE}/${userId}/threads_publish`;
    const params = new URLSearchParams();

    params.append("creation_id", creationId);
    params.append("access_token", accessToken);

    const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
    });

    if(!response.ok) {
    const error = await response.json() as ThreadsError;
    throw new Error(`Failed to publish container: ${error.error.message}`);
}

const data = await response.json() as ThreadsPublishResponse;
return data.id;
    }
}

export const threadsClient = new ThreadsClient();

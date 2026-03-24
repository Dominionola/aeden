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

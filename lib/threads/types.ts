export interface ThreadsUser {
    id: string;
    username: string;
    threads_profile_picture_url?: string;
    threads_biography?: string;
}

export interface ThreadsMediaContainerResponse {
    id: string;
}

export interface ThreadsPublishResponse {
    id: string;
}

export interface ThreadsTokenResponse {
    access_token: string;
    user_id: string;
}

export interface ThreadsError {
    error: {
        message: string;
        type: string;
        code: number;
        fbtrace_id: string;
    };
}

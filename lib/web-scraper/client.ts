export interface ArticleContent {
    title: string;
    content: string;
    author: string | null;
    publishedAt: string | null;
    sourceUrl: string;
}

export interface ScrapeResult {
    success: boolean;
    article?: ArticleContent;
    error?: string;
}

function extractTextContent(html: string): string {
    const doc = new DOMParser().parseFromString(html, "text/html");
    
    const removeSelectors = [
        "script", "style", "nav", "header", "footer", "aside",
        ".sidebar", ".menu", ".navigation", ".comments", ".social",
        ".advertisement", ".ad", ".share", ".related"
    ];

    for (const selector of removeSelectors) {
        doc.querySelectorAll(selector).forEach(el => el.remove());
    }

    const articleSelectors = [
        "article",
        "[role='main']",
        "main",
        ".post-content",
        ".article-content",
        ".entry-content",
        ".content",
        "#content"
    ];

    for (const selector of articleSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
            return element.textContent?.trim() || "";
        }
    }

    return doc.body?.textContent?.trim() || "";
}

function extractMetaContent(doc: Document, property: string): string | null {
    const meta = doc.querySelector(`meta[property="${property}"]`) ||
                 doc.querySelector(`meta[name="${property}"]`);
    return meta?.getAttribute("content") || null;
}

function extractTitle(doc: Document): string {
    return extractMetaContent(doc, "og:title") ||
           doc.querySelector("h1")?.textContent?.trim() ||
           doc.title.split("|")[0].split("-")[0].trim() ||
           "Untitled";
}

function extractAuthor(doc: Document): string | null {
    return extractMetaContent(doc, "article:author") ||
           doc.querySelector('meta[name="author"]')?.getAttribute("content") ||
           doc.querySelector(".author")?.textContent?.trim() ||
           doc.querySelector(".byline")?.textContent?.trim() ||
           null;
}

function extractPublishedDate(doc: Document): string | null {
    return extractMetaContent(doc, "article:published_time") ||
           doc.querySelector('meta[name="date"]')?.getAttribute("content") ||
           doc.querySelector(".published")?.textContent?.trim() ||
           null;
}

export async function fetchArticle(url: string): Promise<ScrapeResult> {
    try {
        const urlObj = new URL(url);
        
        if (!["http:", "https:"].includes(urlObj.protocol)) {
            return { success: false, error: "Invalid URL protocol" };
        }

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Aeden/1.0 (Content Refactoring Tool; +https://aeden.app)",
                "Accept": "text/html,application/xhtml+xml",
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            return { 
                success: false, 
                error: `Failed to fetch: ${response.status} ${response.statusText}` 
            };
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text/html")) {
            return { success: false, error: "URL does not return HTML content" };
        }

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        
        const title = extractTitle(doc);
        const author = extractAuthor(doc);
        const publishedAt = extractPublishedDate(doc);
        const content = extractTextContent(html);

        if (content.length < 200) {
            return { success: false, error: "Content too short to extract meaningful intelligence" };
        }

        return {
            success: true,
            article: {
                title,
                content,
                author,
                publishedAt,
                sourceUrl: url,
            },
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        return { success: false, error: message };
    }
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
    try {
        const urlObj = new URL(url);
        
        if (!["http:", "https:"].includes(urlObj.protocol)) {
            return { valid: false, error: "URL must use HTTP or HTTPS protocol" };
        }

        if (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1") {
            return { valid: false, error: "Cannot fetch from localhost" };
        }

        return { valid: true };
    } catch {
        return { valid: false, error: "Invalid URL format" };
    }
}

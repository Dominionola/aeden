/** @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { fetchArticle } from "@/lib/web-scraper/client";
import { refactorContent, buildKnowledgeContext } from "@/lib/ai/knowledge-architect";

// This test uses live APIs (Gemini) if API keys are present, 
// or it can be mocked. For this verification, we want to see it work.

describe("Knowledge Vault Ingestion", () => {
    it("should have network access", async () => {
        const res = await fetch("https://www.google.com");
        expect(res.ok).toBe(true);
    });

    it("should fetch and refactor an article", async () => {
        const url = "https://en.wikipedia.org/wiki/Web_scraping";
        const scrapeRes = await fetchArticle(url);
        
        expect(scrapeRes.success ? "success" : scrapeRes.error).toBe("success");
        expect(scrapeRes.article?.title).toBeDefined();
        
        const intelligence = await refactorContent(
            scrapeRes.article!.content, 
            scrapeRes.article!.title
        );
        
        expect(intelligence.metadata.source_title).toBeDefined();
        expect(intelligence.intelligence_blocks.length).toBeGreaterThan(0);
        
        const context = buildKnowledgeContext([intelligence]);
        expect(context).toContain(intelligence.metadata.source_title);
    }, 30000); // 30s timeout for AI
});

import { fetchArticle } from "../lib/web-scraper/client.js";
import { refactorContent } from "../lib/ai/knowledge-architect.js";
import dotenv from "dotenv";

dotenv.config();

async function test() {
    const url = "https://example.com"; // I'll use a better one in the run
    console.log(`\n🔍 Fetching: ${url}`);

    const scrapeRes = await fetchArticle(url);
    if (!scrapeRes.success) {
        console.error("❌ Scrape failed:", scrapeRes.error);
        process.exit(1);
    }

    console.log("✅ Scrape success! Title:", scrapeRes.article.title);
    console.log("🧠 Refactoring with AI...");

    const intelligence = await refactorContent(scrapeRes.article.content, scrapeRes.article.title);
    console.log("\n✨ Intelligence Module extracted:");
    console.log(JSON.stringify(intelligence, null, 2));
}

test().catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
});

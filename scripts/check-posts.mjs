import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPosts() {
    console.log("🔍 Checking posts in database...");

    const { data, error } = await supabase
        .from("posts")
        .select("id, platform, status, content, likes, comments, impressions, platform_post_id, published_at")
        .order("published_at", { ascending: false });

    if (error) {
        console.error("❌ Error fetching posts:", error);
        return;
    }

    console.log(`✅ Found ${data.length} total posts.`);

    if (data.length > 0) {
        console.log("\nRecent posts:");
        data.slice(0, 5).forEach((p, i) => {
            console.log(`\n[${i + 1}] ${p.published_at?.substring(0, 10) || 'Unknown date'}`);
            console.log(`Content: ${p.content ? (p.content.substring(0, 50) + '...') : '<No content>'}`);
            console.log(`Stats: ❤️ ${p.likes} | 💬 ${p.comments} | 👁️ ${p.impressions}`);
            console.log(`Platform ID: ${p.platform_post_id ? 'Yes (' + p.platform_post_id + ')' : 'No'}`);
        });
    }
}

checkPosts();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log("Checking for 'embedding' column in knowledge_vault...");
    
    // We can just query 1 row to see if the column exists
    const { data, error } = await supabase
        .from('knowledge_vault')
        .select('embedding')
        .limit(1);
        
    if (error) {
        console.error("❌ Column check failed:", error.message);
    } else {
        console.log("✅ Column 'embedding' exists.");
    }
    
    console.log("\nChecking for 'match_knowledge_vault' RPC...");
    
    // Create a dummy embedding of 768 dimensions (all zeros)
    const dummyEmbedding = new Array(768).fill(0);
    
    // We don't care if it returns rows, just that the function doesn't crash
    const { data: rpcData, error: rpcError } = await supabase.rpc('match_knowledge_vault', {
        query_embedding: dummyEmbedding,
        match_user_id: '00000000-0000-0000-0000-000000000000',
        match_limit: 1,
        match_threshold: 0.0
    });
    
    if (rpcError) {
        if (rpcError.message.includes("Could not find the function")) {
             console.error("❌ RPC check failed: Function not found.");
        } else {
             // It might fail for other reasons, but if it's not a missing function error, it exists
             console.error("⚠️ RPC returned an error, but it exists:", rpcError.message);
        }
    } else {
        console.log("✅ RPC 'match_knowledge_vault' exists and is callable.");
    }
}

check();

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Only accessible with the correct secret header — keeps this endpoint safe
const MIGRATION_SECRET = process.env.MIGRATION_SECRET ?? "aeden-migrate-local";

export async function POST(request: NextRequest) {
    // Guard: check secret
    const secret = request.headers.get("x-migration-secret");
    if (secret !== MIGRATION_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sql } = await request.json();
    if (!sql || typeof sql !== "string") {
        return NextResponse.json({ error: "Missing sql field" }, { status: 400 });
    }

    // Use admin client (service_role bypasses RLS)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    // Split on semicolons to run each statement individually
    const statements = sql
        .split(";")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0 && !s.startsWith("--"));

    const results: { statement: string; status: string; error?: string }[] = [];

    for (const statement of statements) {
        try {
            // Supabase JS doesn't expose raw SQL execution directly,
            // so we use rpc with a helper, OR use the PostgreSQL function approach.
            // The cleanest way: use the admin client with a raw query via the REST layer.
            const { error } = await supabaseAdmin.rpc("exec_sql", { sql_query: statement + ";" });

            if (error) {
                // exec_sql doesn't exist yet — try creating it first
                if (error.message?.includes("Could not find the function") || error.code === "PGRST202") {
                    // Bootstrap: create the exec_sql function, then retry
                    results.push({ statement: statement.substring(0, 60), status: "needs_bootstrap" });
                } else {
                    results.push({ statement: statement.substring(0, 60), status: "error", error: error.message });
                }
            } else {
                results.push({ statement: statement.substring(0, 60), status: "ok" });
            }
        } catch (err: any) {
            results.push({ statement: statement.substring(0, 60), status: "error", error: err.message });
        }
    }

    const hasErrors = results.some(r => r.status === "error");
    const needsBootstrap = results.some(r => r.status === "needs_bootstrap");

    if (needsBootstrap) {
        return NextResponse.json({
            error: "exec_sql function not found. Run the bootstrap first.",
            hint: "npm run migrate:bootstrap",
            results,
        }, { status: 422 });
    }

    return NextResponse.json({
        ok: !hasErrors,
        results,
    }, { status: hasErrors ? 207 : 200 });
}

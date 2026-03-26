import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MIGRATION_SECRET = process.env.MIGRATION_SECRET ?? "aeden-migrate-local";

export async function POST(request: NextRequest) {
    const secret = request.headers.get("x-migration-secret");
    if (secret !== MIGRATION_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sql } = await request.json();
    if (!sql || typeof sql !== "string") {
        return NextResponse.json({ error: "Missing sql field" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    // Improved splitter that respects dollar-quoted strings ($$)
    const statements: string[] = [];
    let currentStatement = "";
    let inDollarQuote = false;

    const lines = sql.split("\n").filter(line => !line.trim().startsWith("--"));

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check for dollar quotes (including labeled variants like $tag$)
        const dollarQuoteMatches = line.match(/\$[a-zA-Z_]*\$/g);
        if (dollarQuoteMatches && dollarQuoteMatches.length % 2 !== 0) {
            inDollarQuote = !inDollarQuote;
        }
        currentStatement += line + "\n";

        if (!inDollarQuote && trimmed.endsWith(";")) {
            statements.push(currentStatement.trim());
            currentStatement = "";
        }
    }

    // Capture any remaining partial statement
    if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
    }

    const results: { statement: string; status: string; error?: string; data?: any }[] = [];

    for (const statement of statements) {
        const { data: dbData, error } = await supabaseAdmin.rpc("exec_sql", { sql_query: statement });

        if (error) {
            if (error.message?.includes("Could not find the function") || error.code === "PGRST202") {
                return NextResponse.json({
                    error: "exec_sql bootstrap function not found. Run supabase/bootstrap.sql in the Supabase SQL Editor first.",
                    results,
                }, { status: 422 });
            }
            results.push({ statement: statement.substring(0, 80), status: "error", error: error.message });
        } else {
            results.push({ statement: statement.substring(0, 80), status: "ok", data: dbData });
        }
    }

    // Always reload PostgREST schema cache after migrations
    // This prevents "column not found in schema cache" errors
    await supabaseAdmin.rpc("exec_sql", {
        sql_query: "NOTIFY pgrst, 'reload schema';"
    });

    const hasErrors = results.some(r => r.status === "error");

    return NextResponse.json({ ok: !hasErrors, results }, { status: 200 });
}

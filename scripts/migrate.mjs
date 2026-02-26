/**
 * ONE-TIME: Run database migrations via the running Next.js dev server.
 * Calls the local /api/admin/migrate endpoint which uses the Supabase service role.
 *
 * Usage:
 *   node scripts/migrate.mjs                          <- all migrations
 *   node scripts/migrate.mjs 003_add_profile_fields.sql  <- specific file
 */

import { readFileSync, readdirSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadEnv() {
    const content = readFileSync(join(ROOT, ".env"), "utf8");
    const env = {};
    for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    }
    return env;
}

async function main() {
    const env = loadEnv();
    const migrationsDir = join(ROOT, "supabase", "migrations");
    const targetFile = process.argv[2];
    const secret = env.MIGRATION_SECRET || "aeden-migrate-local";

    let files;
    if (targetFile) {
        files = [targetFile];
    } else {
        files = readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
    }

    console.log(`\n🚀 Running ${files.length} migration(s) via local dev server\n`);

    for (const file of files) {
        const filePath = join(migrationsDir, file);
        let sql;
        try { sql = readFileSync(filePath, "utf8"); }
        catch { console.error(`❌ File not found: ${file}`); process.exit(1); }

        process.stdout.write(`  → ${file} ... `);
        try {
            const res = await fetch("http://localhost:3000/api/admin/migrate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-migration-secret": secret,
                },
                body: JSON.stringify({ sql }),
            });

            const data = await res.json();
            if (!res.ok || !data.ok) {
                const errContext = data.results?.filter(r => r.status === "error") || [];
                throw new Error(data.error || JSON.stringify(errContext, null, 2));
            }
            console.log("✅ done");
        } catch (err) {
            console.log("❌ failed");
            console.error(`     Error: ${err.message}`);
        }
    }

    console.log("\n✨ Done.\n");
}

main();

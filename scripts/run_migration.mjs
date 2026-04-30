import fs from 'fs';

const sqlPath = 'supabase/migrations/015_knowledge_vault_embeddings.sql';
const sql = fs.readFileSync(sqlPath, 'utf8');

const response = await fetch('http://localhost:3000/api/admin/migrate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-migration-secret': process.env.MIGRATION_SECRET || 'aeden-migrate-local'
    },
    body: JSON.stringify({ sql })
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));

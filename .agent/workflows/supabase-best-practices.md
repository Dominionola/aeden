---
description: Apply Supabase and PostgreSQL best practices for database operations
---

# Supabase Database Best Practices Workflow

Use this workflow when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations for Supabase.

## Steps

1. **Load Postgres Best Practices Skill**
   - Read the skill: `.agent/skills/supabase-agent-skills/skills/postgres-best-practices/SKILL.md`
   - Reference full compiled document: `.agent/skills/supabase-agent-skills/skills/postgres-best-practices/AGENTS.md`

2. **Priority Categories to Check**

   ### CRITICAL Priority
   - **Query Performance** (`query-*` rules)
     - Check for missing indexes on frequently queried columns
     - Avoid N+1 query patterns
     - Optimize JOIN operations
     - Use EXPLAIN ANALYZE for complex queries
   
   - **Connection Management** (`conn-*` rules)
     - Use connection pooling appropriately
     - Close connections properly
     - Configure connection limits

   - **Security & RLS** (`security-*` rules)
     - Enable Row-Level Security on all user-facing tables
     - Write efficient RLS policies
     - Avoid security anti-patterns

   ### HIGH Priority
   - **Schema Design** (`schema-*` rules)
     - Use appropriate data types
     - Implement partial indexes where beneficial
     - Normalize/denormalize appropriately
     - Use proper constraints

   ### MEDIUM-HIGH Priority
   - **Concurrency & Locking** (`lock-*` rules)
     - Avoid long-running transactions
     - Use appropriate isolation levels
     - Handle deadlocks gracefully

   ### MEDIUM Priority
   - **Data Access Patterns** (`data-*` rules)
     - Batch operations when possible
     - Paginate large result sets
     - Use efficient cursor patterns

3. **Reference Project Schema**
   - Check migrations in `supabase/migrations/`
   - Ensure alignment with `system_arch.md`

4. **Output Findings**
   - Report issues grouped by priority (CRITICAL → LOW)
   - Include rule ID (e.g., `query-missing-indexes`)
   - Provide SQL fixes with EXPLAIN analysis when applicable

## Triggers

Use this workflow when:
- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Working with Row-Level Security (RLS)
- Creating new Supabase migrations

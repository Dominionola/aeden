-- Migration: 015_knowledge_vault_embeddings
-- Adds pgvector semantic search to the Knowledge Vault.
-- Enables true similarity-based RAG recall instead of keyword matching.

-- Enable pgvector extension (no-op if already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to knowledge_vault
ALTER TABLE knowledge_vault
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create an IVFFLAT index for approximate nearest-neighbor search.
-- lists=100 is a good default for tables < 1M rows.
-- Use cosine distance to match Google's text-embedding-004 model.
CREATE INDEX IF NOT EXISTS idx_knowledge_vault_embedding
ON knowledge_vault
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Similarity search function used by /api/knowledge/recall
-- Returns vault entries ordered by semantic similarity to a query embedding.
-- Filters by user_id and is_active for security + relevance.
CREATE OR REPLACE FUNCTION match_knowledge_vault(
    query_embedding vector(768),
    match_user_id   UUID,
    match_limit     INT DEFAULT 5,
    match_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
    id                  UUID,
    source_title        TEXT,
    source_url          TEXT,
    source_type         TEXT,
    source_content      TEXT,
    metadata            JSONB,
    intelligence_blocks JSONB,
    contrarian_takes    TEXT[],
    suggested_hashtags  TEXT[],
    tags                TEXT[],
    times_used          INT,
    similarity          FLOAT
)
LANGUAGE sql STABLE
AS $$
    SELECT
        kv.id,
        kv.source_title,
        kv.source_url,
        kv.source_type,
        kv.source_content,
        kv.metadata,
        kv.intelligence_blocks,
        kv.contrarian_takes,
        kv.suggested_hashtags,
        kv.tags,
        kv.times_used,
        1 - (kv.embedding <=> query_embedding) AS similarity
    FROM knowledge_vault kv
    WHERE
        kv.user_id = match_user_id
        AND kv.is_active = true
        AND kv.embedding IS NOT NULL
        AND 1 - (kv.embedding <=> query_embedding) >= match_threshold
    ORDER BY kv.embedding <=> query_embedding
    LIMIT match_limit;
$$;

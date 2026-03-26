-- Migration: 014_knowledge_vault
-- Personal Knowledge Vault for content ingestion and RAG

CREATE TABLE IF NOT EXISTS knowledge_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Source Information
    source_title TEXT NOT NULL,
    source_url TEXT,
    source_type TEXT CHECK (source_type IN ('web', 'pdf', 'image', 'manual')) DEFAULT 'web',
    source_content TEXT,
    
    -- Refactored Intelligence (from Knowledge Architect AI)
    metadata JSONB NOT NULL DEFAULT '{}',
    voice_analysis JSONB NOT NULL DEFAULT '{}',
    intelligence_blocks JSONB NOT NULL DEFAULT '[]',
    contrarian_takes TEXT[] DEFAULT '{}',
    suggested_hashtags TEXT[] DEFAULT '{}',
    
    -- Organization
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    
    -- Usage Tracking
    times_used INT DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_vault_user ON knowledge_vault(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_vault_tags ON knowledge_vault USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_vault_last_used ON knowledge_vault(last_used_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_knowledge_vault_active ON knowledge_vault(user_id, is_active) WHERE is_active = true;

-- Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_knowledge_vault_updated_at ON knowledge_vault;
CREATE TRIGGER update_knowledge_vault_updated_at
    BEFORE UPDATE ON knowledge_vault
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE knowledge_vault ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_vault" ON knowledge_vault;
CREATE POLICY "users_own_vault" ON knowledge_vault
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Usage Increment Function (called by recall API)
CREATE OR REPLACE FUNCTION increment_vault_usage(vault_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE knowledge_vault 
    SET times_used = times_used + 1, 
        last_used_at = timezone('utc'::text, now())
    WHERE id = vault_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

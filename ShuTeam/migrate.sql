-- Sync Communities schema
ALTER TABLE communities ADD COLUMN IF NOT EXISTS city VARCHAR;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS category VARCHAR;

-- Sync Goals schema
ALTER TABLE goals ADD COLUMN IF NOT EXISTS requires_moderation BOOLEAN DEFAULT TRUE;

-- Sync Goal Progress schema
DO $$
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goal_progress' AND column_name='status') THEN
        ALTER TABLE goal_progress ADD COLUMN status goalstatus DEFAULT 'PENDING';
    END IF;

    -- Replace proof_url with proof_urls (JSONB)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goal_progress' AND column_name='proof_url') THEN
        ALTER TABLE goal_progress DROP COLUMN if exists proof_url;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goal_progress' AND column_name='proof_urls') THEN
        ALTER TABLE goal_progress ADD COLUMN proof_urls JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

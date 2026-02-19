-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Voice Guild Config
CREATE TABLE IF NOT EXISTS voice_guild_configs (
    guild_id TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT true,
    join_to_create_channel_ids TEXT[] DEFAULT '{}',
    default_category_id TEXT,
    max_temp_channels INTEGER DEFAULT 10,
    user_cooldown_seconds INTEGER DEFAULT 30,
    empty_delete_delay_seconds INTEGER DEFAULT 30,
    naming_pattern TEXT DEFAULT '{username}''s Channel',
    allow_support_mention BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice Channels (Active State)
CREATE TABLE IF NOT EXISTS voice_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    user_limit INTEGER DEFAULT 0,
    bitrate INTEGER DEFAULT 64000,
    locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    control_message_id TEXT,
    delete_scheduled_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_channels_guild_id ON voice_channels(guild_id);
CREATE INDEX IF NOT EXISTS idx_voice_channels_channel_id ON voice_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_voice_channels_owner_id ON voice_channels(owner_id);

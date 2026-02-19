# Discord Temporary Voice Bot

A production-grade Discord bot for managing temporary voice channels ("Join to Create").

## Features
- **Join to Create**: Dynamic channel creation when users join a specific trigger channel.
- **Auto-Cleanup**: Channels are deleted when empty after a configurable delay.
- **Slash Commands**: `/voice` command for configuring and managing channels.
- **Control Interface**: In-chat buttons for locking, unlocking, limiting users, and kicking.
- **Persistence**: State is saved in Supabase PostgreSQL, allowing the bot to recover scheduled deletions after restarts.
- **No External Dependencies**: No Redis or external job queues required.

## Prerequisites
- Node.js 18+
- PostgreSQL (Supabase recommended)
- Diiscord Bot Token

## Setup

1. **Environment Variables**
   Create a `.env` file in the root directory (or `apps/voice-bot/.env`) with:
   ```env
   DISCORD_TOKEN=your_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   DATABASE_URL=postgres://user:pass@host:5432/db
   ```

2. **Install Dependencies**
   Run from root:
   ```bash
   npm install
   ```

3. **Database Setup**
   Run the schema script in your Supabase SQL Editor:
   `packages/shared/schema.sql`

4. **Build**
   ```bash
   npm run build -w packages/shared
   npm run build -w apps/voice-bot
   ```

5. **Register Commands**
   ```bash
   npm run register -w apps/voice-bot
   ```

6. **Start**
   ```bash
   npm start -w apps/voice-bot
   ```

## Development
```bash
npm run dev -w apps/voice-bot
```

## Architecture
- `apps/voice-bot`: Main bot logic using `discord.js`.
- `packages/shared`: Shared types, database client, and logger.
- **Worker/Queues**: None. `setTimeout` is used for delays, backed by DB timestamps for recovery.

## License
MIT

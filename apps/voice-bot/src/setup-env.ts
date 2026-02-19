import dotenv from 'dotenv';
import path from 'path';

// Resolve path to root .env file
// src/index.ts -> __dirname = src
// ../ -> apps/voice-bot
// ../../ -> apps
// ../../../ -> root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

console.log('Environment variables loaded from:', path.resolve(__dirname, '../../../.env'));

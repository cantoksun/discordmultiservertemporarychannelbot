import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root if not already loaded
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Prevent multiple instances in dev
declare global {
    var prisma: PrismaClient | undefined;
}

export const db = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = db;
}

export * from '@prisma/client';

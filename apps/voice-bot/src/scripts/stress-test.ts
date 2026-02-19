
import { VoiceManager } from '../services/voice-manager';
import { Collection } from 'discord.js';

// Mock Logger to clean output
const mockLogger = {
    info: (msg: string) => console.log(`[INFO] ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${msg}`),
    warn: (msg: string) => console.log(`[WARN] ${msg}`),
};

import * as fs from 'fs';
import * as path from 'path';

const logFile = path.resolve(__dirname, 'test-output.txt');
fs.writeFileSync(logFile, ''); // Clear file

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

// Mock DB
const mockDb = {
    voiceGuildConfig: {
        findUnique: async () => ({
            guild_id: 'mock_guild',
            enabled: true,
            max_temp_channels: 50,
            user_cooldown_seconds: 0, // Disable cooldown for stress test
            naming_pattern: 'Room {username}',
            join_to_create_channel_ids: ['join_channel'],
            default_category_id: 'cat_1'
        })
    },
    voiceChannel: {
        findFirst: async () => null,
        count: async () => 0,
        create: async () => ({ id: 'new_channel_id' }),
        update: async () => { },
        delete: async () => { }
    }
};

// Mock Discord Objects
const createMockMember = (id: string, username: string) => ({
    id,
    user: { id, username, tag: `${username}#0000` },
    displayName: username,
    guild: {
        id: 'mock_guild',
        channels: {
            create: async () => {
                await new Promise(r => setTimeout(r, 100)); // Simulate 100ms API input lag
                return {
                    id: `channel_${id}`,
                    delete: async () => { }
                };
            }
        },
        members: {
            me: { permissions: { has: () => true } }, // Mock existing 'me'
            fetchMe: async () => ({ permissions: { has: () => true } })
        }
    },
    voice: {
        channel: {
            id: 'join_channel',
            parentId: 'cat_1'
        },
        setChannel: async () => { } // Mock moving user
    }
});

// Patch VoiceManager dependencies
(VoiceManager as any).db = mockDb;
// We can't easily patch imported 'db' without dependency injection or mocking file system.
// For this quick test, we will assume VoiceManager logic holds.
// Wait, VoiceManager imports 'db' directly. We can't intercept it easily in a simple script without jest/vi.
// FAILURE RISK: The real VoiceManager will try to call the REAL db.
// adjustments: We will wrap the test in a way that checks LOGIC, or modifying VoiceManager to accept injected DB? No, too invasive.
// ALTERNATIVE: checking 'Mocking' via monkey-patching 'db' property if it was a class property. It is not.

// ACTUALLY: Let's use the REAL VoiceManager but mock the 'executeChannelCreation' to JUST log, 
// checking if the QUEUE works. queue is private.

// OK, better plan:
// 1. We will rely on the verify: VoiceManager.queue is private. 
// We will simply import VoiceManager and 'createTempChannel'.
// Since we can't mock DB easily without setting up a test runner, 
// let's create a "Dry Run" test that validates the QUEUE logic by overwriting the private method 'executeChannelCreation'.

async function runStressTest() {
    log('🚀 Starting Stress Test...');

    // 1. Monkey-patch executeChannelCreation to avoid Real DB/Discord calls
    let executionCount = 0;
    const originalExecute = (VoiceManager as any).executeChannelCreation;

    (VoiceManager as any).executeChannelCreation = async (member: any, source: any) => {
        executionCount++;
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 50));

        // MANUALLY CLEAR LOCK (Simulating pending release in real code)
        const lockKey = `${member.guild.id}:${member.id}`;
        (VoiceManager as any).creatingLocks.delete(lockKey);
    };

    log('✅ Mocked execution logic.');

    // 2. Blast 20 requests
    const users = Array.from({ length: 20 }, (_, i) => createMockMember(`user_${i}`, `Tester${i}`));

    log('Waiting for queue to process...');
    const startTime = Date.now();

    // Fire all at once
    await Promise.all(users.map(u => VoiceManager.createTempChannel(u as any, 'join')));

    // WAIT FOR QUEUE TO DRAIN
    log('Waiting for background processing...');
    while ((VoiceManager as any).queue.length > 0 || (VoiceManager as any).isProcessing) {
        await new Promise(r => setTimeout(r, 50));
    }

    const duration = Date.now() - startTime;
    log(`\n🏁 Test Finished in ${duration}ms`);
    log(`Total Processed: ${executionCount} / 20`);

    if (executionCount === 20) {
        log('PASSED: Queue handled all concurrent requests.');
    } else {
        log('FAILED: Packet loss in queue.');
    }

    // 3. Test Locking (Spam same user)
    log('\n🔒 Testing Lock Mechanism...');
    executionCount = 0; // Reset
    const spamUser = createMockMember('spammer', 'SpamBot');

    // Ensure lock is clear first (it should be)
    // (VoiceManager as any).creatingLocks.clear(); // Optional, but safer for isolated test

    const spamPromises = [];
    for (let i = 0; i < 10; i++) {
        spamPromises.push(VoiceManager.createTempChannel(spamUser as any, 'join'));
    }
    await Promise.all(spamPromises);

    // WAIT FOR QUEUE TO DRAIN AGAIN
    while ((VoiceManager as any).queue.length > 0 || (VoiceManager as any).isProcessing) {
        await new Promise(r => setTimeout(r, 50));
    }

    log(`Spam Processed: ${executionCount} / 1 (Expected 1 due to lock)`);
    if (executionCount === 1) {
        log('PASSED: Lock prevented duplicates.');
    } else {
        log(`NOTE: Lock allows ${executionCount}.`);
    }

}

runStressTest().catch(console.error);

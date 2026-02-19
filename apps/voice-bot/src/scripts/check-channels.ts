
import { db } from '@repo/shared';

async function check() {
    try {
        const count = await db.voiceChannel.count();
        const channels = await db.voiceChannel.findMany();
        console.log(`Active channels in DB: ${count}`);
        console.log(JSON.stringify(channels, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await db.$disconnect();
    }
}

check();

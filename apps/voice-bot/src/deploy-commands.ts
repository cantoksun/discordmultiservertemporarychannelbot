import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import { voiceCommand } from './commands/voice';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
    console.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const commands = [voiceCommand.data.toJSON()];

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

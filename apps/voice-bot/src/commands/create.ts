import { SlashCommandSubcommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { VoiceManager } from '../services/voice-manager';
import { Logger } from '@repo/shared';

const logger = new Logger('CreateCommand');

export const createSubcommand = {
    builder: (subcommand: SlashCommandSubcommandBuilder) =>
        subcommand
            .setName('create')
            .setDescription('Create a new temporary voice channel'),

    execute: async (interaction: ChatInputCommandInteraction) => {
        const member = interaction.member as GuildMember;

        // Check if user is in voice (optional requirement? Plan says "Move User (if in voice)")
        // If not in voice, we can still create usage but can't move.

        await interaction.deferReply({ ephemeral: true });

        try {
            if (!member.voice.channelId) {
                // Plan doesn't strictly say fail, but "Move User" implies voice presence.
                // Usually easier if they are in voice, but we can allow creating anyway.
                // But "Join-to-Create" implies specific constraints. Slash command is mostly for when J2C is broken or specific overrides.
                // Let's create it.
            }

            await VoiceManager.createTempChannel(member, 'command');
            await interaction.editReply({ content: 'Channel created!' });

        } catch (err) {
            logger.error('Create command error', err);
            await interaction.editReply({ content: 'Failed to create channel.' });
        }
    },
};

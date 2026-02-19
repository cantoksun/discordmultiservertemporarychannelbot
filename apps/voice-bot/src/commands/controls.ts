import { SlashCommandSubcommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { db } from '@repo/shared';
// We should check ownership here.
// I'll add a helper `checkOwner`.

const checkOwner = async (interaction: ChatInputCommandInteraction) => {
    const member = interaction.member;
    const channelId = (member as any).voice?.channelId;
    if (!channelId) {
        await interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
        return false;
    }
    const channel = await db.voiceChannel.findUnique({
        where: { channel_id: channelId },
        select: { owner_id: true }
    });
    if (!channel || channel.owner_id !== member?.user.id) {
        await interaction.reply({ content: 'You do not own this temporary channel.', ephemeral: true });
        return false;
    }
    return true;
};

export const lockSubcommand = {
    builder: (subcommand: SlashCommandSubcommandBuilder) =>
        subcommand.setName('lock').setDescription('Lock your voice channel'),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!await checkOwner(interaction)) return;
        const channel = (interaction.member as any).voice.channel;
        await channel.permissionOverwrites.edit(interaction.guild!.id, { Connect: false });
        await db.voiceChannel.update({
            where: { channel_id: channel.id },
            data: { locked: true }
        });
        await interaction.reply({ content: 'Channel locked.', ephemeral: true });
    }
};

export const unlockSubcommand = {
    builder: (subcommand: SlashCommandSubcommandBuilder) =>
        subcommand.setName('unlock').setDescription('Unlock your voice channel'),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!await checkOwner(interaction)) return;
        const channel = (interaction.member as any).voice.channel;
        await channel.permissionOverwrites.edit(interaction.guild!.id, { Connect: null }); // Reset to default (inherit) or true
        await db.voiceChannel.update({
            where: { channel_id: channel.id },
            data: { locked: false }
        });
        await interaction.reply({ content: 'Channel unlocked.', ephemeral: true });
    }
};

export const limitSubcommand = {
    builder: (subcommand: SlashCommandSubcommandBuilder) =>
        subcommand.setName('limit').setDescription('Set user limit').addIntegerOption(o => o.setName('count').setDescription('Limit').setRequired(true)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!await checkOwner(interaction)) return;
        const limit = interaction.options.getInteger('count', true);

        // Validation: Discord max is 99
        if (limit < 0 || limit > 99) {
            await interaction.reply({ content: '❌ Limit must be between 0-99 (Discord maximum).', ephemeral: true });
            return;
        }

        const channel = (interaction.member as any).voice.channel;
        await channel.setUserLimit(limit);
        await db.voiceChannel.update({
            where: { channel_id: channel.id },
            data: { user_limit: limit }
        });
        await interaction.reply({ content: `✅ Limit set to ${limit}.`, ephemeral: true });
    }
};

export const nameSubcommand = {
    builder: (subcommand: SlashCommandSubcommandBuilder) =>
        subcommand.setName('name').setDescription('Rename channel').addStringOption(o => o.setName('name').setDescription('New name').setRequired(true)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!await checkOwner(interaction)) return;
        const name = interaction.options.getString('name', true);
        const channel = (interaction.member as any).voice.channel;
        await channel.setName(name);
        await db.voiceChannel.update({
            where: { channel_id: channel.id },
            data: { name: name }
        });
        await interaction.reply({ content: `Channel renamed to ${name}.`, ephemeral: true });
    }
};

export const kickSubcommand = {
    builder: (subcommand: SlashCommandSubcommandBuilder) =>
        subcommand.setName('kick').setDescription('Kick user').addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!await checkOwner(interaction)) return;
        const user = interaction.options.getMember('user') as any;
        if (user.voice.channelId !== (interaction.member as any).voice.channelId) {
            await interaction.reply({ content: 'User is not in your channel.', ephemeral: true });
            return;
        }
        await user.voice.disconnect('Kicked by owner');
        await interaction.reply({ content: `Kicked ${user.user.tag}.`, ephemeral: true });
    }
};

export const transferSubcommand = {
    builder: (subcommand: SlashCommandSubcommandBuilder) =>
        subcommand.setName('transfer').setDescription('Transfer ownership').addUserOption(o => o.setName('user').setDescription('New owner').setRequired(true)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!await checkOwner(interaction)) return;
        const newUser = interaction.options.getMember('user') as any;
        const channel = (interaction.member as any).voice.channel;

        await db.voiceChannel.update({
            where: { channel_id: channel.id },
            data: { owner_id: newUser.id }
        });
        // Update permissions could go here (give manage channels to new user)
        await channel.permissionOverwrites.edit(newUser.id, { ManageChannels: true, MoveMembers: true, Connect: true });
        await channel.permissionOverwrites.edit((interaction.member as any).id, { ManageChannels: false, MoveMembers: false }); // Remove from old

        await interaction.reply({ content: `Ownership transferred to ${newUser.user.tag}.`, ephemeral: true });
    }
};

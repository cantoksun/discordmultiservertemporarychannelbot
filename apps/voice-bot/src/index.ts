import './setup-env'; // Must be first
import { Client, GatewayIntentBits, Interaction } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs'; // Import fs
import { db, Logger } from '@repo/shared';
import { voiceCommand, updateSettingsPanel } from './commands/voice';
import { updateUserInterface } from './utils/user-panel';
import { VoiceManager } from './services/voice-manager';
import { t } from './utils/i18n';
// Import events manually or dynamically?
import * as voiceStateEvent from './events/voice-state-update';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const logger = new Logger('Bot');

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason: reason instanceof Error ? reason.stack : String(reason) });
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
});

logger.info('Voice Bot Starting...');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

client.once('ready', () => {
    logger.info(`Logged in as ${client.user?.tag}`);
    VoiceManager.init(client);
    VoiceManager.startOrphanCleanup();
});


// Event Handling
client.on(voiceStateEvent.name, (...args) => voiceStateEvent.execute(...args));

// Interaction Handling
client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'voice') {
            try {
                await voiceCommand.execute(interaction);
            } catch (error) {
                logger.error('Error executing voice command', error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
                }
            }
        }
    } else if (interaction.isButton()) {
        // Handle buttons: voice_lock, voice_unlock, etc.
        // Logic mostly mirrors commands.
        // Ideally we reuse controls.ts or map them.
        // For MVP, I'll direct map or use a helper.
        // I'll assume `controls.ts` exports `execute` functions I can reuse if I adapt interaction?
        // Or just re-implement simple logic/call helpers.
        // Let's implement basic handling here or route to a handler.

        const customId = interaction.customId;

        // Security Check: Settings interactions are Admin only
        if (customId.startsWith('settings_')) {
            const { PermissionFlagsBits } = await import('discord.js');
            if (!(interaction.member as any).permissions.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({ content: '❌ You do not have permission to change settings.', ephemeral: true });
                return;
            }
        }

        if (!customId.startsWith('voice_') && !customId.startsWith('settings_')) return;

        if (customId.startsWith('voice_')) {
            const action = customId.replace('voice_', '');

            // Fetch lang for interaction
            let lang = 'en';
            if (interaction.guildId) {
                const config = await db.voiceGuildConfig.findUnique({ where: { guild_id: interaction.guildId } });
                if (config) lang = config.language;
            }

            // ... (rest of voice_ logic)

            // We need to pass this to a handler.
            // I'll create `apps/voice-bot/src/services/button-handler.ts` to keep index clean?
            // Or just inline for now to save complexity.

            try {
                if (action === 'lock' || action === 'unlock') {
                    // Reuse logic by extraction?
                    // I'll separate logic later. For now, inline simple ops.
                    const channel = (interaction.member as any).voice.channel;
                    if (!channel) return interaction.reply({ content: t(lang, 'errors.not_in_voice'), ephemeral: true });

                    // Owner check
                    const { db } = await import('@repo/shared');
                    const voiceChannel = await db.voiceChannel.findUnique({
                        where: { channel_id: channel.id },
                        select: { owner_id: true }
                    });
                    if (!voiceChannel || voiceChannel.owner_id !== interaction.user.id) {
                        return interaction.reply({ content: t(lang, 'errors.not_owner'), ephemeral: true });
                    }

                    if (action === 'lock') {
                        await channel.permissionOverwrites.edit(interaction.guild!.id, { Connect: false });
                        await db.voiceChannel.update({
                            where: { channel_id: channel.id },
                            data: { locked: true }
                        });
                        await updateUserInterface(interaction, channel.id);
                    } else {
                        await channel.permissionOverwrites.edit(interaction.guild!.id, { Connect: null });
                        await db.voiceChannel.update({
                            where: { channel_id: channel.id },
                            data: { locked: false }
                        });
                        await updateUserInterface(interaction, channel.id);
                    }
                } else if (action === 'limit') {
                    // Show modal
                    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
                    const modal = new ModalBuilder().setCustomId('voice_limit_modal').setTitle(t(lang, 'modals.limit_title'));
                    const input = new TextInputBuilder().setCustomId('limit_input').setLabel(t(lang, 'modals.limit_label')).setStyle(TextInputStyle.Short).setRequired(true);
                    modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
                    await interaction.showModal(modal);
                } else if (action === 'rename') {
                    // Show rename modal
                    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
                    const modal = new ModalBuilder().setCustomId('voice_rename_modal').setTitle(t(lang, 'modals.rename_title'));
                    const input = new TextInputBuilder().setCustomId('name_input').setLabel(t(lang, 'modals.rename_label')).setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100);
                    modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
                    await interaction.showModal(modal);
                } else if (action === 'kick') {
                    // Show kick modal
                    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
                    const modal = new ModalBuilder().setCustomId('voice_kick_modal').setTitle(t(lang, 'modals.kick_title'));
                    const input = new TextInputBuilder()
                        .setCustomId('user_input')
                        .setLabel(t(lang, 'modals.kick_label'))
                        .setPlaceholder(t(lang, 'modals.kick_placeholder'))
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
                    await interaction.showModal(modal);
                } else if (action === 'transfer') {
                    // Show transfer modal
                    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
                    const modal = new ModalBuilder().setCustomId('voice_transfer_modal').setTitle(t(lang, 'modals.transfer_title'));
                    const input = new TextInputBuilder()
                        .setCustomId('user_input')
                        .setLabel(t(lang, 'modals.transfer_label'))
                        .setPlaceholder(t(lang, 'modals.transfer_placeholder'))
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
                    await interaction.showModal(modal);
                } else if (action === 'delete') {
                    // Close the channel
                    const channel = (interaction.member as any).voice.channel;
                    if (channel) {
                        try {
                            await channel.delete('Owner closed channel');
                        } catch (e) {
                            logger.warn('Failed to delete channel from Discord', e);
                        }
                    }

                    // Cleanup DB
                    await db.voiceChannel.delete({
                        where: { channel_id: (interaction.member as any).voice.channelId }
                    }).catch(() => { });

                    // Since channel is deleted, we can't update UI or reply easily if we were in it.
                    // But interaction reply might fail if channel is gone.
                    // Try to reply ephemeral if possible, but it might disappear.
                } else if (action === 'refresh') {
                    // Refresh the panel by fetching latest data
                    const voiceChannel = await db.voiceChannel.findUnique({
                        where: { channel_id: (interaction.member as any).voice.channelId },
                        select: { owner_id: true, locked: true, user_limit: true, name: true }
                    });

                    if (!voiceChannel) {
                        await interaction.reply({ content: t(lang, 'errors.no_channel'), ephemeral: true });
                        return;
                    }

                    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
                    const embed = new EmbedBuilder()
                        .setTitle(t(lang, 'embeds.title'))
                        .setDescription(t(lang, 'embeds.description')) // Or maybe specific refresh description? Reusing creation desc is ok or generic.
                        // Actually creation desc says "created", maybe "Voice Channel Controls" logic?
                        // "embeds.description" is "Your personal ... is ready". Fits enough.
                        .addFields(
                            { name: t(lang, 'embeds.status'), value: voiceChannel.locked ? t(lang, 'embeds.locked') : t(lang, 'embeds.unlocked'), inline: true },
                            { name: t(lang, 'embeds.limit'), value: voiceChannel.user_limit === 0 ? t(lang, 'embeds.no_limit') : `${voiceChannel.user_limit}`, inline: true },
                            { name: t(lang, 'embeds.channel_name'), value: voiceChannel.name, inline: true }
                        )
                        .setColor(voiceChannel.locked ? 0xFF0000 : 0x00FF00)
                        .setFooter({ text: t(lang, 'embeds.footer') });

                    const { getVoicePanelComponents } = await import('./utils/user-panel');
                    const components = getVoicePanelComponents(voiceChannel.locked, lang);

                    if (interaction.replied || interaction.deferred) {
                        await interaction.editReply({ embeds: [embed], components: components as any });
                    } else {
                        await interaction.update({ embeds: [embed], components: components as any });
                    }
                }
            } catch (err) {
                logger.error('Error in interaction handler', err);
                if (!interaction.replied) await interaction.reply({ content: 'Error', ephemeral: true });
            }

        }
    } else if (interaction.isModalSubmit()) {
        try {
            let lang = 'en';
            if (interaction.guildId) {
                const config = await db.voiceGuildConfig.findUnique({ where: { guild_id: interaction.guildId } });
                if (config) lang = config.language;
            }

            if (interaction.customId.startsWith('settings_')) {
                const { PermissionFlagsBits } = await import('discord.js');
                if (!(interaction.member as any).permissions.has(PermissionFlagsBits.Administrator)) {
                    await interaction.reply({ content: t(lang, 'errors.no_permission'), ephemeral: true });
                    return;
                }
            }

            if (interaction.customId === 'voice_limit_modal') {
                const limitStr = interaction.fields.getTextInputValue('limit_input');
                const limit = parseInt(limitStr);
                if (isNaN(limit) || limit < 0 || limit > 99) return interaction.reply({ content: t(lang, 'errors.invalid_limit'), ephemeral: true });

                const channel = (interaction.member as any).voice.channel;
                if (channel) {
                    const { PermissionFlagsBits } = await import('discord.js');
                    if (!channel.permissionsFor(client.user!)?.has(PermissionFlagsBits.ManageChannels)) {
                        return interaction.reply({ content: t(lang, 'errors.bot_missing_perms'), ephemeral: true });
                    }

                    await channel.setUserLimit(limit);
                    await db.voiceChannel.update({
                        where: { channel_id: channel.id },
                        data: { user_limit: limit }
                    });
                    await updateUserInterface(interaction, channel.id);
                }
            } else if (interaction.customId === 'voice_rename_modal') {
                const newName = interaction.fields.getTextInputValue('name_input');
                if (!newName || newName.length > 100) return interaction.reply({ content: t(lang, 'errors.invalid_name'), ephemeral: true });

                const channel = (interaction.member as any).voice.channel;
                if (channel) {
                    const { PermissionFlagsBits } = await import('discord.js');
                    if (!channel.permissionsFor(client.user!)?.has(PermissionFlagsBits.ManageChannels)) {
                        return interaction.reply({ content: t(lang, 'errors.bot_missing_perms'), ephemeral: true });
                    }

                    try {
                        await channel.setName(newName);
                        await db.voiceChannel.update({
                            where: { channel_id: channel.id },
                            data: { name: newName }
                        });
                        await updateUserInterface(interaction, channel.id);
                    } catch (err: any) {
                        if (err.code === 50035 || err.status === 429 || (err.message && err.message.includes('rate limit'))) {
                            await interaction.reply({ content: t(lang, 'errors.rate_limit'), ephemeral: true });
                        } else {
                            throw err;
                        }
                    }
                }
            } else if (interaction.customId === 'voice_kick_modal') {
                const userInput = interaction.fields.getTextInputValue('user_input');
                const channel = (interaction.member as any).voice.channel;

                if (!channel) {
                    await interaction.reply({ content: t(lang, 'errors.not_in_voice'), ephemeral: true });
                    return;
                }

                // Permission Check
                const { PermissionFlagsBits } = await import('discord.js');
                if (!channel.permissionsFor(client.user!)?.has(PermissionFlagsBits.MoveMembers)) {
                    return interaction.reply({ content: t(lang, 'errors.bot_missing_perms'), ephemeral: true });
                }

                let targetMember = interaction.guild?.members.cache.get(userInput);
                if (!targetMember) {
                    targetMember = interaction.guild?.members.cache.find(m =>
                        m.user.username.toLowerCase() === userInput.toLowerCase() ||
                        m.user.tag.toLowerCase() === userInput.toLowerCase()
                    );
                }

                if (!targetMember) {
                    await interaction.reply({ content: t(lang, 'errors.user_not_found'), ephemeral: true });
                    return;
                }

                if (targetMember.voice.channelId !== channel.id) {
                    await interaction.reply({ content: t(lang, 'errors.user_not_in_channel'), ephemeral: true });
                    return;
                }

                await targetMember.voice.disconnect();
                await updateUserInterface(interaction, channel.id);
            } else if (interaction.customId === 'voice_transfer_modal') {
                const userInput = interaction.fields.getTextInputValue('user_input');
                const channel = (interaction.member as any).voice.channel;

                if (!channel) {
                    await interaction.reply({ content: t(lang, 'errors.not_in_voice'), ephemeral: true });
                    return;
                }

                let newOwner = interaction.guild?.members.cache.get(userInput);
                if (!newOwner) {
                    newOwner = interaction.guild?.members.cache.find(m =>
                        m.user.username.toLowerCase() === userInput.toLowerCase() ||
                        m.user.tag.toLowerCase() === userInput.toLowerCase()
                    );
                }

                if (!newOwner) {
                    await interaction.reply({ content: t(lang, 'errors.user_not_found'), ephemeral: true });
                    return;
                }

                if (newOwner.voice.channelId !== channel.id) {
                    await interaction.reply({ content: t(lang, 'errors.owner_must_be_in_channel'), ephemeral: true });
                    return;
                }

                await db.voiceChannel.update({
                    where: { channel_id: channel.id },
                    data: { owner_id: newOwner.id }
                });

                await updateUserInterface(interaction, channel.id);
            } else if (interaction.customId === 'settings_max_channels_modal') {
                const valueStr = interaction.fields.getTextInputValue('value_input');
                const value = parseInt(valueStr);
                if (isNaN(value) || value < 1 || value > 50) {
                    await interaction.reply({ content: '❌ Invalid value. Must be between 1-50', ephemeral: true });
                    return;
                }

                await db.voiceGuildConfig.upsert({
                    where: { guild_id: interaction.guildId! },
                    create: { guild_id: interaction.guildId!, max_temp_channels: value },
                    update: { max_temp_channels: value }
                });

                const guildId = interaction.guildId!;
                const newConfig = await db.voiceGuildConfig.findUnique({ where: { guild_id: guildId } });
                await updateSettingsPanel(interaction, newConfig, guildId);
            } else if (interaction.customId === 'settings_cooldown_modal') {
                const valueStr = interaction.fields.getTextInputValue('value_input');
                const value = parseInt(valueStr);
                if (isNaN(value) || value < 0 || value > 3600) {
                    await interaction.reply({ content: '❌ Invalid value. Must be between 0-3600', ephemeral: true });
                    return;
                }

                await db.voiceGuildConfig.upsert({
                    where: { guild_id: interaction.guildId! },
                    create: { guild_id: interaction.guildId!, user_cooldown_seconds: value },
                    update: { user_cooldown_seconds: value }
                });

                const guildId2 = interaction.guildId!;
                const newConfig2 = await db.voiceGuildConfig.findUnique({ where: { guild_id: guildId2 } });
                await updateSettingsPanel(interaction, newConfig2, guildId2);
            } else if (interaction.customId === 'settings_delete_delay_modal') {
                const valueStr = interaction.fields.getTextInputValue('value_input');
                const value = parseInt(valueStr);
                if (isNaN(value) || value < 5 || value > 300) {
                    await interaction.reply({ content: '❌ Invalid value. Must be between 5-300', ephemeral: true });
                    return;
                }

                await db.voiceGuildConfig.upsert({
                    where: { guild_id: interaction.guildId! },
                    create: { guild_id: interaction.guildId!, empty_delete_delay_seconds: value },
                    update: { empty_delete_delay_seconds: value }
                });

                const guildId3 = interaction.guildId!;
                const newConfig3 = await db.voiceGuildConfig.findUnique({ where: { guild_id: guildId3 } });
                await updateSettingsPanel(interaction, newConfig3, guildId3);
            }
        } catch (error) {
            logger.error('Error in modal submit', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => { });
            }
        }
    } else if (interaction.isChannelSelectMenu()) {
        if (interaction.customId.startsWith('settings_')) {
            const { PermissionFlagsBits } = await import('discord.js');
            if (!(interaction.member as any).permissions.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({ content: '❌ You do not have permission to change settings.', ephemeral: true });
                return;
            }
        }
        const guildId = interaction.guildId!;

        if (interaction.customId === 'settings_join_channel') {
            const selectedChannel = interaction.channels.first();

            await db.voiceGuildConfig.upsert({
                where: { guild_id: guildId },
                create: {
                    guild_id: guildId,
                    join_to_create_channel_ids: selectedChannel ? [selectedChannel.id] : []
                },
                update: {
                    join_to_create_channel_ids: selectedChannel ? [selectedChannel.id] : []
                }
            });

            // Fetch updated config and refresh panel
            const newConfig = await db.voiceGuildConfig.findUnique({ where: { guild_id: guildId } });
            await updateSettingsPanel(interaction, newConfig, guildId);
        } else if (interaction.customId === 'settings_category') {
            const selectedCategory = interaction.channels.first();

            await db.voiceGuildConfig.upsert({
                where: { guild_id: guildId },
                create: {
                    guild_id: guildId,
                    default_category_id: selectedCategory?.id || null
                },
                update: {
                    default_category_id: selectedCategory?.id || null
                }
            });

            // Fetch updated config and refresh panel
            const newConfig2 = await db.voiceGuildConfig.findUnique({ where: { guild_id: guildId } });
            await updateSettingsPanel(interaction, newConfig2, guildId);
        }
    } else if (interaction.isStringSelectMenu()) {
        const customId = interaction.customId;

        if (customId === 'voice_menu') {
            const action = interaction.values[0];
            const guildId = interaction.guildId!;

            const config = await db.voiceGuildConfig.findUnique({ where: { guild_id: guildId } });
            const lang = config?.language || 'en';

            const channel = (interaction.member as any).voice.channel;
            if (!channel) {
                await interaction.reply({ content: t(lang, 'errors.not_in_voice'), ephemeral: true });
                return;
            }

            // Route to existing logic
            // Since logic is inside `voice_` block above, we can ideally extract it or duplicate short logic.
            // For now, I will inline the modal triggers as they are short.

            if (action === 'rename') {
                const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
                const modal = new ModalBuilder().setCustomId('voice_rename_modal').setTitle(t(lang, 'modals.rename_title'));
                const input = new TextInputBuilder().setCustomId('name_input').setLabel(t(lang, 'modals.rename_label')).setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100);
                modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
                await interaction.showModal(modal);
            } else if (action === 'limit') {
                const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
                const modal = new ModalBuilder().setCustomId('voice_limit_modal').setTitle(t(lang, 'modals.limit_title'));
                const input = new TextInputBuilder().setCustomId('limit_input').setLabel(t(lang, 'modals.limit_label')).setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
                await interaction.showModal(modal);
            } else if (action === 'kick') {
                const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
                const modal = new ModalBuilder().setCustomId('voice_kick_modal').setTitle(t(lang, 'modals.kick_title'));
                const input = new TextInputBuilder()
                    .setCustomId('user_input')
                    .setLabel(t(lang, 'modals.kick_label'))
                    .setPlaceholder(t(lang, 'modals.kick_placeholder'))
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
                await interaction.showModal(modal);
            } else if (action === 'transfer') {
                const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
                const modal = new ModalBuilder().setCustomId('voice_transfer_modal').setTitle(t(lang, 'modals.transfer_title'));
                const input = new TextInputBuilder()
                    .setCustomId('user_input')
                    .setLabel(t(lang, 'modals.transfer_label'))
                    .setPlaceholder(t(lang, 'modals.transfer_placeholder'))
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
                await interaction.showModal(modal);
            } else if (action === 'delete') {
                // Close the channel
                try {
                    await channel.delete(t(lang, 'embeds.footer')); // Using footer as reason? Or generic string. "Owner closed channel"
                } catch (e) {
                    logger.warn('Failed to delete channel from Discord', e);
                }

                // Cleanup DB
                await db.voiceChannel.delete({
                    where: { channel_id: (interaction.member as any).voice.channelId }
                }).catch(() => { });
            }

        } else if (customId.startsWith('settings_')) {
            const { PermissionFlagsBits } = await import('discord.js');
            if (!(interaction.member as any).permissions.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({ content: '❌ You do not have permission to change settings.', ephemeral: true });
                return;
            }
        }
        if (interaction.customId === 'settings_language') {
            const guildId = interaction.guildId!;
            const selectedLang = interaction.values[0];

            await db.voiceGuildConfig.upsert({
                where: { guild_id: guildId },
                create: { guild_id: guildId, language: selectedLang },
                update: { language: selectedLang }
            });

            // Fetch updated config and refresh panel
            const newConfig = await db.voiceGuildConfig.findUnique({ where: { guild_id: guildId } });
            await updateSettingsPanel(interaction, newConfig, guildId);
        } else if (interaction.customId === 'settings_options') {
            const selected = interaction.values[0];
            const guildId = interaction.guildId!;
            const config = await db.voiceGuildConfig.findUnique({ where: { guild_id: guildId } });
            const lang = config?.language || 'en';

            if (selected === 'max_channels') {
                const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
                const modal = new ModalBuilder().setCustomId('settings_max_channels_modal').setTitle(t(lang, 'options.max_channels_label'));
                const input = new TextInputBuilder()
                    .setCustomId('value_input')
                    .setLabel(t(lang, 'options.max_channels_desc'))
                    .setPlaceholder('10')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
                await interaction.showModal(modal);
            } else if (selected === 'cooldown') {
                const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
                const modal = new ModalBuilder().setCustomId('settings_cooldown_modal').setTitle(t(lang, 'options.cooldown_label'));
                const input = new TextInputBuilder()
                    .setCustomId('value_input')
                    .setLabel(t(lang, 'options.cooldown_desc'))
                    .setPlaceholder('30')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
                await interaction.showModal(modal);
            } else if (selected === 'delete_delay') {
                const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
                const modal = new ModalBuilder().setCustomId('settings_delete_delay_modal').setTitle(t(lang, 'options.delete_delay_label'));
                const input = new TextInputBuilder()
                    .setCustomId('value_input')
                    .setLabel(t(lang, 'options.delete_delay_desc'))
                    .setPlaceholder('30')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder<any>().addComponents(input));
                await interaction.showModal(modal);
            } else if (selected === 'toggle_modals') {
                const config = await db.voiceGuildConfig.findUnique({ where: { guild_id: guildId } });
                // const newValue = !config?.modals_enabled;
                const newValue = true; // Temporary: modals always enabled

                await db.voiceGuildConfig.upsert({
                    where: { guild_id: guildId },
                    create: { guild_id: guildId }, // modals_enabled removed
                    update: {} // modals_enabled removed
                });

                await interaction.reply({ content: `✅ Modals ${newValue ? 'enabled' : 'disabled'}`, ephemeral: true });
            } else if (selected === 'toggle_system') {
                const config = await db.voiceGuildConfig.findUnique({ where: { guild_id: guildId } });
                const newValue = !config?.enabled;

                await db.voiceGuildConfig.upsert({
                    where: { guild_id: guildId },
                    create: { guild_id: guildId, enabled: newValue },
                    update: { enabled: newValue }
                });

                // Fetch updated config and refresh panel
                const updatedConfig = await db.voiceGuildConfig.findUnique({ where: { guild_id: guildId } });
                await updateSettingsPanel(interaction, updatedConfig, guildId);
            }
        }
    }
});


// Basic DB check
(async () => {
    try {
        await db.$queryRaw`SELECT NOW()`;
        logger.info('DB Connected');
    } catch (err) {
        logger.error('DB Connection Failed:', err);
    }
})();

if (process.env.DISCORD_TOKEN) {
    client.login(process.env.DISCORD_TOKEN).catch((err) => {
        logger.error('Login Failed:', err);
    });
} else {
    logger.warn('No DISCORD_TOKEN found in .env');
}

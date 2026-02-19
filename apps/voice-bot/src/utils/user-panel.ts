import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { db } from '@repo/shared';
import { t } from './i18n';

// Shared component generator
export function getVoicePanelComponents(isLocked: boolean, lang: string) {
    // Row 1: Dropdown Menu for secondary actions
    const menu = new StringSelectMenuBuilder()
        .setCustomId('voice_menu')
        .setPlaceholder(t(lang, 'options.configure')) // Reusing generic configure or need specific? "Select action"
        // Let's use a generic placeholder or hardcode localized one if key missing.
        // "Select an action..." -> let's make a key or just use generic "settings.title" logic?
        // simple: "select an action" logic.
        // using 'options.configure' (configure other settings) is close enough or 'buttons.refresh' etc.
        // Let's use a fixed string or add to i18n?
        // User asked for lowercase.
        .setPlaceholder('select an action...')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(t(lang, 'buttons.rename'))
                .setDescription('change channel name')
                .setValue('rename')
                .setEmoji('✏️'),
            new StringSelectMenuOptionBuilder()
                .setLabel(t(lang, 'buttons.limit'))
                .setDescription('set user limit')
                .setValue('limit')
                .setEmoji('👥'),
            new StringSelectMenuOptionBuilder()
                .setLabel(t(lang, 'buttons.kick'))
                .setDescription('disconnect a user')
                .setValue('kick')
                .setEmoji('🚫'),
            new StringSelectMenuOptionBuilder()
                .setLabel(t(lang, 'buttons.transfer'))
                .setDescription('transfer ownership')
                .setValue('transfer')
                .setEmoji('👑'),
            new StringSelectMenuOptionBuilder()
                .setLabel(t(lang, 'buttons.close'))
                .setDescription('delete channel')
                .setValue('delete')
                .setEmoji('🗑️')
        );

    const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

    // Row 2: Priority Buttons (Lock/Unlock + Refresh)
    const row2 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(isLocked ? 'voice_unlock' : 'voice_lock')
                .setLabel(isLocked ? t(lang, 'buttons.unlock') : t(lang, 'buttons.lock'))
                .setStyle(isLocked ? ButtonStyle.Success : ButtonStyle.Danger)
                .setEmoji(isLocked ? '🔓' : '🔒'),
            new ButtonBuilder()
                .setCustomId('voice_refresh')
                .setLabel(t(lang, 'buttons.refresh'))
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔄')
        );

    return [row1, row2];
}

// Helper to render user interface
export async function updateUserInterface(interaction: Interaction, channelId: string) {
    const voiceChannel = await db.voiceChannel.findUnique({
        where: { channel_id: channelId },
        select: { owner_id: true, locked: true, user_limit: true, name: true, guild_id: true }
    });

    if (!voiceChannel) {
        if (interaction.isRepliable()) {
            await interaction.reply({ content: '❌ Channel not found or expired.', ephemeral: true });
        }
        return;
    }

    // Fetch config to get language
    const config = await db.voiceGuildConfig.findUnique({ where: { guild_id: voiceChannel.guild_id } });
    const lang = config?.language || 'en';

    const embed = new EmbedBuilder()
        .setTitle(t(lang, 'embeds.title'))
        .setDescription(`${t(lang, 'embeds.description').replace('!', '')}: **${voiceChannel.name}**`)
        .addFields(
            { name: t(lang, 'embeds.status'), value: voiceChannel.locked ? t(lang, 'embeds.locked') : t(lang, 'embeds.unlocked'), inline: true },
            { name: t(lang, 'embeds.limit'), value: voiceChannel.user_limit === 0 ? t(lang, 'embeds.no_limit') : `${voiceChannel.user_limit}`, inline: true },
            { name: t(lang, 'embeds.owner'), value: `<@${voiceChannel.owner_id}>`, inline: true }
        )
        .setColor(voiceChannel.locked ? 0xFF0000 : 0x00FF00)
        .setFooter({ text: t(lang, 'embeds.footer') });

    const components = getVoicePanelComponents(voiceChannel.locked, lang);

    if (interaction.isRepliable()) {
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [embed], components: components as any });
        } else {
            await (interaction as any).update({ embeds: [embed], components: components as any });
        }
    }
}

import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } from 'discord.js';
import { db, Logger } from '@repo/shared';
import { t } from '../utils/i18n';

const logger = new Logger('VoiceCommand');

export const voiceCommand = {
    data: new SlashCommandBuilder()
        .setName('voice')
        .setDescription('Configure temporary voice channels (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub
                .setName('settings')
                .setDescription('Open interactive settings panel')
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'settings') {
            await interaction.deferReply({ ephemeral: true });

            const guildId = interaction.guildId!;

            try {
                // Fetch current config
                const config = await db.voiceGuildConfig.findUnique({
                    where: { guild_id: guildId }
                });

                await updateSettingsPanel(interaction, config, guildId);
            } catch (error) {
                logger.error('Settings panel error:', error);
                await interaction.editReply({ content: '❌ Failed to load settings panel.' });
            }
        }
    }
};

// Helper function to update the settings panel
async function updateSettingsPanel(interaction: any, config: any, guildId: string) {
    const lang = config?.language || 'en';

    // Create settings panel embed
    const embed = new EmbedBuilder()
        .setTitle(t(lang, 'settings.title'))
        .setDescription(t(lang, 'settings.description'))
        .addFields(
            { name: t(lang, 'settings.join_channel'), value: config?.join_to_create_channel_ids?.[0] ? `<#${config.join_to_create_channel_ids[0]}>` : t(lang, 'settings.not_set'), inline: true },
            { name: t(lang, 'settings.category'), value: config?.default_category_id ? `<#${config.default_category_id}>` : t(lang, 'settings.not_set'), inline: true },
            { name: t(lang, 'settings.max_channels'), value: `${config?.max_temp_channels || 10}`, inline: true },
            { name: t(lang, 'settings.cooldown'), value: `${config?.user_cooldown_seconds || 30}s`, inline: true },
            { name: t(lang, 'settings.delete_delay'), value: `${config?.empty_delete_delay_seconds || 30}s`, inline: true },
            { name: t(lang, 'settings.status'), value: config?.enabled ? t(lang, 'settings.enabled') : t(lang, 'settings.disabled'), inline: true }
        )
        .setColor(0x5865F2)
        .setFooter({ text: t(lang, 'settings.footer') });

    // Language select
    const languageSelect = new StringSelectMenuBuilder()
        .setCustomId('settings_language')
        .setPlaceholder(t(lang, 'settings.language'))
        .addOptions(
            { label: 'English', value: 'en', emoji: '🇺🇸', default: lang === 'en' },
            { label: 'Türkçe', value: 'tr', emoji: '🇹🇷', default: lang === 'tr' },
            { label: 'Español', value: 'es', emoji: '🇪🇸', default: lang === 'es' },
            { label: 'Français', value: 'fr', emoji: '🇫🇷', default: lang === 'fr' },
            { label: 'Deutsch', value: 'de', emoji: '🇩🇪', default: lang === 'de' },
            { label: 'Italiano', value: 'it', emoji: '🇮🇹', default: lang === 'it' },
            { label: 'Русский', value: 'ru', emoji: '🇷🇺', default: lang === 'ru' },
            { label: '中文', value: 'zh', emoji: '🇨🇳', default: lang === 'zh' }
        );

    // Channel select for join-to-create
    const joinChannelSelect = new ChannelSelectMenuBuilder()
        .setCustomId('settings_join_channel')
        .setPlaceholder(t(lang, 'options.select_join'))
        .addChannelTypes(ChannelType.GuildVoice)
        .setMinValues(0)
        .setMaxValues(1);

    // Channel select for category
    const categorySelect = new ChannelSelectMenuBuilder()
        .setCustomId('settings_category')
        .setPlaceholder(t(lang, 'options.select_category'))
        .addChannelTypes(ChannelType.GuildCategory)
        .setMinValues(0)
        .setMaxValues(1);

    // String select for other settings
    const optionsSelect = new StringSelectMenuBuilder()
        .setCustomId('settings_options')
        .setPlaceholder(t(lang, 'options.configure'))
        .addOptions(
            {
                label: t(lang, 'options.max_channels_label'),
                description: t(lang, 'options.max_channels_desc'),
                value: 'max_channels',
                emoji: '🔢'
            },
            {
                label: t(lang, 'options.cooldown_label'),
                description: t(lang, 'options.cooldown_desc'),
                value: 'cooldown',
                emoji: '⏱️'
            },
            {
                label: t(lang, 'options.delete_delay_label'),
                description: t(lang, 'options.delete_delay_desc'),
                value: 'delete_delay',
                emoji: '🗑️'
            },
            {
                label: t(lang, 'options.toggle_system_label'),
                description: t(lang, 'options.toggle_system_desc'),
                value: 'toggle_system',
                emoji: '✅'
            }
        );

    const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(languageSelect);
    const row2 = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(joinChannelSelect);
    const row3 = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(categorySelect);
    const row4 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(optionsSelect);

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
            embeds: [embed],
            components: [row1, row2, row3, row4]
        });
    } else {
        await interaction.update({
            embeds: [embed],
            components: [row1, row2, row3, row4]
        });
    }
}

// Export for use in index.ts
export { updateSettingsPanel };

import { SlashCommandSubcommandBuilder, ChatInputCommandInteraction, ChannelType } from 'discord.js';
import { db, Logger } from '@repo/shared';
const logger = new Logger('ConfigCommand');

export const configSubcommand = {
    builder: (subcommand: SlashCommandSubcommandBuilder) =>
        subcommand
            .setName('config')
            .setDescription('Configure guild settings for temp voice')
            .addChannelOption(option =>
                option
                    .setName('join_channel')
                    .setDescription('The "Join to Create" voice channel')
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(false))
            .addChannelOption(option =>
                option
                    .setName('category')
                    .setDescription('Category where temp channels will be created')
                    .addChannelTypes(ChannelType.GuildCategory)
                    .setRequired(false))
            .addIntegerOption(option =>
                option
                    .setName('limit')
                    .setDescription('Max temp channels allowed (default 10)')
                    .setMinValue(1)
                    .setMaxValue(50)
                    .setRequired(false))
            .addIntegerOption(option =>
                option
                    .setName('cooldown')
                    .setDescription('User creation cooldown in seconds (default 30)')
                    .setMinValue(5)
                    .setMaxValue(300)
                    .setRequired(false)),

    execute: async (interaction: ChatInputCommandInteraction) => {
        // Admin check
        if (!interaction.memberPermissions?.has('Administrator')) {
            await interaction.reply({ content: 'You need Administrator permissions to use this command.', ephemeral: true });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const joinChannel = interaction.options.getChannel('join_channel');
        const category = interaction.options.getChannel('category');
        const limit = interaction.options.getInteger('limit');
        const cooldown = interaction.options.getInteger('cooldown');
        const guildId = interaction.guildId!;

        // Validation
        if (limit !== null && (limit < 1 || limit > 50)) {
            await interaction.editReply({ content: '❌ Max channels must be between 1-50.' });
            return;
        }
        if (cooldown !== null && (cooldown < 0 || cooldown > 3600)) {
            await interaction.editReply({ content: '❌ Cooldown must be between 0-3600 seconds (1 hour max).' });
            return;
        }

        try {
            const joinIds = joinChannel ? [joinChannel.id] : undefined;
            const catId = category ? category.id : undefined;

            await db.voiceGuildConfig.upsert({
                where: { guild_id: guildId },
                create: {
                    guild_id: guildId,
                    join_to_create_channel_ids: joinIds || [],
                    default_category_id: catId,
                    max_temp_channels: limit || 10,
                    user_cooldown_seconds: cooldown || 30
                },
                update: {
                    ...(joinIds && { join_to_create_channel_ids: joinIds }),
                    ...(catId && { default_category_id: catId }),
                    ...(limit && { max_temp_channels: limit }),
                    ...(cooldown && { user_cooldown_seconds: cooldown })
                }
            });

            await interaction.editReply({
                content: `Configuration updated!\n- Join Channel: ${joinChannel ? `<#${joinChannel.id}>` : 'Unchanged'}\n- Category: ${category ? `<#${category.id}>` : 'Unchanged'}\n- Max Channels: ${limit ?? 'Unchanged'}\n- Cooldown: ${cooldown ?? 'Unchanged'}s`
            });

        } catch (error) {
            logger.error('Config Error:', error);
            await interaction.editReply({ content: 'Failed to update configuration.' });
        }
    },
};

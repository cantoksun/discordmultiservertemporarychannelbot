import { SlashCommandSubcommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const panelSubcommand = {
    builder: (subcommand: SlashCommandSubcommandBuilder) =>
        subcommand
            .setName('panel')
            .setDescription('Show the voice channel control panel'),

    execute: async (interaction: ChatInputCommandInteraction) => {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = await import('discord.js');
        const channel = (interaction.member as any)?.voice?.channel;

        if (!channel) {
            await interaction.reply({ content: 'You must be in a voice channel to use the panel.', ephemeral: true });
            return;
        }

        // Owner check (optional for panel visibility, but buttons will check execution rights)
        // We can show panel to anyone, but actions will fail if not owner/admin.
        // Better to show "You are not the owner" in embed footer?

        const embed = new EmbedBuilder()
            .setTitle('Voice Channel Controls')
            .setDescription(`Managing: ${channel.name}`)
            .setColor(0x0099ff);

        const row1 = new ActionRowBuilder<any>()
            .addComponents(
                new ButtonBuilder().setCustomId('voice_lock').setLabel('Lock').setStyle(ButtonStyle.Secondary).setEmoji('🔒'),
                new ButtonBuilder().setCustomId('voice_unlock').setLabel('Unlock').setStyle(ButtonStyle.Success).setEmoji('🔓'),
                new ButtonBuilder().setCustomId('voice_limit').setLabel('Limit').setStyle(ButtonStyle.Primary).setEmoji('👥'),
                new ButtonBuilder().setCustomId('voice_kick').setLabel('Kick').setStyle(ButtonStyle.Danger).setEmoji('🚫'),
                new ButtonBuilder().setCustomId('voice_settings').setLabel('Settings').setStyle(ButtonStyle.Secondary).setEmoji('⚙️')
            );

        await interaction.reply({ embeds: [embed], components: [row1], ephemeral: true });
    },
};

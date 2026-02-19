import {
    GuildMember,
    ChannelType,
    PermissionFlagsBits,
    VoiceState,
    Guild,
    CategoryChannel,
    VoiceBasedChannel
} from 'discord.js';
import { db, VoiceGuildConfig, VoiceChannel as TmpVoiceChannel, Logger } from '@repo/shared';
import { getVoicePanelComponents } from '../utils/user-panel';
import { t } from '../utils/i18n';

const logger = new Logger('VoiceManager');

export class VoiceManager {
    private static creatingLocks = new Set<string>(); // composite key: guildId:userId

    // Concurrency Queue
    private static queue: { member: GuildMember, source: 'join' | 'command' }[] = [];
    private static isProcessing = false;
    private static CONCURRENCY_LIMIT = 2; // Process 2 channels at a time to be safe with Discord Rate Limits

    static async getConfig(guildId: string): Promise<VoiceGuildConfig | null> {
        return await db.voiceGuildConfig.findUnique({
            where: { guild_id: guildId }
        });
    }

    // Entry point: Adds to queue
    static async createTempChannel(member: GuildMember, source: 'join' | 'command'): Promise<void> {
        // Debounce check immediately to prevent spamming the queue
        const lockKey = `${member.guild.id}:${member.id}`;
        if (this.creatingLocks.has(lockKey)) return;

        // Lock immediately to prevent race conditions during queuing
        this.creatingLocks.add(lockKey);

        logger.info(`Queued channel creation for ${member.user.tag} (Queue size: ${this.queue.length})`);
        this.queue.push({ member, source });
        this.processQueue();
    }

    // Queue Processor
    private static async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            // Take a batch of items up to CONCURRENCY_LIMIT
            const batch = this.queue.splice(0, this.CONCURRENCY_LIMIT);

            await Promise.all(batch.map(async (item) => {
                try {
                    await this.executeChannelCreation(item.member, item.source);
                } catch (err) {
                    logger.error(`Failed to process creation for ${item.member.user.tag}`, err);
                }
            }));
        }

        this.isProcessing = false;
        logger.info('Queue processing finished.');
    }

    // Actual creation logic (moved from createTempChannel)
    private static async executeChannelCreation(member: GuildMember, source: 'join' | 'command'): Promise<void> {
        const guild = member.guild;
        const lockKey = `${guild.id}:${member.id}`;

        // Lock is already set in createTempChannel. 
        // We just proceed, but ensure we clear it in finally.

        try {
            // Permission Check
            const { PermissionFlagsBits } = await import('discord.js');
            const me = guild.members.me || await guild.members.fetchMe().catch(() => null);
            if (!me || !me.permissions.has(PermissionFlagsBits.ManageChannels)) {
                logger.warn(`Missing ManageChannels permission in guild ${guild.id}`);
                return;
            }

            const config = await this.getConfig(guild.id);
            if (!config || !config.enabled) return;

            // User Cooldown Check
            const cooldownSeconds = config.user_cooldown_seconds;
            if (cooldownSeconds > 0) {
                const cutoffTime = new Date(Date.now() - cooldownSeconds * 1000);
                const recentChannel = await db.voiceChannel.findFirst({
                    where: {
                        guild_id: guild.id,
                        owner_id: member.id,
                        created_at: { gte: cutoffTime }
                    },
                    orderBy: { created_at: 'desc' }
                });

                if (recentChannel) {
                    const remainingSeconds = Math.ceil((recentChannel.created_at.getTime() + cooldownSeconds * 1000 - Date.now()) / 1000);
                    logger.warn(`User ${member.user.tag} on cooldown. ${remainingSeconds}s remaining.`);
                    return;
                }
            }

            // Max Channel Limit Check
            const currentCount = await db.voiceChannel.count({
                where: { guild_id: guild.id }
            });
            if (currentCount >= config.max_temp_channels) {
                if (source === 'command') {
                    logger.warn(`Max channels reached for guild ${guild.id}`);
                }
                return;
            }

            // Determine category
            let categoryId = config.default_category_id;

            // If triggered by join, try to use parent category of trigger channel
            if (source === 'join' && member.voice.channel?.parentId) {
                // Optionally use the trigger channel's category if config allows or as fallback
                // But plan says "Default: use the join-to-create channel’s category"
                // So we should check if current channel IS the join channel.
                if (config.join_to_create_channel_ids.includes(member.voice.channel.id)) {
                    categoryId = member.voice.channel.parentId;
                }
            }

            if (!categoryId) {
                // Fallback to configured default
                categoryId = config.default_category_id;
            }

            // Name resolution
            let name = config.naming_pattern
                .replace(/{username}/g, member.user.username)
                .replace(/{displayname}/g, member.displayName)
                .replace(/{guild}/g, guild.name)
                .replace(/{count}/g, (currentCount + 1).toString());

            // Create channel
            const newChannel = await guild.channels.create({
                name: name,
                type: ChannelType.GuildVoice,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.Stream, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers],
                        // Giving ManageChannels allows editing name/limit directly in UI too!
                    },
                    {
                        id: guild.id,
                        allow: [PermissionFlagsBits.Connect], // Public by default
                    }
                ],
                reason: `Temp Voice for ${member.user.tag}`
            });

            // Move user
            if (member.voice.channel) {
                await member.voice.setChannel(newChannel);
            }

            // Send Control Panel to the channel
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = await import('discord.js');

            const lang = config.language || 'en';

            const embed = new EmbedBuilder()
                .setTitle(t(lang, 'embeds.title'))
                .setDescription(`${t(lang, 'embeds.description')}\n\n**${t(lang, 'embeds.owner')}:** ${member}`)
                .addFields(
                    { name: t(lang, 'embeds.status'), value: t(lang, 'embeds.unlocked'), inline: true },
                    { name: t(lang, 'embeds.limit'), value: t(lang, 'embeds.no_limit'), inline: true },
                    { name: t(lang, 'embeds.channel_name'), value: name, inline: true }
                )
                .setColor(0x00FF00)
                .setFooter({ text: t(lang, 'embeds.footer') });

            const components = getVoicePanelComponents(false, lang); // Default unlocked

            // Send panel to the voice channel (as a message that appears in chat)
            let controlMessageId: string | undefined;
            try {
                const msg = await newChannel.send({
                    embeds: [embed],
                    components: components as any
                });
                controlMessageId = msg.id;
            } catch (err) {
                logger.warn(`Could not send control panel to voice channel ${newChannel.id}:`, err);
            }
            // DB Insert
            await db.voiceChannel.create({
                data: {
                    guild_id: guild.id,
                    channel_id: newChannel.id,
                    owner_id: member.id,
                    name: name,
                    control_message_id: controlMessageId
                }
            });

            logger.info(`Created temp channel ${newChannel.id} for ${member.user.tag} in guild ${guild.id}`);

        } catch (err) {
            logger.error('Failed to create temp channel', err);
        } finally {
            this.creatingLocks.delete(lockKey);
        }
    }

    private static deleteTimers = new Map<string, NodeJS.Timeout>();

    static async handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
        const member = newState.member || oldState.member;
        if (!member) return;

        // Handle Join / Move / Switch
        // 1. Did they join a Join-to-Create trigger?
        if (newState.channelId && newState.channelId !== oldState.channelId) {
            const config = await this.getConfig(member.guild.id);

            logger.debug(`User ${member.user.tag} joined channel ${newState.channelId}`);
            logger.debug(`Config: enabled=${config?.enabled}, join_channels=${config?.join_to_create_channel_ids}`);

            if (config && config.enabled && config.join_to_create_channel_ids.includes(newState.channelId)) {
                logger.info(`Creating temp channel for ${member.user.tag}`);
                await this.createTempChannel(member, 'join');
            } else {
                // They joined a channel that is NOT a trigger. Check if it's a temp channel.
                // If so, cancel any pending delete.
                this.cancelDelete(newState.channelId);

                // Update last_active_at in DB
                await db.voiceChannel.update({
                    where: { channel_id: newState.channelId },
                    data: { last_active_at: new Date() }
                }).catch(() => { }); // Ignore if not a temp channel
            }
        }

        // 2. Did they LEAVE a channel (or switch out of one)?
        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            // Check if this was a temp channel
            const tempChannel = await db.voiceChannel.findUnique({
                where: { channel_id: oldState.channelId }
            });

            if (tempChannel) {
                // Check if empty
                const channel = oldState.channel || oldState.guild.channels.cache.get(oldState.channelId) as VoiceBasedChannel;
                if (channel && (channel.members as any).size === 0) {
                    // Schedule delete
                    this.scheduleDelete(oldState.guild.id, oldState.channelId);
                }
            }
        }
    }

    static async scheduleDelete(guildId: string, channelId: string, customDelayMs?: number) {
        // Get delay from config or default
        const config = await this.getConfig(guildId);
        const delay = customDelayMs ?? (config?.empty_delete_delay_seconds || 30) * 1000;

        if (this.deleteTimers.has(channelId)) return;

        logger.info(`Scheduling delete for ${channelId} in ${delay}ms`);

        const timer = setTimeout(async () => {
            try {
                // Check emptiness one last time?
                // In a distributed system we'd check DB or Discord again.
                // Here just delete.
                // Use the initialized client
                if (VoiceManager.client) {
                    const ch = VoiceManager.client.channels.cache.get(channelId) as VoiceBasedChannel;
                    if (ch) {
                        // Start of workaround for type checking on members.size
                        // VoiceBasedChannel members property is Collection<snowflake, GuildMember>
                        // But TS might be confused if types aren't perfect. Explicit cast helps.
                        const members = ch.members as any;
                        if (members.size > 0) return; // Race condition check
                        await ch.delete('Temp channel empty').catch(() => { });
                        logger.info(`Deleted channel ${channelId}`);
                    }
                }

                // DB Cleanup
                await db.voiceChannel.delete({
                    where: { channel_id: channelId }
                }).catch(() => { });
                this.deleteTimers.delete(channelId);

            } catch (err) {
                logger.error('Delete error', err);
            }
        }, delay);

        // Persist scheduled delete time to DB for restart recovery
        const deleteAt = new Date(Date.now() + delay);
        await db.voiceChannel.update({
            where: { channel_id: channelId },
            data: { delete_scheduled_at: deleteAt }
        }).catch(() => { });
    }

    static cancelDelete(channelId: string) {
        if (this.deleteTimers.has(channelId)) {
            clearTimeout(this.deleteTimers.get(channelId)!);
            this.deleteTimers.delete(channelId);
            // Clear DB schedule
            db.voiceChannel.update({
                where: { channel_id: channelId },
                data: { delete_scheduled_at: null }
            }).catch(err => logger.error('Error cancelling delete', err));
            logger.debug(`Cancelled delete for ${channelId}`);
        }
    }

    static client: any; // Hacky but effective for this scale
    static init(client: any) {
        this.client = client;
        this.restoreState();
        this.startOrphanCleanup();
    }

    static async restoreState() {
        logger.info('Restoring Voice State...');
        const channels = await db.voiceChannel.findMany();

        let restoredCount = 0;
        let cleanedCount = 0;

        for (const row of channels) {
            try {
                const channel = this.client.channels.cache.get(row.channel_id) as VoiceBasedChannel;

                // Orphan Check: Channel in DB but not in Discord
                if (!channel) {
                    logger.warn(`Orphan detected: ${row.channel_id}. Cleaning up.`);
                    await db.voiceChannel.delete({
                        where: { id: row.id }
                    }).catch(() => { });
                    cleanedCount++;
                    continue;
                }

                restoredCount++;

                // Check if channel is empty
                const memberCount = (channel.members as any).size;

                if (memberCount === 0) {
                    // Channel is empty on boot. 
                    // Strategy: 
                    // 1. If it has a scheduled delete time that PASSED, delete immediately.
                    // 2. If it has a future scheduled time, respect it.
                    // 3. If it has NO scheduled time (maybe crashed before scheduling), schedule it NOW (short delay).

                    if (row.delete_scheduled_at) {
                        const scheduledTime = new Date(row.delete_scheduled_at).getTime();
                        const now = Date.now();

                        if (scheduledTime <= now) {
                            // Overdue
                            logger.info(`Deleting overdue channel ${row.channel_id}`);
                            await channel.delete('Scheduled deletion overdue (Restore)').catch(() => { });
                            await db.voiceChannel.delete({ where: { id: row.id } }).catch(() => { });
                            cleanedCount++;
                        } else {
                            // Reschedule
                            const remainingMs = scheduledTime - now;
                            logger.info(`Rescheduling delete for ${row.channel_id} in ${Math.round(remainingMs / 1000)}s`);
                            this.scheduleDelete(row.guild_id, row.channel_id, remainingMs); // Use custom delay
                        }
                    } else {
                        // Empty but no schedule? Schedule for immediate cleanup (e.g. 5s) to allow re-connection grace period?
                        // Or just standard delete delay?
                        // Let's use standard delete delay to be safe.
                        logger.info(`Found empty unscheduled channel ${row.channel_id}. Scheduling delete.`);
                        this.scheduleDelete(row.guild_id, row.channel_id);
                    }
                } else {
                    // Channel has members. Ensure we DON'T have a delete timer (shouldn't happen if logic is sound, but good to be safe)
                    // If we had a persisted delete time but members are there, we should clear it.
                    if (row.delete_scheduled_at) {
                        logger.info(`Channel ${row.channel_id} has members but was scheduled for delete. Cancelling.`);
                        this.cancelDelete(row.channel_id);
                    }
                }
            } catch (err) {
                logger.error(`Error restoring channel ${row.channel_id}:`, err);
            }
        }

        logger.info(`State restored: ${restoredCount} active, ${cleanedCount} cleaned`);
    }

    // Periodic orphan cleanup (runs every 5 minutes)
    static startOrphanCleanup() {
        setInterval(async () => {
            try {
                const channels = await db.voiceChannel.findMany();
                let cleaned = 0;

                for (const row of channels) {
                    const channel = this.client.channels.cache.get(row.channel_id);
                    if (!channel) {
                        await db.voiceChannel.delete({
                            where: { id: row.id }
                        }).catch(() => { });
                        cleaned++;
                    }
                }

                if (cleaned > 0) {
                    logger.info(`Orphan cleanup: removed ${cleaned} channels`);
                }
            } catch (err) {
                logger.error('Orphan cleanup error:', err);
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
}

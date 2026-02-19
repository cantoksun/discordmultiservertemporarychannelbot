import { Events, VoiceState } from 'discord.js';
import { VoiceManager } from '../services/voice-manager';

export const name = Events.VoiceStateUpdate;

export const execute = async (oldState: VoiceState, newState: VoiceState) => {
    await VoiceManager.handleVoiceStateUpdate(oldState, newState);
};

import { EmbedBuilder, EmbedData } from 'discord.js';

export interface Page {
    content?: string;
    embeds?: (EmbedBuilder|EmbedData)[];
}
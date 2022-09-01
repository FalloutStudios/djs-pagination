import { APIEmbed, CommandInteraction, EmbedBuilder, MessageComponentInteraction, MessageOptions, ModalSubmitInteraction, StickerResolvable } from 'discord.js';

export type PageResolvable = Page|EmbedBuilder|string;

export interface Page {
    tss?: boolean;
    content?: string;
    embeds?: (EmbedBuilder|APIEmbed)[];
    allowedMentions?: MessageOptions["allowedMentions"];
    attachments?: MessageOptions["attachments"];
    files?: MessageOptions["files"];
    stickers?: StickerResolvable[];
    /**
     * Applicable for interaction based pagination
     */
    ephemeral?: boolean;
    components?: MessageOptions["components"];
}

export enum OnDisableAction {
    /**
     * Do nothing but will disable interacting with the pagination. 
     */
    None,
    /**
     * Delete the pagination message
     */
    DeleteMessage,
    /**
     * Delete the pagination components
     */
    DeleteComponents,
    /**
     * Disable the pagination components
     */
    DisableComponents
}

export enum SendAs {
    /**
     * Send the pagination as new message of the same channel as the parent message
     */
    NewMessage,
    /**
     * Edis the parent message with the pagination
     */
    EditMessage,
    /**
     * Replies to the parent message with the pagination
     */
    ReplyMessage
}

export type RepliableInteraction = CommandInteraction|MessageComponentInteraction|ModalSubmitInteraction;
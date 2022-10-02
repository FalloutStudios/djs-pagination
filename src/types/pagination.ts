import { APIEmbed, EmbedBuilder, MessageCreateOptions, MessageEditOptions, StickerResolvable } from 'discord.js';

export type PageResolvable = Page|EmbedBuilder|string;

export interface Page extends Pick<MessageCreateOptions, "allowedMentions" | "components" | "content" | "embeds" | "files" | "nonce" | "stickers">, Pick<MessageEditOptions, "attachments">{
    /**
     * Applicable for interaction based pagination
     */
    ephemeral?: boolean;
}

export enum PaginationControllerType {
    /**
     * First page controller
     */
    FirstPage,
    /**
     * Previous page controller
     */
    PreviousPage,
    /**
     * Next page controller
     */
    StopInteraction,
    /**
     * Next page controller
     */
    NextPage,
    /**
     * Last page controller
     */
    LastPage,
    /**
     * Custom
     */
    Custom
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
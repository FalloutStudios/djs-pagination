import { EmbedBuilder, EmbedData } from 'discord.js';

export interface Page {
    content?: string;
    embeds?: (EmbedBuilder|EmbedData)[];
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
import { Embed, EmbedBuilder, MessageCreateOptions } from 'discord.js';

export type PageResolvable = StaticPageResolvable|DynamicPageFunction;
export type StaticPageResolvable = string|PageData|EmbedBuilder|Embed;
export type DynamicPageFunction = (() => StaticPageResolvable);

export interface PageData extends Pick<MessageCreateOptions, 'allowedMentions' | 'components' | 'content' | 'embeds' | 'files' | 'nonce' | 'stickers'> {
    /**
     * Usable for interaction based paginations to send page privately
     */
    ephemeral?: boolean;
}

export function resolvePage(page: PageResolvable): PageData {
    if (page instanceof Embed || page instanceof EmbedBuilder) {
        return { embeds: [page] };
    } else if (typeof page === 'string') {
        return { content: page };
    } else if (typeof page === 'object' && !Array.isArray(page)){
        return page;
    } else if (typeof page === 'function') {
        return resolvePage(page());
    }

    throw new Error('Unresolvable pagination page');
}
import { Page, PageResolvable, RepliableInteraction } from '../../types/pagination';

import { Awaitable, EmbedBuilder, InteractionCollector, MappedInteractionTypes, Message, MessageComponentInteraction, MessageComponentType, normalizeArray, RestOrArray } from 'discord.js';
import EventEmitter from 'events';

export interface PaginationBaseOptions {
    pages?: PageResolvable[];
}

export interface PaginationBaseEvents {
    "ready": [];
    "pageChange": [page: Page, index: number];
    "collectorCollect": [interaction: MessageComponentInteraction];
    "collectorEnd": [reason: string];
}

export interface PaginationBase extends EventEmitter {
    on<E extends keyof PaginationBaseEvents>(event: E, listener: (...args: PaginationBaseEvents[E]) => Awaitable<void>): this;
    on<E extends string|symbol>(event: Exclude<E, keyof PaginationBaseEvents>, listener: (...args: any) => Awaitable<void>): this;

    once<E extends keyof PaginationBaseEvents>(event: E, listener: (...args: PaginationBaseEvents[E]) => Awaitable<void>): this;
    once<E extends string|symbol>(event: Exclude<E, keyof PaginationBaseEvents>, listener: (...args: any) => Awaitable<void>): this;


    emit<E extends keyof PaginationBaseEvents>(event: E, ...args: PaginationBaseEvents[E]): boolean;
    emit<E extends string|symbol>(event: Exclude<E, keyof PaginationBaseEvents>, ...args: any): boolean;

    off<E extends keyof PaginationBaseEvents>(event: E, listener: (...args: PaginationBaseEvents[E]) => Awaitable<void>): this;
    off<E extends string|symbol>(event: Exclude<E, keyof PaginationBaseEvents>, listener: (...args: any) => Awaitable<void>): this;

    removeAllListeners<E extends keyof PaginationBaseEvents>(event?: E): this;
    removeAllListeners(event?: string|symbol): this;
}

export class PaginationBase extends EventEmitter {
    public pages: Page[] = [];
    public currentPage: number = 0;
    public pagination?: Message;
    public command?: Message|RepliableInteraction;
    public collector?: InteractionCollector<MappedInteractionTypes[MessageComponentType]>;

    constructor(options?: PaginationBaseOptions) {
        super();

        this.pages = options?.pages ? this._parsePages(...options.pages) : [];
    }

    /**
     * Get page data 
     */
    public getPage(pageIndex: number): Page|undefined {
        return this.pages[pageIndex];
    }

    /**
     * Add pages to pagination 
     */
    public addPages(...pages: RestOrArray<PageResolvable>) {
        if (!pages.length) return this;
        this.pages.push(...this._parsePages(normalizeArray(pages)));

        return this;
    }

    /**
     * Clear existing pages and add new pages to pagination 
     */
    public setPages(...pages: RestOrArray<PageResolvable>) {
        this.pages = [];
        this.addPages(...pages);
        
        return this;
    }

    /**
     * 
     */
    protected _parsePages(...pages: RestOrArray<PageResolvable>) {
        const newPages = [];

        for (const page of normalizeArray(pages)) {
            if (typeof page === 'string') {
                newPages.push({ content: page });
            } else if (page instanceof EmbedBuilder) {
                newPages.push({ embeds: [page] });
            } else if (typeof page === 'object' && !Array.isArray(page)) {
                newPages.push(page);
            } else {
                throw new TypeError('Invalid page given');
            }
        }

        return newPages;
    }
}
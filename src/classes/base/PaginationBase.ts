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
    protected _pages: Page[] = [];
    protected _currentPage: number = 0;
    protected _pagination?: Message;
    protected _command?: Message|RepliableInteraction;

    get pages() { return this._pages; }
    get currentPage() { return this._currentPage; }
    get pagination() { return this._pagination; }
    get command() { return this._command; }

    set pages(pages: PageResolvable[]) { this._pages = this._parsePages(pages); }

    constructor(options?: PaginationBaseOptions) {
        super();

        this._pages = options?.pages ? this._parsePages(...options.pages) : [];
    }

    /**
     * Get page data 
     */
    public getPage(pageIndex: number): Page|undefined {
        return this._pages[pageIndex];
    }

    /**
     * Add pages to pagination 
     */
    public addPages(...pages: RestOrArray<PageResolvable>): this {
        if (!pages.length) return this;
        this._pages.push(...this._parsePages(normalizeArray(pages)));

        return this;
    }

    /**
     * 
     */
    protected _parsePages(...pages: RestOrArray<PageResolvable>): Page[] {
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
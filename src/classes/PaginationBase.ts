import { Awaitable, CollectedInteraction, CommandInteraction, EmbedBuilder, If, Interaction, InteractionCollector, Message, MessageCollector, MessageComponentCollectorOptions, MessageComponentInteraction, MessageComponentType, ModalSubmitInteraction } from 'discord.js';
import EventEmitter from 'events';
import { Page } from '../types/pagination';

export interface PaginationBaseOptions {
    pages?: Page[];
}

export interface PaginationBaseEvents {
    "pageChange": [page: Page, index: number];
    "collectorCollect": [interaction: MessageComponentInteraction];
    "collectorEnd": [reason: string];
}

export interface PaginationBase<Paginated extends boolean = boolean, ComponentType extends CollectedInteraction = CollectedInteraction> extends EventEmitter {
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

export class PaginationBase<Paginated extends boolean = boolean, ComponentType extends CollectedInteraction = CollectedInteraction> extends EventEmitter {
    public pages: Page[] = [];
    public currentPage: number = 0;
    public pagination!: Paginated extends true ? Message : undefined;
    public command!: Paginated extends true ? Message|Interaction : undefined;
    public collector?: InteractionCollector<ComponentType>;

    constructor(options?: PaginationBaseOptions) {
        super();

        this.pages = options?.pages ?? [];
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
    public addPages(...pages: (Page|EmbedBuilder|string)[]) {
        if (!pages.length) return this;
        
        for (const page of pages) {
            if (typeof page === 'string') {
                this.pages.push({ content: page });
            } else if (page instanceof EmbedBuilder) {
                this.pages.push({ embeds: [page] });
            } else if (typeof page === 'object' && !Array.isArray(page)) {
                this.pages.push(page);
            } else {
                throw new TypeError('Invalid page given');
            }
        }

        return this;
    }

    /**
     * Clear existing pages and add new pages to pagination 
     */
    public setPages(...pages: (Page|EmbedBuilder|string)[]) {
        this.pages = [];
        this.addPages(...pages);
        
        return this;
    }

    /**
     * Is the pagination started
     */
    public isPaginated(): this is PaginationBase<true, ComponentType>;
    public isPaginated(): boolean {
        return !!this.pagination && !!this.command;
    }
}
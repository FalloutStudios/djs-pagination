import { Page, PageResolvable, RepliableInteraction, SendAs } from '../../types/pagination';

import { Awaitable, CommandInteraction, EmbedBuilder, InteractionCollector, MappedInteractionTypes, Message, MessageComponentInteraction, MessageComponentType, normalizeArray, RestOrArray, User } from 'discord.js';
import EventEmitter from 'events';

export interface PaginationBaseOptions {
    pages?: PageResolvable[];
}

export interface PaginationBaseEvents<Collected extends any> {
    "ready": [];
    "pageChange": [page: Page, index: number];
    "collectorCollect": [collected: Collected];
    "collectorEnd": [reason: string];
}

export interface PaginationBase<Collected> extends EventEmitter {
    on<E extends keyof PaginationBaseEvents<Collected>>(event: E, listener: (...args: PaginationBaseEvents<Collected>[E]) => Awaitable<void>): this;
    on<E extends string|symbol>(event: Exclude<E, keyof PaginationBaseEvents<Collected>>, listener: (...args: any) => Awaitable<void>): this;

    once<E extends keyof PaginationBaseEvents<Collected>>(event: E, listener: (...args: PaginationBaseEvents<Collected>[E]) => Awaitable<void>): this;
    once<E extends string|symbol>(event: Exclude<E, keyof PaginationBaseEvents<Collected>>, listener: (...args: any) => Awaitable<void>): this;


    emit<E extends keyof PaginationBaseEvents<Collected>>(event: E, ...args: PaginationBaseEvents<Collected>[E]): boolean;
    emit<E extends string|symbol>(event: Exclude<E, keyof PaginationBaseEvents<Collected>>, ...args: any): boolean;

    off<E extends keyof PaginationBaseEvents<Collected>>(event: E, listener: (...args: PaginationBaseEvents<Collected>[E]) => Awaitable<void>): this;
    off<E extends string|symbol>(event: Exclude<E, keyof PaginationBaseEvents<Collected>>, listener: (...args: any) => Awaitable<void>): this;

    removeAllListeners<E extends keyof PaginationBaseEvents<Collected>>(event?: E): this;
    removeAllListeners(event?: string|symbol): this;
}

export class PaginationBase<Collected> extends EventEmitter {
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
    public getPage(pageIndex: number): Page {
        if (!this._pages.some((p, i) => i === pageIndex)) throw new Error(`Can\'t find page with index ${pageIndex}`);
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
     * Sets current page 
     */
     public async setCurrentPage(index?: number): Promise<Page> {
        index = index ?? this._currentPage;

        if (!this._command || !this._pagination) throw new Error('Pagination is not yet ready');
        if (index < 0 || index > this._pages.length) throw new TypeError('index is out of range');

        const page = this.getPage(index);

        if (((this._command as CommandInteraction)?.ephemeral || (this._command as CommandInteraction)?.deferred) && this._pagination.interaction) {
            (this._command as CommandInteraction).editReply(page).catch(() => {});
        } else if (!(this._command as CommandInteraction)?.deferred) {
            this._pagination.edit(page).catch(() => {});
        } else {
            throw new Error('Can\'t identify command type.');
        }
            
        this._currentPage = index;
        return page;
    }

    protected async _sendPage(page: Page, sendAs: SendAs): Promise<void> {
        if (!this._command || !this._pagination) throw new TypeError("Pagination is not yet ready");

        switch (sendAs) {
            case SendAs.EditMessage:
                if (this._command instanceof Message) {
                    if (!this._command.editable) throw new Error("Can't edit message command");
                    this._pagination = await this._command.edit(page);
                } else {
                    if (!this._command.replied && !this._command.deferred) throw new Error("Command interaction is not replied or deffered");
                    this._pagination = await this._command.editReply(page);
                }
                break;
            case SendAs.NewMessage:
                const channel = this._command.channel;
                if (!channel) throw new Error("Command channel is not defined");
                this._pagination = await channel.send(page);
                break;
            case SendAs.ReplyMessage:
                if (this._command instanceof Message) {
                    this._pagination = await this._command.reply(page);
                } else {
                    if (this._command.replied || this._command.deferred) throw new Error("Command interaction is already replied or deffered");
                    await this._command.reply(page);
                    this._pagination = await this._command.fetchReply();
                }
        }
    }

    /**
     * Parse page resolvable
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

    /**
     * Get command author
     */
    protected _getAuthor(command: RepliableInteraction|Message): User {
        if (command instanceof Message) return command.author;
        return command.user;
    }
}
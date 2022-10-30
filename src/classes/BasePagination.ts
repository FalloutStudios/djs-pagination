import { If, Message, normalizeArray, RepliableInteraction, RestOrArray, User } from 'discord.js';
import EventEmitter from 'events';
import { DynamicPageFunction, PageData, PageResolvable, resolvePage } from '../types/enums';
import { SendAs } from '../types/send';

export interface BasePaginationData {
    pages: PageResolvable;
    currentPageIndex?: number;
}

export interface BasePaginationEvents<Collected> {
    'ready': [];
    'pageChange': [page: PageData, index: number];
    'collect': [collected: Collected];
    'end': [reason: string];
}

export class BasePagination<Collected, Sent extends boolean = boolean> extends EventEmitter {
    protected _pages: (PageData|DynamicPageFunction)[] = [];
    protected _currentPageIndex: number = 0;
    protected _pagination: Message|RepliableInteraction|null = null;
    protected _command: Message|RepliableInteraction|null = null;
    protected _authorId: string|null = null;

    get pages() { return this._pages; }
    get currentPageIndex() { return this._currentPageIndex; }
    get currentPage() { return this.getPage(this.currentPageIndex); }
    get pagination() { return this._pagination as If<Sent, Message|RepliableInteraction>; }
    get command() { return this._command as If<Sent, Message|RepliableInteraction>; }

    get authorId(): string|null {
        if (this._authorId) return this._authorId;

        return (this.command instanceof Message ? this.command.author.id : this.command?.user?.id) || null;
    }

    constructor(options?: BasePaginationData) {
        super();

        this.setPages(...(options?.pages ?? []));

        this._currentPageIndex = options?.currentPageIndex ?? this.currentPageIndex;
    }

    /**
     * Add pages to pagination
     * @param pages array of page data to add
     */
    public addPages(...pages: RestOrArray<PageResolvable>): this {
        this._pages.push(...BasePagination.resolvePages(normalizeArray(pages)));
        return this;
    }

    /**
     * Clear and set pagination pages
     * @param pages array of page data
     */
    public setPages(...pages: RestOrArray<PageResolvable>): this {
        this._pages = BasePagination.resolvePages(normalizeArray(pages));
        return this;
    }

    /**
     * Get page data by index
     * @param pageIndex page index
     */
    public getPage(pageIndex: number): PageData|undefined {
        const page = this.pages.find((p, i) => i === pageIndex);
        return typeof page === 'function' ? resolvePage(page()) : page;
    }

    /**
     * Check if pagination is sent
     */
    public isSent(): this is BasePagination<Collected, true> {
        return this.command !== null && this.pagination !== null;
    }

    /**
     * Set current pagination page by index
     * @param pageIndex page index
     */
    public async setCurrentPage(pageIndex?: number): Promise<PageData> {
        const page = pageIndex ? this.getPage(pageIndex) : this.currentPage;
        if (!page) throw new RangeError(`Cannot find page index '${pageIndex}'`);

        this._currentPageIndex = pageIndex ?? this.currentPageIndex;

        if (this.isSent()) {
            if (!(this.pagination instanceof Message)) {
                await this.pagination.editReply(page);
            } else {
                await this.pagination.edit(page);
            }
        }

        return page;
    }

    /**
     * Send the pagination message
     * @param page Pagination page
     * @param sendAs Send type
     */
    protected async _sendPage(page: PageData, sendAs: SendAs): Promise<void> {
        if (!this.command) throw new Error(`Pagination command trigger is undefined`);


        switch (sendAs) {
            case SendAs.NewMessage:
                if (!this.command.channel) throw new Error(`Pagination command trigger channel id is null`);
                this._pagination = await this.command.channel.send(page);

                return;
            case SendAs.EditMessage:
                if (this.command instanceof Message) {
                    if (!this.command.editable) throw new Error("Can't edit message command");

                    this._pagination = await this.command.edit(page);
                    return;
                } else {
                    if (!this.command.replied && !this.command.deferred) throw new Error("Interaction is not replied or deferred");

                    this._pagination = await this.command.editReply(page);
                    return;
                }
            case SendAs.ReplyMessage:
                if (this.command instanceof Message) {
                    this._pagination = await this.command.reply(page);
                    return;
                } else {
                    if (this.command.replied || this.command.deferred) throw new Error("Interaction is already replied or deferred");

                    await this.command.reply(page);

                    this._pagination = await this.command.fetchReply();
                    return;
                }
        }
    }

    /**
     * Resolve pagination pages except for dynamic page functions
     * @param pages resolvable pages
     */
    public static resolveStaticPages(...pages: RestOrArray<PageResolvable>): (PageData|DynamicPageFunction)[] {
        return normalizeArray(pages).map(p => typeof p === 'function' ? p : resolvePage(p));
    }

    /**
     * Resolve pagination pages
     * @param pages resolvable pages
     */
    public static resolvePages(...pages: RestOrArray<PageResolvable>): PageData[] {
        return normalizeArray(pages).map(p => resolvePage(p));
    }
}
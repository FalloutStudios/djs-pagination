import { APIUser, ButtonBuilder, CollectedMessageInteraction, MessageComponentCollectorOptions, User } from 'discord.js';
import ms from 'ms';
import { OnDisableAction, Page, PageWithComponents } from '../types/pagination';
import { PaginationBase, PaginationBaseOptions } from './PaginationBase';
import { ButtonType, PaginationButtonBuilder } from './PaginationButtonBuilder';

export interface ButtonPaginationOptions extends PaginationBaseOptions {
    buttons?: PaginationButtonBuilder;
    onDisable?: OnDisableAction;
    authorIndependent?: boolean;
    singlePageNoButtons?: boolean;
    authorId?: string;
    collectorOptions?: MessageComponentCollectorOptions<CollectedMessageInteraction>;
}

export class ButtonPagination<Paginated extends boolean = boolean> extends PaginationBase<Paginated> {
    public buttons: PaginationButtonBuilder = new PaginationButtonBuilder();
    public onDisable: OnDisableAction = OnDisableAction.DisableComponents;
    public authorIndependent: boolean = true;
    public singlePageNoButtons: boolean = true;
    public timer: number = 20000;
    public authorId?: string;
    public collectorOptions?: MessageComponentCollectorOptions<CollectedMessageInteraction>;

    constructor(options?: ButtonPaginationOptions) {
        super(options);

        this.buttons = options?.buttons ?? this.buttons;
        this.onDisable = options?.onDisable ?? this.onDisable;
        this.authorIndependent = options?.authorIndependent ?? this.authorIndependent;
        this.singlePageNoButtons = options?.singlePageNoButtons ?? this.singlePageNoButtons;
        this.authorId = options?.authorId ?? this.authorId;
        this.collectorOptions = options?.collectorOptions ?? this.collectorOptions;
    }

    /**
     *  Sets disable interaction interval in milliseconds
     */
    public setTimer(timer: number): ButtonPagination<Paginated>;
    /**
     * Sets disable interaction interval, eg:
     * - 10s
     * - 20m
     */
    public setTimer(timer: string): ButtonPagination<Paginated>;
    public setTimer(timer: number|string): ButtonPagination<Paginated> {
        if (typeof timer == 'string') {
            this.timer = ms(timer);
            if (this.timer == undefined) throw new TypeError('Invalid timer');
        } else if (!isNaN(Number(timer))) {
            this.timer = timer;
        } else {
            throw new TypeError('Invalid ttimer');
        }
        
        return this;
    }

    /**
     * Set if the pagination should only work for pagination author 
     */
    public setAuthorIndependent(authorIndependent: boolean): ButtonPagination<Paginated> {
        this.authorIndependent = authorIndependent;
        return this;
    }

    /**
     * Set what action would happen on pagination timeout 
     */
    public setOnDisableAction(action: OnDisableAction): ButtonPagination<Paginated> {
        this.onDisable = action;
        return this;
    }

    /**
     * Set if pagination should disable buttons if there's only single page 
     */
    public setSinglePageNoButtons(singlePageNoButtons: boolean): ButtonPagination<Paginated> {
        this.singlePageNoButtons = singlePageNoButtons;
        return this;
    }

    /**
     * Sets the pagination author Id 
     */
    public setAuthorId(authorId: string|User|APIUser): ButtonPagination<Paginated> {
        if (typeof authorId == 'string') {
            this.authorId = authorId;
        } else {
            this.authorId = authorId.id;
        }

        return this;
    } 

    /**
     * Add button to pagination 
     */
    public addButton(button: ButtonBuilder, type: ButtonType): ButtonPagination<Paginated> {
        this.buttons.addButton(button, type);
        return this;
    }

    /**
     * Sets current page 
     */
    public async setCurrentPage(index?: number): Promise<Page> {
        index = index ?? this.currentPage;

        if (!this.isPaginated()) throw new Error('Pagination is not yet ready');
        if (index < 0 || index > this.pages.length) throw new TypeError('index is out of range');

        const page = this.getPage(index) as Page;
        this.pagination.edit(page);
        this.currentPage = index;

        return page;
    }
    
    public getPage(index: number, disableButton?: boolean): PageWithComponents {
        const page: PageWithComponents|undefined = super.getPage(index);
        if (!page) throw new Error(`Can\'t find page with index ${index}`);

        page.components = [this.buttons.getActionRow(disableButton)];

        return page;
    }

    public isPaginated(): this is ButtonPagination<true>;
    public isPaginated(): boolean {
        return super.isPaginated();
    }

    /**
     * Returns pagination options as JSON object 
     */
    public makeOptions(includePages: boolean = true): ButtonPaginationOptions {
        const options: ButtonPaginationOptions = {
            pages: includePages ? this.pages : [],
            authorId: this.authorId,
            authorIndependent: this.authorIndependent,
            buttons: this.buttons,
            collectorOptions: this.collectorOptions,
            onDisable: this.onDisable,
            singlePageNoButtons: this.singlePageNoButtons
        };

        return options;
    }
}
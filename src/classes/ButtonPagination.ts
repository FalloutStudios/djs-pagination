import { OnDisableAction, Page, PageWithComponents, RepliableInteraction, SendAs } from '../types/pagination';
import { ComponentButtonBuilder, PaginationButtonType } from './ComponentButtonBuilder';
import { PaginationBase, PaginationBaseEvents, PaginationBaseOptions } from './PaginationBase';

import { APIUser, Awaitable, ButtonBuilder, Interaction, InteractionType, Message, MessageCollectorOptionsParams, MessageComponentInteraction, MessageComponentType, User } from 'discord.js';
import ms from 'ms';

export interface ButtonPaginationOptions extends PaginationBaseOptions {
    buttons?: ComponentButtonBuilder;
    onDisable?: OnDisableAction;
    authorIndependent?: boolean;
    singlePageNoButtons?: boolean;
    timer?: number;
    authorId?: string;
    collectorOptions?: MessageCollectorOptionsParams<MessageComponentType>;
}

export interface ButtonPaginationEvents extends PaginationBaseEvents {
    "componentInteraction": [componentType: PaginationButtonType, component: MessageComponentInteraction];
}

export interface ButtonPagination extends PaginationBase {
    on<E extends keyof ButtonPaginationEvents>(event: E, listener: (...args: ButtonPaginationEvents[E]) => Awaitable<void>): this;
    on<E extends string|symbol>(event: Exclude<E, keyof ButtonPaginationEvents>, listener: (...args: any) => Awaitable<void>): this;

    once<E extends keyof ButtonPaginationEvents>(event: E, listener: (...args: ButtonPaginationEvents[E]) => Awaitable<void>): this;
    once<E extends string|symbol>(event: Exclude<E, keyof ButtonPaginationEvents>, listener: (...args: any) => Awaitable<void>): this;


    emit<E extends keyof ButtonPaginationEvents>(event: E, ...args: ButtonPaginationEvents[E]): boolean;
    emit<E extends string|symbol>(event: Exclude<E, keyof ButtonPaginationEvents>, ...args: any): boolean;

    off<E extends keyof ButtonPaginationEvents>(event: E, listener: (...args: ButtonPaginationEvents[E]) => Awaitable<void>): this;
    off<E extends string|symbol>(event: Exclude<E, keyof ButtonPaginationEvents>, listener: (...args: any) => Awaitable<void>): this;

    removeAllListeners<E extends keyof ButtonPaginationEvents>(event?: E): this;
    removeAllListeners(event?: string|symbol): this;
}

export class ButtonPagination extends PaginationBase {
    public buttons: ComponentButtonBuilder = new ComponentButtonBuilder();
    public onDisable: OnDisableAction = OnDisableAction.DisableComponents;
    public authorIndependent: boolean = true;
    public singlePageNoButtons: boolean = true;
    public timer: number = 20000;
    public authorId?: string;
    public collectorOptions?: MessageCollectorOptionsParams<MessageComponentType>;

    constructor(options?: ButtonPaginationOptions) {
        super(options);

        this.buttons = options?.buttons ?? this.buttons;
        this.onDisable = options?.onDisable ?? this.onDisable;
        this.authorIndependent = options?.authorIndependent ?? this.authorIndependent;
        this.singlePageNoButtons = options?.singlePageNoButtons ?? this.singlePageNoButtons;
        this.timer = options?.timer ?? this.timer;
        this.authorId = options?.authorId ?? this.authorId;
        this.collectorOptions = options?.collectorOptions ?? this.collectorOptions;
    }

    /**
     *  Sets disable interaction interval in milliseconds
     */
    public setTimer(timer: number): ButtonPagination;
    /**
     * Sets disable interaction interval, eg:
     * - 10s
     * - 20m
     */
    public setTimer(timer: string): ButtonPagination;
    public setTimer(timer: number|string): ButtonPagination {
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
    public setAuthorIndependent(authorIndependent: boolean): ButtonPagination {
        this.authorIndependent = authorIndependent;
        return this;
    }

    /**
     * Set what action would happen on pagination timeout 
     */
    public setOnDisableAction(action: OnDisableAction): ButtonPagination {
        this.onDisable = action;
        return this;
    }

    /**
     * Set if pagination should disable buttons if there's only single page 
     */
    public setSinglePageNoButtons(singlePageNoButtons: boolean): ButtonPagination {
        this.singlePageNoButtons = singlePageNoButtons;
        return this;
    }

    /**
     * Sets the pagination author Id 
     */
    public setAuthorId(authorId: string|User|APIUser): ButtonPagination {
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
    public addButton(button: ButtonBuilder, type: PaginationButtonType): ButtonPagination {
        this.buttons.addButton(button, type);
        return this;
    }

    /**
     * Start the pagination
     */
    public async paginate(command: Message|Interaction, sendAs: SendAs = SendAs.ReplyMessage): Promise<ButtonPagination> {
        if (!command) throw new TypeError("Command is invalid");
        if (this.command || this.pagination) throw new TypeError("Pagination is already started");
        if (!(command instanceof Message) && command.type !== InteractionType.ModalSubmit && command.type !== InteractionType.MessageComponent && command.type !== InteractionType.ApplicationCommand) throw new TypeError("Interaction is not repliable");
        
        this.command = command;
        this.authorId = this.authorId ?? this._getAuthor(command).id;
        
        const page = this.getPage(0);
        if (this.pages.length == 1 && this.singlePageNoButtons) page.components = [];

        switch (sendAs) {
            case SendAs.EditMessage:
                if (command instanceof Message) {
                    if (!command.editable) throw new Error("Can't edit message command");
                    this.pagination = await command.edit(page);
                } else {
                    if (!command.replied || !command.deferred) throw new Error("Command interaction is not replied or deffered");
                    this.pagination = await command.editReply(page);
                }
                break;
            case SendAs.NewMessage:
                const channel = command.channel;
                if (!channel) throw new Error("Command channel is not defined");
                this.pagination = await channel.send(page);
                break;
            case SendAs.ReplyMessage:
                if (command instanceof Message) {
                    this.pagination = await command.reply(page);
                } else {
                    if (command.replied || command.deferred) throw new Error("Command interaction is already replied or deffered");
                    await command.reply(page);
                    this.pagination = await command.fetchReply();
                }
        }

        this.emit('ready');
        if (this.pages.length > 1 || this.pages.length == 1 && !this.singlePageNoButtons) this._addCollector();

        return this as ButtonPagination;
    }

    /**
     * Sets current page 
     */
    public async setCurrentPage(index?: number, componentsOptions?: { removeComponents?: boolean; disableComponents?: boolean; }): Promise<Page> {
        index = index ?? this.currentPage;

        if (!this.command || !this.pagination) throw new Error('Pagination is not yet ready');
        if (index < 0 || index > this.pages.length) throw new TypeError('index is out of range');

        const page = this.getPage(index, componentsOptions?.disableComponents);
        if (componentsOptions?.removeComponents) page.components = [];

        this.pagination.edit(page);
        this.currentPage = index;

        return page;
    }
    
    public getPage(index: number, disableComponents?: boolean): PageWithComponents {
        const page: PageWithComponents|undefined = super.getPage(index);
        if (!page) throw new Error(`Can\'t find page with index ${index}`);

        if (this.buttons.buttons.length) page.components = [this.buttons.getActionRow(disableComponents)];

        return page;
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

    private _addCollector(): void {
        if (!this.command || !this.pagination) throw new TypeError("Pagination is not yet ready");

        this.collector = this.pagination.createMessageComponentCollector({
            filter: c => Object.values(this.buttons.componentButtons).some(b => c.customId == b.customId),
            time: this.timer,
            ...this.collectorOptions
        });

        if (!this.collector) throw new Error("Cannot create pagination collector");

        this.collector.on("collect", c => {
            this.emit("collectorCollect", c);

            if (this.authorId && c.user.id !== this.authorId) {
                if (!c.deferred) c.deferUpdate().catch(() => null);
                return;
            }

            const action = this.buttons.componentButtons.find(b => b.customId == c.customId);
            if (!action) {
                if (!c.deferred) c.deferUpdate().catch(() => null);
                return;
            }

            switch (action.type) {
                case PaginationButtonType.FirstPage:
                    this.setCurrentPage(0);
                    break;
                case PaginationButtonType.PreviousPage:
                    this.setCurrentPage(this.currentPage - 1 < 0 ? this.pages.length - 1 : this.currentPage - 1);
                    break;
                case PaginationButtonType.StopInteraction:
                    this.collector?.stop();
                    break;
                case PaginationButtonType.NextPage:
                    this.setCurrentPage(this.currentPage + 1 > this.pages.length - 1 ? 0 : this.currentPage + 1);
                    break;
                case PaginationButtonType.LastPage:
                    this.setCurrentPage(this.pages.length - 1);
                    break;
            }

            this.collector?.resetTimer();
            this.emit("componentInteraction", action.type, c);
            if (!c.deferred) c.deferUpdate().catch(() => null);
        });

        this.collector.on("end", (c, reason) => {
            switch (this.onDisable) {
                case OnDisableAction.DeleteComponents:
                    this.setCurrentPage(this.currentPage, { removeComponents: true });
                    break;
                case OnDisableAction.DeleteMessage:
                    if (this.pagination?.deletable) this.pagination.delete();
                    break;
                case OnDisableAction.DisableComponents:
                    this.setCurrentPage(this.currentPage, { disableComponents: true });
                    break;
            }

            this.emit("collectorEnd", reason, this.onDisable);
        });
    }

    private _getAuthor(command: RepliableInteraction|Message): User {
        if (command instanceof Message) return command.author;
        return command.user;
    }
}
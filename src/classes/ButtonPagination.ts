import { OnDisableAction, Page, RepliableInteraction, SendAs } from '../types/pagination';
import { APIUser, Awaitable, ButtonBuilder, CommandInteraction, Interaction, InteractionType, Message, MessageCollectorOptionsParams, MessageComponentInteraction, MessageComponentType, User } from 'discord.js';
import { PaginationButtonType, ButtonPaginationComponentsBuilder, ButtonPaginationComponentsBuilderOptions } from './builders/ButtonPaginationComponentsBuilder';
import { PaginationBase, PaginationBaseEvents, PaginationBaseOptions } from './base/PaginationBase';

export interface ButtonPaginationOptions extends PaginationBaseOptions {
    buttons?: ButtonPaginationComponentsBuilder|ButtonPaginationComponentsBuilderOptions;
    onDisable?: OnDisableAction;
    authorIndependent?: boolean;
    singlePageNoButtons?: boolean;
    timer?: number;
    authorId?: string|User|APIUser;
    collectorOptions?: MessageCollectorOptionsParams<MessageComponentType>;
}

export interface ButtonPaginationEvents extends PaginationBaseEvents {
    "interactionCreate": [componentType: Omit<PaginationButtonType, "CustomComponent">, component: MessageComponentInteraction];
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
    public buttons: ButtonPaginationComponentsBuilder;
    public onDisable: OnDisableAction = OnDisableAction.DisableComponents;
    public authorIndependent: boolean = true;
    public singlePageNoButtons: boolean = true;
    public timer: number = 20000;
    public authorId?: string;
    public collectorOptions?: MessageCollectorOptionsParams<MessageComponentType>;

    constructor(options?: ButtonPaginationOptions) {
        super(options);

        this.buttons = options?.buttons instanceof ButtonPaginationComponentsBuilder ? options.buttons : new ButtonPaginationComponentsBuilder(options?.buttons);
        this.collectorOptions = options?.collectorOptions ?? this.collectorOptions;

        if (options?.onDisable) this.setOnDisableAction(options.onDisable);
        if (options?.authorIndependent) this.setAuthorIndependent(options.authorIndependent);
        if (options?.singlePageNoButtons) this.setAuthorIndependent(options.singlePageNoButtons);
        if (options?.timer) this.setTimer(options.timer);
        if (options?.authorId) this.setAuthorId(options?.authorId);
    }

    /**
     *  Sets disable interaction interval in milliseconds
     * @default 20000
     */
    public setTimer(timer: number): ButtonPagination {
        if (!isNaN(Number(timer))) {
            this.timer = timer;
        } else {
            throw new TypeError('Invalid ttimer');
        }
        
        return this;
    }

    /**
     * Set if the pagination should only work for pagination author 
     * @default true
     */
    public setAuthorIndependent(authorIndependent: boolean): ButtonPagination {
        this.authorIndependent = authorIndependent;
        return this;
    }

    /**
     * Set what action would happen on pagination timeout
     * @default OnDisableAction.DisableComponents
     */
    public setOnDisableAction(action: OnDisableAction): ButtonPagination {
        this.onDisable = action;
        return this;
    }

    /**
     * Set if pagination should disable buttons if there's only single page 
     * @default true
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
    public addButton(button: ButtonBuilder, type: Omit<PaginationButtonType, "CustomComponent">): ButtonPagination {
        this.buttons.addMessageComponent(button, type);
        return this;
    }

    /**
     * Start the pagination
     */
    public async paginate(command: Message|Interaction, sendAs: SendAs = SendAs.ReplyMessage): Promise<ButtonPagination> {
        if (!command) throw new TypeError("Command is invalid");
        if (!command.channel) throw new Error("Command does not have a text channel");
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
                    if (!command.replied && !command.deferred) throw new Error("Command interaction is not replied or deffered");
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

        if (((this.command as CommandInteraction)?.ephemeral || (this.command as CommandInteraction)?.deferred) && this.pagination.interaction) {
            (this.command as CommandInteraction).editReply(page);
        } else if (!(this.command as CommandInteraction)?.deferred) {
            this.pagination.edit(page);
        } else {
            throw new Error('Can\'t identify command type.');
        }
            
        this.currentPage = index;

        return page;
    }
    
    public getPage(index: number, disabledComponents: boolean = false): Page {
        const page = super.getPage(index);
        if (!page) throw new Error(`Can\'t find page with index ${index}`);

        return {
            ...page,
            components: [
                ...this.buttons.getPaginationActionRows(0, disabledComponents),
                ...(page.components ?? [])
            ]
        };
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

    /**
     * Clone pagination
     */
    public clonePagination(includePages: boolean = true): ButtonPagination {
        return new ButtonPagination(this.makeOptions(includePages));
    }

    protected _addCollector(): void {
        if (!this.command || !this.pagination) throw new TypeError("Pagination is not yet ready");

        this.collector = this.pagination.createMessageComponentCollector({
            filter: c => Object.values(this.buttons.buttons).some(b => c.customId == b.customId),
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

            const action = this.buttons.buttons.find(b => b.customId == c.customId);
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
            this.emit("interactionCreate", action.type, c);
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

    protected _getAuthor(command: RepliableInteraction|Message): User {
        if (command instanceof Message) return command.author;
        return command.user;
    }
}
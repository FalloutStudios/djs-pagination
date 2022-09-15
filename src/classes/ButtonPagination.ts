import { APIUser, Awaitable, ButtonBuilder, CommandInteraction, Interaction, InteractionCollector, MappedInteractionTypes, Message, MessageCollectorOptionsParams, MessageComponentInteraction, MessageComponentType, User } from 'discord.js';
import { ButtonPaginationComponentsBuilder, ButtonPaginationComponentsBuilderOptions } from './builders/ButtonPaginationComponentsBuilder';
import { PaginationBase, PaginationBaseEvents, PaginationBaseOptions } from './base/PaginationBase';
import { Page, PaginationControllerType, SendAs } from '../types/pagination';

export enum ButtonPaginationOnDisableAction {
    /**
     * Do nothing but will disable interacting with the pagination.
     */
    None,
    /**
     * Delete the sent pagination message
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

export interface ButtonPaginationOptions extends PaginationBaseOptions {
    buttons?: ButtonPaginationComponentsBuilder|ButtonPaginationComponentsBuilderOptions;
    onDisableAction?: ButtonPaginationOnDisableAction|keyof typeof ButtonPaginationOnDisableAction;
    authorIndependent?: boolean;
    singlePageNoButtons?: boolean;
    timer?: number;
    authorId?: string|User|APIUser|null;
    collectorOptions?: Omit<MessageCollectorOptionsParams<MessageComponentType>, "timer">;
}

export interface ButtonPaginationEvents extends PaginationBaseEvents<MessageComponentInteraction> {
    "interactionCreate": [componentType: Omit<PaginationControllerType, "Custom">, component: MessageComponentInteraction];
}

export interface ButtonPagination extends PaginationBase<MessageComponentInteraction> {
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

export class ButtonPagination extends PaginationBase<MessageComponentInteraction> {
    protected _buttons!: ButtonPaginationComponentsBuilder;
    protected _onDisableAction: ButtonPaginationOnDisableAction = ButtonPaginationOnDisableAction.DisableComponents;
    protected _authorIndependent: boolean = false;
    protected _singlePageNoButtons: boolean = true;
    protected _timer: number = 20000;
    protected _authorId: string|null = null;
    protected _collector: InteractionCollector<MappedInteractionTypes[MessageComponentType]>|null = null;
    protected _collectorOptions?: Omit<MessageCollectorOptionsParams<MessageComponentType>, "timer">;

    get buttons() { return this._buttons; }
    get onDisableAction() { return this._onDisableAction; }
    get authorIndependent() { return this._authorIndependent; }
    get singlePageNoButtons() { return this._singlePageNoButtons; }
    get timer() { return this._timer; }
    get authorId() { return this._authorId; }
    get collector() { return this._collector; }
    get collectorOptions() { return this._collectorOptions; }

    set buttons(buttons: ButtonPaginationOptions['buttons']) { this._buttons = buttons instanceof ButtonPaginationComponentsBuilder ? buttons : new ButtonPaginationComponentsBuilder(buttons); }
    set onDisableAction(action: Required<ButtonPaginationOptions>['onDisableAction']) { this.setOnDisableAction(action); }
    set authorIndependent(authorIndependent: Required<ButtonPaginationOptions>['authorIndependent']) { this.setAuthorIndependent(authorIndependent); }
    set singlePageNoButtons(singlePageNoButtons: Required<ButtonPaginationOptions>['singlePageNoButtons']) { this.setSinglePageNoButtons(singlePageNoButtons); }
    set timer(timer: Required<ButtonPaginationOptions>['timer']) { this.setTimer(timer); }
    set authorId(author: Required<ButtonPaginationOptions>['authorId']) { this.setAuthorId(author); }
    set collectorOptions(options: ButtonPaginationOptions['collectorOptions']) { this._collectorOptions = options; }

    constructor(options?: ButtonPaginationOptions) {
        super(options);

        this.buttons = options?.buttons;
        this.collectorOptions = options?.collectorOptions;
        this.onDisableAction = options?.onDisableAction ?? 'DisableComponents';
        this.authorIndependent = options?.authorIndependent ?? true;
        this.singlePageNoButtons = options?.singlePageNoButtons ?? true;
        this.timer = options?.timer ?? 20000;
        this.authorId = options?.authorId ?? null;
    }

    /**
     *  Sets disable interaction interval in milliseconds
     * @default 20000
     */
    public setTimer(timer: number): this {
        if (!isNaN(Number(timer))) {
            this._timer = timer;
        } else {
            throw new TypeError('Invalid ttimer');
        }

        return this;
    }

    /**
     * Set if the pagination shouldn work for any user
     * @default true
     */
    public setAuthorIndependent(authorIndependent: boolean): this {
        this._authorIndependent = !!authorIndependent;
        return this;
    }

    /**
     * Set what action would happen on pagination timeout
     * @default ButtonPaginationOnDisableAction.DisableComponents
     */
    public setOnDisableAction(action: ButtonPaginationOnDisableAction|keyof typeof ButtonPaginationOnDisableAction): this {
        this._onDisableAction = typeof action === 'string' ? ButtonPaginationOnDisableAction[action] : action;
        return this;
    }

    /**
     * Set if pagination should disable buttons if there's only single page
     * @default true
     */
    public setSinglePageNoButtons(singlePageNoButtons: boolean): this {
        this._singlePageNoButtons = singlePageNoButtons;
        return this;
    }

    /**
     * Sets the pagination author Id
     */
    public setAuthorId(authorId?: string|User|APIUser|null): this {
        if (typeof authorId == 'string') {
            this._authorId = authorId;
        } else if (authorId !== null && authorId !== undefined) {
            this._authorId = authorId.id;
        } else {
            this._authorId = null;
        }

        return this;
    }

    /**
     * Add button to pagination
     */
    public addButton(button: ButtonBuilder, type: Omit<PaginationControllerType, "Custom">|keyof Omit<typeof PaginationControllerType, "Custom">): this {
        this._buttons.addMessageComponent(button, typeof type === 'string' ? PaginationControllerType[type] : type);
        return this;
    }

    /**
     * Start the pagination
     */
    public async paginate(command: Message|Interaction, sendAs: SendAs|keyof typeof SendAs = SendAs.ReplyMessage): Promise<this> {
        if (!command) throw new TypeError("Command is invalid");
        if (!command.channel) throw new Error("Command does not have a text channel");
        if (this._command || this._pagination) throw new TypeError("Pagination is already started");
        if (!(command instanceof Message) && !command.isRepliable()) throw new TypeError("Interaction is not repliable");

        this._command = command;
        this._authorId = this._authorId ?? this._getAuthor(command).id;

        const page = this.getPage(0);
        if (this._pages.length == 1 && this._singlePageNoButtons) page.components = [];

        await this._sendPage(page, typeof sendAs === 'string' ? SendAs[sendAs] : sendAs);

        this.emit('ready');
        if (this._pages.length > 1 || this._pages.length == 1 && !this._singlePageNoButtons) this._addCollector();

        return this;
    }

    public async setCurrentPage(index?: number, componentsOptions?: { removeComponents?: boolean; disableComponents?: boolean; }): Promise<Page> {
        index = index ?? this._currentPage;

        if (!this._command || !this._pagination) throw new Error('Pagination is not yet ready');
        if (index < 0 || index > this._pages.length) throw new TypeError('index is out of range');

        const page = this.getPage(index, componentsOptions?.disableComponents);
        if (componentsOptions?.removeComponents) page.components = [];

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

    public getPage(pageIndex: number, disabledComponents: boolean = false): Page {
        const page = super.getPage(pageIndex);

        return {
            ...page,
            components: [
                ...this._buttons.getPaginationActionRows(0, disabledComponents),
                ...(page.components ?? [])
            ]
        };
    }

    /**
     * Returns pagination options as JSON object
     */
    public makeOptions(includePages: boolean = true): ButtonPaginationOptions {
        return {
            pages: includePages ? this._pages : [],
            authorId: this._authorId,
            authorIndependent: this._authorIndependent,
            buttons: this._buttons,
            collectorOptions: this._collectorOptions,
            onDisableAction: this._onDisableAction,
            singlePageNoButtons: this._singlePageNoButtons,
            timer: this._timer
        };
    }

    /**
     * Clone pagination
     */
    public clonePagination(includePages: boolean = true): ButtonPagination {
        return new ButtonPagination(this.makeOptions(includePages));
    }

    protected _addCollector(): void {
        if (!this._command || !this._pagination) throw new TypeError("Pagination is not yet ready");

        this._collector = this._pagination.createMessageComponentCollector({
            filter: c => Object.values(this._buttons.buttons).some(b => c.customId == b.customId),
            time: this._timer,
            ...this._collectorOptions
        });

        if (!this._collector) throw new Error("Cannot create pagination collector");

        this._collector.on("collect", c => {
            this.emit("collectorCollect", c);

            if (!this._authorIndependent && this._authorId && c.user.id !== this._authorId) {
                if (!c.deferred) c.deferUpdate().catch(() => {});
                return;
            }

            const action = this._buttons.buttons.find(b => b.customId == c.customId)?.type;
            if (action === undefined) {
                if (!c.deferred) c.deferUpdate().catch(() => {});
                return;
            }

            switch (action) {
                case PaginationControllerType.FirstPage:
                    this.setCurrentPage(0);
                    break;
                case PaginationControllerType.PreviousPage:
                    this.setCurrentPage(this._currentPage - 1 < 0 ? this._pages.length - 1 : this._currentPage - 1);
                    break;
                case PaginationControllerType.StopInteraction:
                    this._collector?.stop();
                    break;
                case PaginationControllerType.NextPage:
                    this.setCurrentPage(this._currentPage + 1 > this._pages.length - 1 ? 0 : this._currentPage + 1);
                    break;
                case PaginationControllerType.LastPage:
                    this.setCurrentPage(this._pages.length - 1);
                    break;
            }

            this._collector?.resetTimer();
            this.emit("interactionCreate", action, c);
            if (!c.deferred) c.deferUpdate().catch(() => null);
        });

        this._collector.on("end", (c, reason) => {
            switch (this._onDisableAction) {
                case ButtonPaginationOnDisableAction.DeleteComponents:
                    this.setCurrentPage(this._currentPage, { removeComponents: true });
                    break;
                case ButtonPaginationOnDisableAction.DeleteMessage:
                    if (this._pagination?.deletable) this._pagination.delete().catch(() => {});
                    break;
                case ButtonPaginationOnDisableAction.DisableComponents:
                    this.setCurrentPage(this._currentPage, { disableComponents: true });
                    break;
            }

            this.emit("collectorEnd", reason);
        });
    }
}
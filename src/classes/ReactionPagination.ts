import { APIUser, Awaitable, IntentsBitField, Interaction, Message, MessageReaction, parseEmoji, ReactionCollector, ReactionCollectorOptions, User } from 'discord.js';
import { PaginationBase, PaginationBaseEvents, PaginationBaseOptions } from './base/PaginationBase';
import { PaginationControllerType, SendAs } from '../types/pagination';

export enum ReactionPaginationOnDisableAction {
    /**
     * Do nothing but will disable interacting with the pagination.
     */
    None,
    /**
     * Delete the sent pagination message
     */
    DeleteMessage,
    /**
     * Remove pagination reactions
     */
    RemovePaginationReactions,
    /**
     * Clear all message reactions
     */
    ClearAllReactions
}

export interface PaginationReactionController {
    id: string|null;
    name: string;
    type: Omit<PaginationControllerType, "Custom">;
}

export interface PaginationReactionStringEmoji {
    emoji: string;
    type: Omit<PaginationControllerType, "Custom">;
}

export interface ReactionPaginationOptions extends PaginationBaseOptions {
    reactions?: ((PaginationReactionController & { type: PaginationControllerType|keyof Omit<typeof PaginationControllerType, "Custom"> })|(PaginationReactionStringEmoji & { type: PaginationControllerType|keyof Omit<typeof PaginationControllerType, "Custom">}))[];
    onDisableAction?: ReactionPaginationOnDisableAction|keyof typeof ReactionPaginationOnDisableAction;
    authorIndependent?: boolean;
    singlePageNoReactions?: boolean;
    timer?: number;
    authorId?: string|User|APIUser|null;
    collectorOptions?: Omit<ReactionCollectorOptions, "timer">;
}

export interface ReactionPaginationEvents extends PaginationBaseEvents<MessageReaction> {
    "interactionCreate": [componentType: Omit<PaginationControllerType, "Custom">, component: MessageReaction];
}

export interface ReactionPagination extends PaginationBase<MessageReaction> {
    on<E extends keyof ReactionPaginationEvents>(event: E, listener: (...args: ReactionPaginationEvents[E]) => Awaitable<void>): this;
    on<E extends string|symbol>(event: Exclude<E, keyof ReactionPaginationEvents>, listener: (...args: any) => Awaitable<void>): this;

    once<E extends keyof ReactionPaginationEvents>(event: E, listener: (...args: ReactionPaginationEvents[E]) => Awaitable<void>): this;
    once<E extends string|symbol>(event: Exclude<E, keyof ReactionPaginationEvents>, listener: (...args: any) => Awaitable<void>): this;


    emit<E extends keyof ReactionPaginationEvents>(event: E, ...args: ReactionPaginationEvents[E]): boolean;
    emit<E extends string|symbol>(event: Exclude<E, keyof ReactionPaginationEvents>, ...args: any): boolean;

    off<E extends keyof ReactionPaginationEvents>(event: E, listener: (...args: ReactionPaginationEvents[E]) => Awaitable<void>): this;
    off<E extends string|symbol>(event: Exclude<E, keyof ReactionPaginationEvents>, listener: (...args: any) => Awaitable<void>): this;

    removeAllListeners<E extends keyof ReactionPaginationEvents>(event?: E): this;
    removeAllListeners(event?: string|symbol): this;
}

export class ReactionPagination extends PaginationBase<MessageReaction> {
    protected _reactions: PaginationReactionController[] = [];
    protected _onDisableAction: ReactionPaginationOnDisableAction = ReactionPaginationOnDisableAction.RemovePaginationReactions;
    protected _authorIndependent: boolean = false;
    protected _singlePageNoReactions: boolean = true;
    protected _timer: number = 20000;
    protected _authorId: string|null = null;
    protected _collector: ReactionCollector|null = null;
    protected _collectorOptions?: ReactionCollectorOptions;

    get reactions() { return this._reactions as (PaginationReactionController & { type: keyof Omit<typeof PaginationControllerType, "Custom"> })[]; }
    get onDisableAction() { return this._onDisableAction; }
    get authorIndependent() { return this._authorIndependent; }
    get singlePageNoReactions() { return this._singlePageNoReactions; }
    get timer() { return this._timer; }
    get authorId() { return this._authorId; }
    get collector() { return this._collector; }
    get collectorOptions() { return this._collectorOptions; }

    set reactions(reactions: Required<ReactionPaginationOptions>["reactions"]) {
        reactions.forEach(reaction => {
            if ((reaction as PaginationReactionStringEmoji).emoji !== undefined) {
                this.addReaction((reaction as PaginationReactionStringEmoji).emoji, reaction.type);
                return;
            }

            reaction.type = typeof reaction.type === 'string' ? (PaginationControllerType as { [key: string]: any; })[reaction.type] : reaction.type;

            this._reactions.push(reaction as PaginationReactionController);
        });
    }
    set onDisableAction(action: Required<ReactionPaginationOptions>["onDisableAction"]) { this.setOnDisableAction(action); }
    set authorIndependent(authorIndependent: Required<ReactionPaginationOptions>["authorIndependent"]) { this.setAuthorIndependent(authorIndependent); }
    set singlePageNoReactions(singlePageNoReactions: Required<ReactionPaginationOptions>["singlePageNoReactions"]) { this.setSinglePageNoReactions(singlePageNoReactions); }
    set timer(timer: Required<ReactionPaginationOptions>['timer']) { this.setTimer(timer); }
    set authorId(author: Required<ReactionPaginationOptions>['authorId']) { this.setAuthorId(author); }
    set collectorOptions(options: ReactionPaginationOptions['collectorOptions']) { this._collectorOptions = options; }

    constructor(options?: ReactionPaginationOptions) {
        super(options);

        this.authorId = options?.authorId ?? null;
        this.authorIndependent = options?.authorIndependent ?? true;
        this.singlePageNoReactions = options?.singlePageNoReactions ?? true;
        this.reactions = options?.reactions ?? [];
        this.timer = options?.timer ?? 20000;
        this.onDisableAction = options?.onDisableAction ?? 'None';
        this.collectorOptions = options?.collectorOptions;
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
     * Set if the pagination should work for any user
     * @default true
     */
    public setAuthorIndependent(authorIndependent: boolean): this {
        this._authorIndependent = authorIndependent;
        return this;
    }

    /**
     * Set what action would happen on pagination timeout
     * @default ReactionPaginationOnDisableAction.DisableComponents
     */
    public setOnDisableAction(action: ReactionPaginationOnDisableAction|keyof typeof ReactionPaginationOnDisableAction): this {
        this._onDisableAction = typeof action === 'string' ? ReactionPaginationOnDisableAction[action] : action;
        return this;
    }

    /**
     * Set if pagination should add reactions if there's only single page
     * @default true
     */
    public setSinglePageNoReactions(singlePageNoReactions: boolean): this {
        this._singlePageNoReactions = singlePageNoReactions;
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
     * Adds reaction controller
     */
    public addReaction(emoji: string, type: Omit<PaginationControllerType, "Custom">|keyof Omit<typeof PaginationControllerType, "Custom">): this {
        const parsedEmoji = parseEmoji(emoji);
        if (!parsedEmoji?.id && !parsedEmoji?.name || !parsedEmoji?.name || parsedEmoji.animated && !parsedEmoji.id) throw new TypeError("Couldn't parse valid emoji.");

        this._reactions.push({
            id: parsedEmoji.id ?? null,
            name: parsedEmoji.name,
            type: typeof type === 'string' ? PaginationControllerType[type] : type
        });

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
        if (!new IntentsBitField(command.client.options.intents).has("GuildMessageReactions")) throw new Error("Missing intent 'GuildMessageReactions'");

        this._command = command;
        this._authorId = this._authorId ?? this._getAuthor(command).id;

        const page = this.getPage(0);

        if (page.ephemeral) throw new Error("Reactions cannot be added to ephemeral messages");

        await this._sendPage(page, typeof sendAs === 'string' ? SendAs[sendAs] : sendAs);
        await this._react();

        this._addCollector();

        return this;
    }

    /**
     * Returns pagination options as JSON object
     */
    public makeOptions(includePages: boolean = true): ReactionPaginationOptions {
        return {
            pages: includePages ? this._pages : [],
            authorId: this._authorId,
            reactions: this.reactions,
            singlePageNoReactions: this._singlePageNoReactions,
            authorIndependent: this._authorIndependent,
            collectorOptions: this._collectorOptions,
            onDisableAction: this._onDisableAction,
            timer: this._timer
        };
    }

    /**
     * Clone pagination
     */
    public clonePagination(includePages: boolean = true): ReactionPagination {
        return new ReactionPagination(this.makeOptions(includePages));
    }

    protected async _react(): Promise<void> {
        if (!this._command || !this._pagination) throw new TypeError("Pagination is not yet ready");

        for (const emojiData of this._reactions) {
            const emoji = emojiData.id === null ? emojiData.name : this._pagination.client.emojis.cache.get(emojiData.id);

            if (!emoji) throw new Error("Could not find emoji cache for " + emojiData.id ?? emojiData.name);
            await this._pagination.react(emoji);
        }
    }

    protected _addCollector(): void {
        if (!this._command || !this._pagination) throw new TypeError("Pagination is not yet ready");

        this._collector = this._pagination.createReactionCollector({
            filter: r => this._reactions.some(e => (r.emoji.id ?? null) === e.id && r.emoji.name === e.name),
            time: this._timer,
            ...this._collectorOptions
        });

        if (!this._collector) throw new Error("Cannot create pagination collector");

        this._collector.on("collect", async (r, u) => {
            this.emit("collectorCollect", r);

            r = r.partial ? await r.fetch().catch(() => null as any) : r;
            if (!r) return;

            if (!this._authorIndependent && this._authorId && u.id !== this._authorId) {
                if (u.id !== this._pagination?.client.user?.id) r.users.remove(u).catch(() => {});
                return;
            }

            const action = this._reactions.find(b => (r.emoji.id ?? null) === b.id && (r.emoji.name ?? null) === b.name)?.type;
            if (action === undefined) return;

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
            this.emit("reactionAdd", action, r);
            r.users.remove(u).catch(() => {});
        });

        this._collector.on("end", (c, reason) => {
            switch (this._onDisableAction) {
                case ReactionPaginationOnDisableAction.DeleteMessage:
                    if (this._pagination?.deletable) this._pagination.delete().catch(() => {});
                    break;
                case ReactionPaginationOnDisableAction.RemovePaginationReactions:
                    this._pagination?.reactions.cache.forEach(reaction => {
                        if (!this._reactions.some(r => r.id === reaction.emoji.id && r.name === reaction.emoji.name)) return;
                        reaction.remove().catch(() => {});
                    });
                    break;
                case ReactionPaginationOnDisableAction.ClearAllReactions:
                    this.pagination?.reactions.removeAll().catch(() => {});
                    break;
            }

            this.emit("collectorEnd", reason);
        });
    }
}
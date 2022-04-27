import { ButtonInteraction, CollectorFilter, CommandInteraction, GuildMember, Interaction, InteractionCollector, Message, MessageComponentInteraction, MessageEmbed, MessageEmbedOptions, MessageOptions, User, UserResolvable, WebhookEditMessageOptions } from 'discord.js';
import * as Buttons from './util/Buttons';
import { EventEmitter } from 'events';

export const ButtonType = Buttons.ButtonType;
export enum OnDisableAction {
    /**
     * Do nothing but will disable interaction with the pagination. 
     */
    NONE,
    /**
     * Delete the pagination
     */
    DELETE_MESSAGE,
    /**
     * Delete the pagination buttons
     */
    DELETE_BUTTONS,
    /**
     * Disable the pagination buttons
     */
    DISABLE_BUTTONS
}

export enum SendAs {
    /**
     * Send the pagination as new message of the same channel as the parent message
     */
    NEW_MESSAGE,
    /**
     * Edis the parent message with the pagination
     */
    EDIT_MESSAGE,
    /**
     * Replies to the parent message with the pagination
     */
    REPLY_MESSAGE
}

export interface PaginationContentOptions {
    content?: string | null;
    embeds?: (MessageEmbed | MessageEmbedOptions)[] | any;
    components?: any[];
}

export declare interface Pagination {
    /**
     * 
     * @param event Event emitted when button is clicked
     */
    on(event: Buttons.ButtonType.FIRST_PAGE | Buttons.ButtonType.PREVIOUS_PAGE | Buttons.ButtonType.STOP_INTERACTION | Buttons.ButtonType.NEXT_PAGE | Buttons.ButtonType.LAST_PAGE, listener: (interaction: ButtonInteraction, pagination: Pagination) => void): this;
    on(events: 'pageChange', listener: (page: number) => void): this;
    on(events: 'collectorCollect', listener: (interaction: ButtonInteraction) => void): this;
    on(events: 'collectorEnd', listener: (interaction: ButtonInteraction, reason: string) => void): this;

    /**
     * 
     * @param event Event emitted once button is clicked
     */
    once(event: Buttons.ButtonType.FIRST_PAGE | Buttons.ButtonType.PREVIOUS_PAGE | Buttons.ButtonType.STOP_INTERACTION | Buttons.ButtonType.NEXT_PAGE | Buttons.ButtonType.LAST_PAGE, listener: (interaction: ButtonInteraction, pagination: Pagination) => void): this;
    once(events: 'pageChange', listener: (page: number) => void): this;
    once(events: 'collectorCollect', listener: (interaction: ButtonInteraction) => void): this;
    once(events: 'collectorEnd', listener: (interaction: ButtonInteraction, reason: string) => void): this;
}

export type AcceptedParentType = Message | CommandInteraction | ButtonInteraction;
export type AcceptedPaginationMessageType = AcceptedParentType;

export class Pagination extends EventEmitter {
    public pagesEmbed: (MessageEmbed|MessageEmbedOptions)[] = [];
    public pagesText: (string|null)[] = [];
    public buttons?: Buttons.PaginationButton = undefined;
    public currentPage: number = 0;
    public onDisable: OnDisableAction = OnDisableAction.DISABLE_BUTTONS;
    public authorIndependent: boolean = true;
    public author?: User = undefined;
    public parentMessage?: AcceptedParentType = undefined;
    public pagination?: AcceptedPaginationMessageType = undefined;
    public collector?: InteractionCollector<MessageComponentInteraction> = undefined;
    public collectorFilter: CollectorFilter<[MessageComponentInteraction]> = () => false;
    public collectorMaxInteractions?: number = undefined;
    public collectorTimer: number = 60000;
    
    constructor() {
        super();
    }

    /**
     * 
     * Add pages Embed
     */
    addPage(page: MessageEmbed, content?: string): Pagination {
        if (!page) throw new TypeError("Page is undefined");
        if (!(page instanceof MessageEmbed)) throw new TypeError("Page is not an instance of MessageEmbed");

        this.pagesEmbed.push(page);

        if (typeof content === 'string') {
            if (!content) throw new TypeError("Content cannot be empty");

            this.pagesText.push(content);
        } else {
            this.pagesText.push(null);
        }

        return this;
    }

    /**
     * 
     * Adds multiple embeds
     */
    addPages(pages: MessageEmbed[], content?: string[]): Pagination {
        if (!pages || !pages.length) throw new TypeError("Pages is undefined or empty");
        if (!Array.isArray(pages)) throw new TypeError("Pages is not an array");

        let i = 0;

        for (const page of pages) {
            if (!page) throw new TypeError("Page is undefined");
            if (!(page instanceof MessageEmbed)) throw new TypeError("Page is not an instance of MessageEmbed");

            this.pagesEmbed.push(page);
            this.pagesText.push(content && content[i] ? content[i] : null);

            i++;
        }

        return this;
    }

    /**
     * 
     * Add the buttons
     */
    setButtons(builder: Buttons.AddButtonType): Pagination {
        if (!builder) throw new TypeError("Builder is undefined");

        if (builder instanceof Buttons.PaginationButton) {
            this.buttons = builder;
        } else if (typeof builder === 'function') {
            this.buttons = builder(new Buttons.PaginationButton());
        } else {
            throw new TypeError("Builder is not an instance of PaginationButton or a function");
        }

        return this;
    }

    /**
     * 
     * Set if the pagination should allow only the author of parent message to interact with it
     */
    setAuthorIndependent(authorIndependent: boolean): Pagination {
        this.authorIndependent = !!authorIndependent;
        return this;
    }

    /**
     * 
     * Sets the pagination author
     */
    setAuthor(author: UserResolvable): Pagination {
        if (!author) throw new TypeError("Author is undefined");

        if (author instanceof Message) {
            this.author = author.author;
        } else if (author instanceof GuildMember) {
            this.author = author.user;
        } else if (author instanceof User) {
            this.author = author;
        } else {
            throw new TypeError("Author is not an instance of Message, GuildMember or User");
        }

        return this;
    }

    /**
     * Sets max interactions for the pagination
     */
    setMaxInteractions(max: number): Pagination {
        this.collectorMaxInteractions = max || 0;
        return this;
    }
    
    /**
     * 
     * Set timer interval for automatic disabling of the pagination
     */
    setTimer(interval: number): Pagination {
        if (interval < 3000) throw new TypeError("Interval must be at least 3000ms");
        this.collectorTimer = interval || 60000;
        return this;
    }
    
    /**
     * 
     * Action to perform when the pagination is disabled
     */
    setOnDisableAction(action: OnDisableAction): Pagination {
        if (!OnDisableAction[action]) action = OnDisableAction.DISABLE_BUTTONS;
        this.onDisable = action;
        return this;
    }

    /**
     * Send pagination
     */
    async paginate(parent: AcceptedParentType, sendAs: SendAs = SendAs.REPLY_MESSAGE): Promise<Pagination> {
        if (!parent) throw new TypeError("Parent is undefined");
        if (this.collector) throw new Error("Pagination is already sent or the collector is already defined!");

        this.parentMessage = parent;
        this.author = this.author || this.getAuthor(parent);

        await this.send(sendAs);
        this.emit('pageChange', this.currentPage);

        this.addCollector();
        return this;
    }

    /**
     * 
     * Set Pagination's current page
     */
    async setCurrentPage(page: number, addButtons: boolean = true, disabledButtons: boolean = false): Promise<Pagination> {
        if (!this.parentMessage) throw new TypeError("Parent message is undefined");
        if (!this.pagination) throw new TypeError("Pagination is undefined");
        if (page < 0 || page > this.pagesEmbed.length) throw new RangeError("Page is out of range");

        this.currentPage = page;


        // TODO:
        if (Pagination.messageInstanceof(this.pagination) == 'MESSAGE') {
            await (this.pagination as Message).edit(this.getCurrentPage<MessageOptions>(addButtons, disabledButtons));
        } else if (Pagination.messageInstanceof(this.pagination) == 'INTERACTION') {
            await (this.pagination as CommandInteraction).editReply(this.getCurrentPage<WebhookEditMessageOptions>(addButtons, disabledButtons));
        } else {
            throw new TypeError("Pagination is not an instance of Message, CommandInteraction or ButtonInteraction");
        }

        if (addButtons && !disabledButtons) this.emit('pageChange', this.currentPage);
        return this;
    }

    getCurrentPage<T extends PaginationContentOptions>(addButtons: boolean = true, disabledButton: boolean = false): T {
        const page = this.pagesEmbed[this.currentPage];
        if (!page) throw new TypeError("Page is undefined");

        return this.addButtons<T>({
            content: this.pagesText[this.currentPage] || ' ',
            embeds: [page],
            components: []
        }, disabledButton, !addButtons);
    }

    private addButtons<Op extends PaginationContentOptions>(options: any, disabled: boolean = false, removeButtons: boolean = false): Op {
        if (!options) throw new TypeError("Options is undefined");
        if (!this.parentMessage) throw new TypeError("Parent message is undefined");

        const buttons = !removeButtons ? this.buttons?.getButtons(disabled) : false;
        if (buttons) {
            options = {
                ...options,
                components: [buttons]
            };
        }

        return options;
    }

    private getAuthor(parent: AcceptedParentType): User {
        if (Pagination.messageInstanceof(parent) == 'MESSAGE') {
            return (parent as Message).author;
        } else if (Pagination.messageInstanceof(parent) == 'INTERACTION') {
            return (parent as CommandInteraction).user || parent.member?.user;
        } else {
            throw new TypeError("Parent is not an instance of Message, CommandInteraction or ButtonInteraction");
        }
    }

    private async addCollector(): Promise<Pagination> {
        if (this.collector) throw new Error("Collector is already set");
        
        const filter = this.buttons?.setFilter(undefined, this.authorIndependent && this.author ? this.author.id : undefined).filter;
        if (typeof filter === 'function') this.collectorFilter = filter;

        if (Pagination.messageInstanceof(this.pagination) == 'MESSAGE') {
            this.collector = (this.pagination as Message).createMessageComponentCollector({
                filter: this.collectorFilter,
                max: this.collectorMaxInteractions ?? 0,
                time: this.collectorTimer
            });
        } else if (Pagination.messageInstanceof(this.pagination) == 'INTERACTION') {
            this.pagination = this.pagination as CommandInteraction;

            const message = await this.pagination.fetchReply();
            if (message) {
                this.collector = (message as Message).createMessageComponentCollector({
                    filter: this.collectorFilter,
                    max: this.collectorMaxInteractions ?? 0,
                    time: this.collectorTimer
                });
            } else {
                throw new TypeError("Can't fetch reply");
            }
        }

        this.collector?.on('collect', async (interaction: MessageComponentInteraction) => {
            switch (interaction.customId) {
                case this.buttons?.buttons?.firstPage?.customId:
                    this.setCurrentPage(0);
                    this.emit(Buttons.ButtonType.FIRST_PAGE, interaction);
                    break;
                case this.buttons?.buttons?.previousPage?.customId:
                    this.setCurrentPage(this.currentPage - 1 < 0 ? this.pagesEmbed.length - 1 : this.currentPage - 1);
                    this.emit(Buttons.ButtonType.PREVIOUS_PAGE, interaction);
                    break;
                case this.buttons?.buttons?.stopInteraction?.customId:
                    this.collector?.stop();
                    this.emit(Buttons.ButtonType.STOP_INTERACTION, interaction);
                    break;
                case this.buttons?.buttons?.nextPage?.customId:
                    this.setCurrentPage(this.currentPage + 1 > this.pagesEmbed.length - 1 ? 0 : this.currentPage + 1);
                    this.emit(Buttons.ButtonType.NEXT_PAGE, interaction);
                    break;
                case this.buttons?.buttons?.lastPage?.customId:
                    this.setCurrentPage(this.pagesEmbed.length - 1);
                    this.emit(Buttons.ButtonType.LAST_PAGE, interaction);
                    break;
            }

            if (!interaction.deferred) await interaction.deferUpdate();
            this.emit('collectorCollect', interaction);

            this.collector?.resetTimer();
        });

        this.collector?.on('end', async (collected: MessageComponentInteraction[], reason: string) => {
            switch (this.onDisable) {
                case OnDisableAction.DELETE_BUTTONS:
                    await this.setCurrentPage(this.currentPage, false);
                    break;
                case OnDisableAction.DELETE_MESSAGE:
                    if (Pagination.messageInstanceof(this.pagination) == 'MESSAGE') {
                        await (this.pagination as Message).delete().catch(() => undefined);
                        break;
                    } else if (Pagination.messageInstanceof(this.pagination) == 'INTERACTION') {
                        await (this.pagination as CommandInteraction).deleteReply().catch(() => undefined);
                        break;
                    }
                    
                    throw new TypeError("Pagination is not an instance of Message, CommandInteraction or ButtonInteraction");
                case OnDisableAction.DISABLE_BUTTONS:
                    await this.setCurrentPage(this.currentPage, true, true);
                    break;
                case OnDisableAction.NONE: break;
            }

            this.emit('collectorEnd', collected, reason);
        });

        return this;
    }

    private async send(sendType: SendAs = SendAs.REPLY_MESSAGE) {
        if (!this.parentMessage) throw new TypeError("Parent message is undefined");
        switch (sendType) {
            case SendAs.NEW_MESSAGE:
                if (Pagination.messageInstanceof(this.parentMessage) === 'MESSAGE' || Pagination.messageInstanceof(this.parentMessage) == 'INTERACTION') {
                    this.pagination = await this.parentMessage.channel?.send(this.getCurrentPage<MessageOptions>());
                    return this.pagination;
                }

                throw new TypeError("Parent message is not an instance of Message or CommandInteraction or ButtonInteraction");
            case SendAs.EDIT_MESSAGE:
                if (Pagination.messageInstanceof(this.parentMessage) === 'MESSAGE') {
                    this.pagination = await (this.parentMessage as Message).edit(this.getCurrentPage<MessageOptions>());
                    return this.pagination;
                } else if (Pagination.messageInstanceof(this.parentMessage) === 'INTERACTION') {
                    this.parentMessage = this.parentMessage as CommandInteraction;

                    await this.parentMessage.editReply(this.getCurrentPage<WebhookEditMessageOptions>());

                    this.pagination = this.parentMessage;
                    return this.pagination;
                }

                throw new TypeError("Parent message is not an instance of Message or CommandInteraction or ButtonInteraction");
            case SendAs.REPLY_MESSAGE:
                if (Pagination.messageInstanceof(this.parentMessage) === 'MESSAGE') {
                    this.pagination = await (this.parentMessage as Message).reply(this.getCurrentPage<MessageOptions>());
                    return this.pagination;
                } else if (Pagination.messageInstanceof(this.parentMessage) === 'INTERACTION') {
                    this.parentMessage = this.parentMessage as CommandInteraction;

                    if(!this.parentMessage.replied) {
                        await this.parentMessage.reply(this.getCurrentPage<WebhookEditMessageOptions>());
                    } else {
                        await this.parentMessage.followUp(this.getCurrentPage<WebhookEditMessageOptions>());
                    }

                    this.pagination = await this.parentMessage.fetchReply() as Message;
                    return this.pagination;
                }
        }
    }

    public static messageInstanceof(pagination?: AcceptedParentType): 'MESSAGE'|'INTERACTION'|'UNKNOWN' {
        if ((pagination as Message)?.content) {
            return 'MESSAGE';
        } else if ((pagination as Interaction)?.user) {
            return 'INTERACTION';
        }

        return 'UNKNOWN';
    }
}

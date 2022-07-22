import { CommandInteraction, If, Interaction, Message, ModalSubmitInteraction } from 'discord.js';
import { Page } from '../types/pagination';

export interface PaginationBaseOptions {
    pages: Page[];
}

export class PaginationBase<Paginated extends boolean = boolean> {
    public pages: Page[] = [];
    public currentPage: number = 0;
    public pagination!: Paginated extends true ? Message : undefined;
    public command!: Paginated extends true ? Message|Interaction : undefined;

    constructor(options?: PaginationBaseOptions) {
        this.pages = options?.pages ?? [];
    }

    public getPage(pageIndex: number): Page|undefined {
        return this.pages[pageIndex];
    }

    public isPaginated(): this is PaginationBase<true>;
    public isPaginated(): boolean {
        return !!this.pagination && !!this.command;
    }
}
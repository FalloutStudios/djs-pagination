import { Page, PageWithComponents } from '../types/pagination';
import { PaginationBase, PaginationBaseOptions } from './PaginationBase';
import { PaginationButtonBuilder } from './PaginationButtonBuilder';

export interface ButtonPaginationOptions extends PaginationBaseOptions {
    buttons?: PaginationButtonBuilder;
}

export class ButtonPagination<Paginated extends boolean = boolean> extends PaginationBase<Paginated> {
    public buttons: PaginationButtonBuilder = new PaginationButtonBuilder();

    constructor(options?: ButtonPaginationOptions) {
        super(options)
    }

    public isPaginated(): this is ButtonPagination<true>;
    public isPaginated(): boolean {
        return super.isPaginated();
    }

    public async setPage(index: number): Promise<Page> {
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
}
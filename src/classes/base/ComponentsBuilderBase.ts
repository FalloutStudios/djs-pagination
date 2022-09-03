import { ActionRowBuilder, MessageActionRowComponentBuilder } from 'discord.js';

export interface ComponentsBuilderBaseOptions {
    actionRows?: ActionRowBuilder<MessageActionRowComponentBuilder>[];
    paginationActionRow?: ActionRowBuilder<MessageActionRowComponentBuilder>;
}

export class ComponentsBuilderBase {
    public actionRows: ActionRowBuilder<MessageActionRowComponentBuilder>[];
    protected _paginationActionRow: ActionRowBuilder<MessageActionRowComponentBuilder>;

    get paginationActionRow() { return this._paginationActionRow; }

    constructor(options?: ComponentsBuilderBaseOptions) {
        this.actionRows = options?.actionRows ?? [];
        this._paginationActionRow = options?.paginationActionRow ?? new ActionRowBuilder();
    }

    /**
     * Add component to 
     */
    public addActionRow(actionRow: ActionRowBuilder<MessageActionRowComponentBuilder>) {
        this.actionRows.push(actionRow);
    }

    /**
     * Returns the pagination component
     */
    public getActionRow() {
        return this._paginationActionRow;
    }

    /**
     * Returns the pagination component with additional action rows
     * @param paginationComponentIndex - Where to put pagination component
     */
    public getPaginationActionRows(paginationComponentIndex: number = 0) {
        if (!this.actionRows.length) return [this.getActionRow()];

        const actionRows = this.actionRows;
        actionRows.splice(paginationComponentIndex, 0, this._paginationActionRow);
        
        return actionRows;
    }
}
import { ActionRowBuilder, AnyComponentBuilder, APIButtonComponent, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from 'discord.js';
import { ComponentBuilderBase, ComponentBuilderBaseOptions } from './ComponentBuilderBase';

export interface ButtonsCustomIdList {
    firstPage?: string;
    previousPage?: string;
    stopInteraction?: string;
    nextPage?: string;
    lastPage?: string;
}

export interface SetButtonOption {
    button: ButtonBuilder|APIButtonComponent;
    type: ButtonType;
}

export enum ButtonType {
    /**
     * First page button
     */
    FirstPage,
    /**
     * Previous page button
     */
    PreviousPage,
    /**
     * Next page button
     */
    StopInteraction,
    /**
     * Next page button
     */
    NextPage,
    /**
     * Last page button
     */
    LastPage
}

export class PaginationButtonBuilder extends ComponentBuilderBase {
    public customIdList: ButtonsCustomIdList = {};
    public buttons: APIButtonComponent[] = [];

    constructor(options?: ComponentBuilderBaseOptions) {
        super(options);
    }

    public addButton(button: ButtonBuilder|APIButtonComponent, type: ButtonType): PaginationButtonBuilder {
        if (button instanceof ButtonBuilder) button = button.toJSON();
        if (button.style == ButtonStyle.Link) throw new TypeError('Link buttons cannot be used for pagination');

        this.buttons.push(button);
        this._setButtonId(button.custom_id, type);
        
        return this;
    }

    public setButtons(buttons: SetButtonOption[]): PaginationButtonBuilder {
        for (const button of buttons) {
            this.addButton(button.button, button.type);
        }
        
        return this;
    }

    public getActionRow(disabled?: boolean): ActionRowBuilder<MessageActionRowComponentBuilder> {
        const actionRow = super.getActionRow();
        return actionRow.setComponents(this.buttons.map(b => new ButtonBuilder(b).setDisabled(disabled)));
    }

    private _setButtonId(customId: string, type: ButtonType): void {
        switch (type) {
            case ButtonType.FirstPage:
                this.customIdList.firstPage = customId;
                return;
            case ButtonType.PreviousPage:
                this.customIdList.previousPage = customId;
                return;
            case ButtonType.StopInteraction:
                this.customIdList.stopInteraction = customId;
                return;
            case ButtonType.NextPage:
                this.customIdList.nextPage = customId;
                return;
            case ButtonType.LastPage:
                this.customIdList.lastPage = customId;
                return;
            default:
                throw new TypeError('Unknown pagination button type');
        }
    }
}
import { ComponentBuilderBase, ComponentBuilderBaseOptions } from '../base/ComponentBuilderBase';

import { ActionRowBuilder, APIButtonComponent, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder, normalizeArray, RestOrArray } from 'discord.js';

export interface ComponentButton {
    customId: string;
    type: PaginationButtonType;
}

export interface SetButtonOption {
    button: ButtonBuilder|APIButtonComponent;
    type: PaginationButtonType;
}

export enum PaginationButtonType {
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

export class ComponentButtonBuilder extends ComponentBuilderBase {
    public componentButtons: ComponentButton[] = [];
    public buttons: APIButtonComponent[] = [];

    constructor(options?: ComponentBuilderBaseOptions) {
        super(options);
    }

    public addButton(button: ButtonBuilder|APIButtonComponent, type: PaginationButtonType): ComponentButtonBuilder {
        if (button instanceof ButtonBuilder) button = button.toJSON();
        if (button.style == ButtonStyle.Link) throw new TypeError('Link buttons cannot be used for pagination');

        this.buttons.push(button);
        this._setButtonId(button.custom_id, type);
        
        return this;
    }

    public setButtons(...buttons: RestOrArray<SetButtonOption>): ComponentButtonBuilder {
        for (const button of normalizeArray(buttons)) {
            this.addButton(button.button, button.type);
        }
        
        return this;
    }

    public getActionRow(disabled: boolean = false): ActionRowBuilder<MessageActionRowComponentBuilder> {
        const actionRow = super.getActionRow();
        return actionRow.setComponents(this.buttons.map(b => new ButtonBuilder(b).setDisabled(disabled)));
    }

    private _setButtonId(customId: string, type: PaginationButtonType): void {
        this.componentButtons.push({ customId, type });
    }
}
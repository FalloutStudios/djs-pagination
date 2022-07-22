import { ActionRowBuilder, AnyComponentBuilder, APIButtonComponent, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from 'discord.js';
import { ComponentBuilderBase, ComponentBuilderBaseOptions } from './ComponentBuilderBase';

export interface ComponentButton {
    customId: string;
    type: ComponentButtonType;
}

export interface SetButtonOption {
    button: ButtonBuilder|APIButtonComponent;
    type: ComponentButtonType;
}

export enum ComponentButtonType {
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

    public addButton(button: ButtonBuilder|APIButtonComponent, type: ComponentButtonType): ComponentButtonBuilder {
        if (button instanceof ButtonBuilder) button = button.toJSON();
        if (button.style == ButtonStyle.Link) throw new TypeError('Link buttons cannot be used for pagination');

        this.buttons.push(button);
        this._setButtonId(button.custom_id, type);
        
        return this;
    }

    public setButtons(buttons: SetButtonOption[]): ComponentButtonBuilder {
        for (const button of buttons) {
            this.addButton(button.button, button.type);
        }
        
        return this;
    }

    public getActionRow(disabled: boolean = false): ActionRowBuilder<MessageActionRowComponentBuilder> {
        const actionRow = super.getActionRow();
        return actionRow.setComponents(this.buttons.map(b => new ButtonBuilder(b).setDisabled(disabled)));
    }

    private _setButtonId(customId: string, type: ComponentButtonType): void {
        this.componentButtons.push({ customId, type });
    }
}
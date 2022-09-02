import { ActionRowBuilder, APIButtonComponentWithCustomId, APISelectMenuComponent, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from 'discord.js';
import { ComponentsBuilderBase, ComponentsBuilderBaseOptions } from '../base/ComponentsBuilderBase';
import { PaginationControllerType } from '../../types/pagination';

export interface PaginationButton {
    button: ButtonBuilder;
    customId: string;
    type: Omit<PaginationControllerType, "CustomButton">;
}

export interface ButtonPaginationComponentsBuilderOptions extends ComponentsBuilderBaseOptions{
    buttons: PaginationButton[];
}

export class ButtonPaginationComponentsBuilder extends ComponentsBuilderBase {
    public buttons: PaginationButton[] = [];

    constructor(options?: ButtonPaginationComponentsBuilderOptions) {
        super(options);

        this.buttons = options?.buttons ?? [];
    }

    /**
     * Add component to pagination action row
     */
    public addMessageComponent(component: ButtonBuilder, type: Omit<PaginationControllerType, "Custom">): this;
    public addMessageComponent(component: MessageActionRowComponentBuilder, type: PaginationControllerType): this {
        if (type == PaginationControllerType.Custom) {
            this._paginationActionRow.addComponents(component);
            return this;
        }

        if (!(component instanceof ButtonBuilder)) throw new Error("Cannot use non button builder as pagination controller");
        if (component.data.style == ButtonStyle.Link) throw new Error("Cannot use link buttons as pagination controller");

        this.buttons.push({
            button: component,
            customId: (component.data as APIButtonComponentWithCustomId).custom_id,
            type
        });
        
        this._paginationActionRow.addComponents(component);
        return this;
    }

    public getActionRow(disabledComponents: boolean = false): ActionRowBuilder<MessageActionRowComponentBuilder> {
        return super.getActionRow().setComponents(this.buttons.map(b => b.button.setDisabled(disabledComponents)));
    }

    public getPaginationActionRows(paginationComponentIndex: number = 0, disabledComponents: boolean = false): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
        if (!this.actionRows.length) return [this.getActionRow(disabledComponents)];

        const actionRows = this.actionRows;
        actionRows.splice(paginationComponentIndex, 0, this._paginationActionRow);

        return actionRows.map(actionRow => {
            const components = (actionRow.data.components as (APIButtonComponentWithCustomId|APISelectMenuComponent)[])?.map(component => {
                if (component.disabled === undefined && disabledComponents) component.disabled = true;

                return component;
            });

            return new ActionRowBuilder<MessageActionRowComponentBuilder>({ components });
        });
    }
}

/**
 * @deprecated Use PaginationComponentBuilder instead
 */
export const ComponentButtonBuilder = ButtonPaginationComponentsBuilder;
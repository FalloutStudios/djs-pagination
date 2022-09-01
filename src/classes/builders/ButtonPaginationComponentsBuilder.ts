import { ActionRowBuilder, APIButtonComponentWithCustomId, APISelectMenuComponent, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder, normalizeArray, RestOrArray, SelectMenuBuilder } from 'discord.js';
import { ComponentsBuilderBase, ComponentsBuilderBaseOptions } from '../base/ComponentsBuilderBase';

export interface PaginationButton {
    button: ButtonBuilder;
    customId: string;
    type: Omit<PaginationButtonType, "CustomButton">;
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
    LastPage,
    /**
     * Custom button
     */
    CustomComponent
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
    public addMessageComponent(component: ButtonBuilder, type: Omit<PaginationButtonType, "CustomComponent">): this;
    public addMessageComponent(component: MessageActionRowComponentBuilder, type: PaginationButtonType): this {
        if (type == PaginationButtonType.CustomComponent) {
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

    public getActionRow(disabledComponents?: boolean): ActionRowBuilder<MessageActionRowComponentBuilder> {
        return super.getActionRow().addComponents(this.buttons.map(b => b.button.setDisabled(disabledComponents)));
    }

    public getPaginationActionRows(paginationComponentIndex?: number, disabledComponents?: boolean): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
        return super.getPaginationActionRows(paginationComponentIndex).map(actionRow => {
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
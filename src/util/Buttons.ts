import { MessageActionRow, MessageButton, CollectorFilter, MessageComponentInteraction } from "discord.js";

export interface Buttons {
    /**
     * First page button
     */
    firstPage?: MessageButton;
    /**
     * Previous page button
     */
    previousPage?: MessageButton;
    /**
     * Next page button
     */
    stopInteraction?: MessageButton;
    /**
     * Next page button
     */
    nextPage?: MessageButton;
    /**
     * Last page button
     */
    lastPage?: MessageButton;
}

export enum ButtonType {
    /**
     * First page button
     */
    FIRST_PAGE = "firstPage",
    /**
     * Previous page button
     */
    PREVIOUS_PAGE = "previousPage",
    /**
     * Next page button
     */
    STOP_INTERACTION = "stopInteraction",
    /**
     * Next page button
     */
    NEXT_PAGE = "nextPage",
    /**
     * Last page button
     */
    LAST_PAGE = "lastPage"
}

export type AddButtonType = PaginationButton | ((button: PaginationButton) => PaginationButton);

export class PaginationButton {
    public filter: CollectorFilter<[MessageComponentInteraction]> = () => false;
    public buttons: Buttons = {
        firstPage: undefined,
        previousPage: undefined,
        stopInteraction: undefined,
        nextPage: undefined,
        lastPage: undefined
    };

    /**
     * 
     * Add a button
     */
    addButton(type: ButtonType, button: MessageButton): PaginationButton {
        if (!button) throw new TypeError("Button is undefined");
        if (button.style === 'LINK') throw new TypeError("Button cannot be a LINK");
        
        this.buttons[type] = button;
        return this;
    }

    /**
     * Returns the buttons in a new MessageActionRow
     */
    getButtons(disabled: boolean = false): MessageActionRow {
        const buttons = new MessageActionRow();

        for (const type of Object.values(this.buttons)) {
            if (type instanceof MessageButton) buttons.addComponents([type.setDisabled(disabled)]);
        }

        return buttons;
    }

    setFilter(customFilter?: () => any, authorIndependentId?: string): PaginationButton {
        if (typeof customFilter === 'function') {
            this.filter = customFilter;
        } else {
            this.filter = (interaction) => 
                (
                    this.buttons.firstPage && this.buttons.firstPage.customId === interaction.customId ||
                    this.buttons.previousPage && this.buttons.previousPage.customId === interaction.customId ||
                    this.buttons.stopInteraction && this.buttons.stopInteraction.customId === interaction.customId ||
                    this.buttons.nextPage && this.buttons.nextPage.customId === interaction.customId ||
                    this.buttons.lastPage && this.buttons.lastPage.customId === interaction.customId
                ) && !!authorIndependentId && interaction.user.id === authorIndependentId || !authorIndependentId;
        }
        return this;
    }
}
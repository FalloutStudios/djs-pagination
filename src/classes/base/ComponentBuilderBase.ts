import { ActionRowBuilder, MessageActionRowComponentBuilder } from 'discord.js';

export interface ComponentBuilderBaseOptions {
    actionRow?: ActionRowBuilder<MessageActionRowComponentBuilder>;
}

export class ComponentBuilderBase {
    public actionRow: ActionRowBuilder<MessageActionRowComponentBuilder> = new ActionRowBuilder<MessageActionRowComponentBuilder>();

    constructor(options?: ComponentBuilderBaseOptions) {
        this.actionRow = options?.actionRow ?? this.actionRow;
    }

    /**
     * Returns the component action row
     */
    public getActionRow(): ActionRowBuilder<MessageActionRowComponentBuilder> {
        return this.actionRow;
    }
}
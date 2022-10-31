// @ts-check
import { randomUUID } from 'crypto';
import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { MessageCommandBuilder } from 'reciple';
import { ButtonPaginationBuilder } from '@falloutstudios/djs-pagination';

export class PaginationModule {
    versions = '^6';
    commands = [];

    onStart(client) {
        const pages = [
            'Content Page',
            new EmbedBuilder()
                .setAuthor({ name: `Embed Page` }),
            {
                content: 'Content and Embed page',
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: `Content and Embed page` })
                ]
            },
            () => new EmbedBuilder().setAuthor({ name: `Dynamic page ${randomUUID()}` })
        ];

        this.commands = [
            new MessageCommandBuilder()
                .setName('paginate')
                .setDescription('Pagination example')
                .setExecute(async data => {
                    const pagination = new ButtonPaginationBuilder()
                        .addPages(pages)
                        .setButtons([
                            {
                                builder: new ButtonBuilder()
                                    .setCustomId('prev')
                                    .setLabel('prev')
                                    .setStyle(ButtonStyle.Secondary),
                                type: 'PreviousPage'
                            },
                            {
                                builder: new ButtonBuilder()
                                    .setCustomId('next')
                                    .setLabel('next')
                                    .setStyle(ButtonStyle.Secondary),
                                type: 'NextPage'
                            }
                        ]);

                    await pagination.paginate(data.message);
                })
        ];

        return true;
    }
}

export default new PaginationModule();
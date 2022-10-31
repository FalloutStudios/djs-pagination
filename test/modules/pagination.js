// @ts-check
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { MessageCommandBuilder, SlashCommandBuilder } from 'reciple';
import { ButtonPaginationBuilder, ReactionPaginationBuilder } from '@falloutstudios/djs-pagination';

export class PaginationModule {
    versions = '^6';
    commands = [];

    onStart(client) {
        const pages = [
            'Page 1',
            'Page 2',
            'Page 3',
            'Page 4',
            'Page 5'
        ];

        /**
         * @type {(import('../../dist/types/types/buttons').RawButton)[]}
         */
        const buttons = [
            {
                builder: new ButtonBuilder()
                    .setCustomId('first')
                    .setLabel('first')
                    .setStyle(ButtonStyle.Primary),
                type: 'FirstPage'
            },
            {
                builder: new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('prev')
                    .setStyle(ButtonStyle.Secondary),
                type: 'PreviousPage'
            },
            {
                builder: new ButtonBuilder()
                    .setCustomId('stop')
                    .setLabel('stop')
                    .setStyle(ButtonStyle.Danger),
                type: 'Stop'
            },
            {
                builder: new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('next')
                    .setStyle(ButtonStyle.Secondary),
                type: 'NextPage'
            },
            {
                builder: new ButtonBuilder()
                    .setCustomId('last')
                    .setLabel('last')
                    .setStyle(ButtonStyle.Primary),
                type: 'LastPage'
            },
        ];

        this.commands = [
            new MessageCommandBuilder()
                .setName('paginate')
                .setDescription('Pagination example')
                .setExecute(async data => {
                    const pagination = new ReactionPaginationBuilder()
                        .addPages(pages)
                        .setAuthorId(data.message.author)
                        .setReactions(
                            {
                                emoji: '⏪',
                                type: 'FirstPage'
                            },
                            {
                                emoji: '⬅',
                                type: 'PreviousPage'
                            },
                            {
                                emoji: '🛑',
                                type: 'Stop'
                            },
                            {
                                emoji: '➡️',
                                type: 'NextPage'
                            },
                            {
                                emoji: '⏩',
                                type: 'LastPage'
                            }
                        )

                    this.paginationListener(pagination);

                    const message = await data.message.channel.send('Sus');
                    await pagination.paginate(message, 'EditMessage');

                    console.log(pagination);
                }),
            new SlashCommandBuilder()
                .setName('paginate')
                .setDescription('Pagination example')
                .setExecute(async data => {
                    const pagination = new ButtonPaginationBuilder()
                        .setPages(pages)
                        .setAuthorId(data.interaction.user)
                        .setOnDisable('DeletePagination')
                        .setButtons(buttons);

                    this.paginationListener(pagination);

                    await data.interaction.deferReply({ ephemeral: true });
                    await pagination.paginate(data.interaction, 'EditMessage');

                    console.log(pagination);
                })
        ];

        return true;
    }

    paginationListener(pagination) {
        pagination.on('pageChange', console.log);
    }
}

export default new PaginationModule();
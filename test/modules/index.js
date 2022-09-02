const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { RecipleScript, MessageCommandBuilder, SlashCommandBuilder } = require('reciple');
const { ButtonPagination, PaginationControllerType, SendAs, ButtonPaginationOnDisableAction } = require('../../dist/');

const options = new ButtonPagination()
    .setOnDisableAction(ButtonPaginationOnDisableAction.DisableComponents)
    .addPages(
        new EmbedBuilder()
            .setTitle('Page 1')
            .setDescription('Description'),
        new EmbedBuilder()
            .setTitle('Page 2')
            .setDescription('Description'),
        new EmbedBuilder()
            .setTitle('Page 3')
            .setDescription('Description'),
        new EmbedBuilder()
            .setTitle('Page 4')
            .setDescription('Description'),
        new EmbedBuilder()
            .setTitle('Page 5')
            .setDescription('Description')
    )
    .addButton(new ButtonBuilder().setCustomId('first').setLabel('First').setStyle(ButtonStyle.Secondary), PaginationControllerType.FirstPage)
    .addButton(new ButtonBuilder().setCustomId('prev').setLabel('Prev').setStyle(ButtonStyle.Primary), PaginationControllerType.PreviousPage)
    .addButton(new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Danger), PaginationControllerType.StopInteraction)
    .addButton(new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary), PaginationControllerType.NextPage)
    .addButton(new ButtonBuilder().setCustomId('last').setLabel('Last').setStyle(ButtonStyle.Secondary), PaginationControllerType.LastPage);

console.log(options);

/**
 * @implements {RecipleScript}
 */
class Test {
    constructor() {
        this.versions = '5.x.x';
        this.commands = [
            new MessageCommandBuilder()
                .setName('test')
                .setDescription('Test command')
                .setExecute(command => {
                    const pagination = options.clonePagination();

                    pagination.on('ready', () => console.log('Ready!'));
                    pagination.on('collectorEnd', () => console.log('End!'));
                    pagination.on('interactionCreate', (type, button) => console.log(type, button.customId));

                    pagination.paginate(command.message);
                }),
            new SlashCommandBuilder()
                .setName('test')
                .setDescription('Test command')
                .setExecute(async command => {
                    const pagination = options.clonePagination();

                    pagination.on('ready', () => console.log('Ready!'));
                    pagination.on('collectorEnd', () => console.log('End!'));
                    pagination.on('interactionCreate', (type, button) => console.log(type, button));

                    pagination.pages = pagination.pages.map(p => ({ ...p, ephemeral: true }));

                    pagination.paginate(command.interaction, SendAs.ReplyMessage);
                })
        ];
    }

    onStart() {
        return true;
    }
}

module.exports = new Test();
const { ButtonBuilder } = require('discord.js');
const { RecipleScript, MessageCommandBuilder, SlashCommandBuilder } = require('reciple');
const { ButtonPagination } = require('../../dist');

const options = new ButtonPagination()
    .addPages(
        { embeds: [{ title: 'Page 1' }] },
        { embeds: [{ title: 'Page 2' }] },
        { embeds: [{ title: 'Page 3' }] },
        { embeds: [{ title: 'Page 4' }] },
        { embeds: [{ title: 'Page 5' }] },
    )
    .setOnDisableAction('DeleteComponents')
    .addButton(new ButtonBuilder().setCustomId('FirstPage').setEmoji('⏪'), 'FirstPage')
    .addButton(new ButtonBuilder().setCustomId('PrevPage').setEmoji('⬅️'), 'PreviousPage')
    .addButton(new ButtonBuilder().setCustomId('StopInteraction').setEmoji('⛔'), 'StopInteraction')
    .addButton(new ButtonBuilder().setCustomId('NextPage').setEmoji('➡️'), 'NextPage')
    .addButton(new ButtonBuilder().setCustomId('LastPage').setEmoji('⏩'), 'LastPage');

/**
 * @implements {RecipleScript}
 */
class Test {
    constructor() {
        this.versions = '5.x.x';
        this.commands = [
            new MessageCommandBuilder()
                .setName('button-pagination')
                .setDescription('Test command')
                .setExecute(command => {
                    const pagination = options.clonePagination();

                    pagination.on('ready', () => console.log('Ready!'));
                    pagination.on('collectorEnd', () => console.log('End!'));

                    pagination.paginate(command.message);
                }),
            new SlashCommandBuilder()
                .setName('button-pagination')
                .setDescription('Test command')
                .setExecute(async command => {
                    const pagination = options.clonePagination();

                    pagination.on('ready', () => console.log('Ready!'));
                    pagination.on('collectorEnd', () => console.log('End!'));

                    pagination.pages = pagination.pages.map(e => ({ ...e, ephemeral: true }));
                    pagination.paginate(command.interaction);
                })
        ];
    }

    onStart() {
        return true;
    }
}

module.exports = new Test();
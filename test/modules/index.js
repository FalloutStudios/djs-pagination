const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { RecipleScript, MessageCommandBuilder, SlashCommandBuilder } = require('reciple');
const { ButtonPagination, PaginationControllerType, ReactionPagination, SendAs, ButtonPaginationOnDisableAction } = require('../../dist/');

const options = new ReactionPagination()
    .addPages(
        { embeds: [{ title: 'Page 1' }] },
        { embeds: [{ title: 'Page 2' }] },
        { embeds: [{ title: 'Page 3' }] },
        { embeds: [{ title: 'Page 4' }] },
        { embeds: [{ title: 'Page 5' }] },
    )
    .setOnDisableAction('ClearAllReactions')
    .addReaction('⬅️', 'PreviousPage')
    .addReaction('➡️', 'NextPage')
    .addReaction('⛔', 'StopInteraction')
    .addReaction('⏪', 'FirstPage')
    .addReaction('⏩', 'LastPage');

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
                    pagination.on('reactionAdd', (type, button) => console.log(type, button.customId));

                    pagination.paginate(command.message);
                }),
            new SlashCommandBuilder()
                .setName('test')
                .setDescription('Test command')
                .setExecute(async command => {
                    const pagination = options.clonePagination();

                    pagination.on('ready', () => console.log('Ready!'));
                    pagination.on('collectorEnd', () => console.log('End!'));
                    pagination.on('reactionAdd', (type, button) => console.log(type, button));

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
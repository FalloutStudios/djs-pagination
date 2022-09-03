const { RecipleScript, MessageCommandBuilder, SlashCommandBuilder } = require('reciple');
const { ReactionPagination } = require('../../dist');

const options = new ReactionPagination()
    .addPages(
        { embeds: [{ title: 'Page 1' }] },
        { embeds: [{ title: 'Page 2' }] },
        { embeds: [{ title: 'Page 3' }] },
        { embeds: [{ title: 'Page 4' }] },
        { embeds: [{ title: 'Page 5' }] },
    )
    .setOnDisableAction('ClearAllReactions')
    .addReaction('⏪', 'FirstPage')
    .addReaction('⬅️', 'PreviousPage')
    .addReaction('⛔', 'StopInteraction')
    .addReaction('➡️', 'NextPage')
    .addReaction('⏩', 'LastPage');

/**
 * @implements {RecipleScript}
 */
class Test {
    constructor() {
        this.versions = '5.x.x';
        this.commands = [
            new MessageCommandBuilder()
                .setName('reaction-pagination')
                .setDescription('Test command')
                .setExecute(command => {
                    const pagination = options.clonePagination();

                    pagination.on('ready', () => console.log('Ready!'));
                    pagination.on('collectorEnd', () => console.log('End!'));

                    pagination.paginate(command.message);
                }),
            new SlashCommandBuilder()
                .setName('reaction-pagination')
                .setDescription('Test command')
                .setExecute(async command => {
                    const pagination = options.clonePagination();

                    pagination.on('ready', () => console.log('Ready!'));
                    pagination.on('collectorEnd', () => console.log('End!'));

                    pagination.paginate(command.interaction);
                })
        ];
    }

    onStart() {
        return true;
    }
}

module.exports = new Test();
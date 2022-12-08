// @ts-check
import axios from "axios";
import { ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from "reciple"
import { ButtonPaginationBuilder } from "@falloutstudios/djs-pagination";

export class MemeModule {
    async getMeme() {
        const request = (await axios.get('https://meme-api.com/gimme/dankmemes'));
        const embed = new EmbedBuilder();

        if (request.status !== 200) return embed.setAuthor({ name: `An error occured` }).setColor('Red');

        return {
            embeds: [
                embed
                    .setAuthor({ name: `r/${request.data.subreddit}`, url: request.data.postLink })
                    .setTitle(request.data.title)
                    .setURL(request.data.postLink)
                    .setImage(request.data.url)
                    .setFooter({ text: `🔼 ${request.data.ups} ┃ u/${request.data.author}` })
            ],
            ephemeral: true
        };
    }

    versions = ['^6'];
    commands = [
        new SlashCommandBuilder()
            .setName('meme')
            .setDescription('Get some random meme')
            .setExecute(async data => {
                const pagination = new ButtonPaginationBuilder({
                    pages: [
                        async () => this.getMeme()
                    ],
                    buttons: [
                        {
                            builder: new ButtonBuilder().setLabel(`Refresh`).setCustomId('refresh').setStyle(ButtonStyle.Secondary),
                            type: 'NextPage'
                        },
                        {
                            builder: new ButtonBuilder().setLabel('Stop').setCustomId('stop').setStyle(ButtonStyle.Danger),
                            type: 'Stop'
                        }
                    ],
                    timer: 1000 * 20,
                    onDisable: 'DeletePagination',
                    singlePageNoButtons: false
                });

                await pagination.paginate(data.interaction, 'ReplyMessage');
            })
    ]

    onStart() { return true; }
}

export default new MemeModule();
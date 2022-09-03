# Djs Pagination
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@ghextercortes/djs-pagination?style=flat-square)
![GitHub](https://img.shields.io/github/license/GhexterCortes/djs-pagination?style=flat-square)
![npm (scoped)](https://img.shields.io/npm/v/@ghextercortes/djs-pagination?label=Latest%20Version&style=flat-square)

Simple pagination for Discord.js 14.

## Installation
```bash
npm i @ghextercortes/djs-pagination
```

## Pagination Builders Example

#### Button Pagination

```js
const { ButtonPagination } = require("@ghextercortes/djs-pagination");
const { EmbedBuilder } = require("discord.js");

const pagination = new ButtonPagination()
    .addPages(
        'String page', // Will be converted to { content: 'String page' }
        {
            content: 'Custom page',
            embeds: [
                new EmbedBuilder()
                    .setTitle("Embed Builder"),
                {
                    title: `Embed builder data`
                }
            ]
        },
        new EmbedBuilder()  // Will be converted to { embeds: [ new EmbedBuilder().setTitle("Embed Builder] }
            .setTitle("Embed Builder")
    )
    .addButton(new ButtonBuilder().setCustomId('FirstPage').setEmoji('⏪').setStyle(ButtonStyle.Secondary), 'FirstPage')
    .addButton(new ButtonBuilder().setCustomId('PrevPage').setEmoji('⬅️').setStyle(ButtonStyle.Primary), 'PreviousPage')
    .addButton(new ButtonBuilder().setCustomId('StopInteraction').setEmoji('⛔').setStyle(ButtonStyle.Danger), 'StopInteraction')
    .addButton(new ButtonBuilder().setCustomId('NextPage').setEmoji('➡️').setStyle(ButtonStyle.Primary), 'NextPage')
    .addButton(new ButtonBuilder().setCustomId('LastPage').setEmoji('⏩').setStyle(ButtonStyle.Secondary), 'LastPage');

pagination.paginate(message);
// or
pagination.paginate(interaction);
```

### Reaction Pagination

```js
const { ReactionPagination } = require("@ghextercortes/djs-pagination");
const { EmbedBuilder } = require("dicord.js");

const pagination = new ReactionPagination()
    .addPages(
        'String page', // Will be converted to { content: 'String page' }
        {
            content: 'Custom page',
            embeds: [
                new EmbedBuilder()
                    .setTitle("Embed Builder"),
                {
                    title: `Embed builder data`
                }
            ]
        },
        new EmbedBuilder()  // Will be converted to { embeds: [ new EmbedBuilder().setTitle("Embed Builder] }
            .setTitle("Embed Builder")
    )
    .addReaction('⏪', 'FirstPage')
    .addReaction('⬅️', 'PreviousPage')
    .addReaction('⛔', 'StopInteraction')
    .addReaction('➡️', 'NextPage')
    .addReaction('⏩', 'LastPage');

pagination.paginate(message);
// or
pagination.paginate(interaction);
```
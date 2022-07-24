# Djs Pagination
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@ghextercortes/djs-pagination?style=flat-square)
![GitHub](https://img.shields.io/github/license/GhexterCortes/djs-pagination?style=flat-square)
![npm (scoped)](https://img.shields.io/npm/v/@ghextercortes/djs-pagination?label=Latest%20Version&style=flat-square)

Simple pagination for Discord.js 14 written in TypeScript.

## Installation
```bash
npm i @ghextercortes/djs-pagination
```

## Pagination Builder

Typescript
```typescript
import { ButtonPagination, PaginationButtonType, OnDisableAction } from '@ghextercortes/djs-pagination';
import { EmbedBuilder, ButtonBuilder } from 'discord.js';

// Create a new Pagination
const pagination = new ButtonPagination()
    // Adds pages to the pagination
    .addPages(
        new EmbedBuilder().setTitle('Embed Page').setDescription('some text'),
        { content: 'Message data', embeds: [ new EmbedBuilder().setTitle('Embed Page') ] },
        'String page'
    )

    // Sets the buttons
    .addButton(new ButtonBuilder().setCustomId('first').setLabel('First').setStyle(ButtonStyle.Secondary), PaginationButtonType.FirstPage)
    .addButton(new ButtonBuilder().setCustomId('prev').setLabel('Prev').setStyle(ButtonStyle.Primary), PaginationButtonType.PreviousPage)
    .addButton(new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Danger), PaginationButtonType.StopInteraction)
    .addButton(new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary), PaginationButtonType.NextPage)
    .addButton(new ButtonBuilder().setCustomId('last').setLabel('Last').setStyle(ButtonStyle.Secondary), PaginationButtonType.LastPage)

    // No interaction timeout
    .setTimer(20000)
    
    // What to do when the pagination is disabled
    .setOnDisableAction(OnDisableAction.DisableComponents);

// Sends the pagination
pagination.paginate(Message|Interaction);
```

CommonJS
```javascript
const { ButtonPagination, PaginationButtonType, OnDisableAction } = require('@ghextercortes/djs-pagination');
const { EmbedBuilder, ButtonBuilder } = require('discord.js');

// Create a new Pagination
const pagination = new ButtonPagination()
    // Adds pages to the pagination
    .addPages(
        new EmbedBuilder().setTitle('Embed Page').setDescription('some text'),
        { content: 'Message data', embeds: [ new EmbedBuilder().setTitle('Embed Page') ] },
        'String page'
    )

    // Sets the buttons
    .addButton(new ButtonBuilder().setCustomId('first').setLabel('First').setStyle(ButtonStyle.Secondary), PaginationButtonType.FirstPage)
    .addButton(new ButtonBuilder().setCustomId('prev').setLabel('Prev').setStyle(ButtonStyle.Primary), PaginationButtonType.PreviousPage)
    .addButton(new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Danger), PaginationButtonType.StopInteraction)
    .addButton(new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary), PaginationButtonType.NextPage)
    .addButton(new ButtonBuilder().setCustomId('last').setLabel('Last').setStyle(ButtonStyle.Secondary), PaginationButtonType.LastPage)

    // No interaction timeout
    .setTimer(20000)
    
    // What to do when the pagination is disabled
    .setOnDisableAction(OnDisableAction.DisableComponents);

// Sends the pagination
pagination.paginate(Message|Interaction);
```

## Pagination Builder Options

Typescript
```typescript
import { ButtonPagination, PaginationButtonType, OnDisableAction, ComponentButtonBuilder } from '@ghextercortes/djs-pagination';
import { EmbedBuilder, ButtonBuilder } from 'discord.js';


const pagination = new ButtonPagination({
    buttons: new ComponentButtonBuilder()
        .addButton(new ButtonBuilder().setCustomId('first').setLabel('First').setStyle(ButtonStyle.Secondary), PaginationButtonType.FirstPage)
        .addButton(new ButtonBuilder().setCustomId('prev').setLabel('Prev').setStyle(ButtonStyle.Primary), PaginationButtonType.PreviousPage)
        .addButton(new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Danger), PaginationButtonType.StopInteraction)
        .addButton(new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary), PaginationButtonType.NextPage)
        .addButton(new ButtonBuilder().setCustomId('last').setLabel('Last').setStyle(ButtonStyle.Secondary), PaginationButtonType.LastPage),
    pages: [
        new EmbedBuilder().setTitle('Page Embed'),
        'String page',
        { embeds: [new EmbedBuilder().setTitle('Multiple Embed'), new EmbedBuilder().setTitle('Multiple Embed')] }
    ],
    onDisable: OnDisableAction.DeleteComponents,
    authorIndependent: true,
    singlePageNoButtons: true,
    timer: 30000
});
```

CommonJS
```javascript
const { ButtonPagination, PaginationButtonType, OnDisableAction, ComponentButtonBuilder } = require('@ghextercortes/djs-pagination');
const { EmbedBuilder, ButtonBuilder } = require('discord.js');


const pagination = new ButtonPagination({
    buttons: new ComponentButtonBuilder()
        .addButton(new ButtonBuilder().setCustomId('first').setLabel('First').setStyle(ButtonStyle.Secondary), PaginationButtonType.FirstPage)
        .addButton(new ButtonBuilder().setCustomId('prev').setLabel('Prev').setStyle(ButtonStyle.Primary), PaginationButtonType.PreviousPage)
        .addButton(new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Danger), PaginationButtonType.StopInteraction)
        .addButton(new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary), PaginationButtonType.NextPage)
        .addButton(new ButtonBuilder().setCustomId('last').setLabel('Last').setStyle(ButtonStyle.Secondary), PaginationButtonType.LastPage),
    pages: [
        new EmbedBuilder().setTitle('Page Embed'),
        'String page',
        { embeds: [new EmbedBuilder().setTitle('Multiple Embed'), new EmbedBuilder().setTitle('Multiple Embed')] }
    ],
    onDisable: OnDisableAction.DeleteComponents,
    authorIndependent: true,
    singlePageNoButtons: true,
    timer: 30000
});
```
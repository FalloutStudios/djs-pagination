# Djs Pagination
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@ghextercortes/djs-pagination?style=flat-square)
![GitHub](https://img.shields.io/github/license/GhexterCortes/djs-pagination?style=flat-square)
![npm (scoped)](https://img.shields.io/npm/v/@ghextercortes/djs-pagination?label=Latest%20Version&style=flat-square)

Simple pagination for Discord.js written in TypeScript.

For more simple pagination you can use the [discordjs-pagination](https://github.com/acegoal07/discordjs-pagination) package.

## Installation
```bash
npm i @ghextercortes/djs-pagination
```

## Examples

Typescript
```typescript
import { Pagination, ButtonType, OnDisableAction } from '@ghextercortes/djs-pagination';

// Create a new Pagination
const pagination = new Pagination()
    // Adds pages to the pagination
    .addPage(new MessageEmbed().setTitle('Page 1').setDescription('This is page 1'), 'Page 1')
    .addPage(new MessageEmbed().setTitle('Page 2').setDescription('This is page 2'), 'Page 2')
    .addPage(new MessageEmbed().setTitle('Page 3').setDescription('This is page 3'), 'Page 3')

    // Sets the buttons
    .setButtons((buttons) => buttons
        .addButton(ButtonType.FIRST_PAGE, new MessageButton().setCustomId('f').setLabel('First Page').setStyle('PRIMARY'))
        .addButton(ButtonType.PREVIOUS_PAGE, new MessageButton().setCustomId('p').setLabel('Previous Page').setStyle('PRIMARY'))
        .addButton(ButtonType.STOP_INTERACTION, new MessageButton().setCustomId('s').setLabel('Stop').setStyle('DANGER'))
        .addButton(ButtonType.NEXT_PAGE, new MessageButton().setCustomId('n').setLabel('Next Page').setStyle('PRIMARY'))
        .addButton(ButtonType.LAST_PAGE, new MessageButton().setCustomId('l').setLabel('Last Page').setStyle('PRIMARY'))
    )

    // No interaction timeout
    .setTimer(10000)
    
    // What to do when the pagination is disabled
    .setOnDisableAction(OnDisableAction.DISABLE_BUTTONS);

// Sends the pagination
pagination.paginate(Message|Interaction);
```

Javascript
```typescript
const { Pagination, ButtonType, OnDisableAction } = require('@ghextercortes/djs-pagination');

// Create a new Pagination
const pagination = new Pagination()
    // Adds pages to the pagination
    .addPage(new MessageEmbed().setTitle('Page 1').setDescription('This is page 1'), 'Page 1')
    .addPage(new MessageEmbed().setTitle('Page 2').setDescription('This is page 2'), 'Page 2')
    .addPage(new MessageEmbed().setTitle('Page 3').setDescription('This is page 3'), 'Page 3')

    // Sets the buttons
    .setButtons((buttons) => buttons
        .addButton(ButtonType.FIRST_PAGE, new MessageButton().setCustomId('f').setLabel('First Page').setStyle('PRIMARY'))
        .addButton(ButtonType.PREVIOUS_PAGE, new MessageButton().setCustomId('p').setLabel('Previous Page').setStyle('PRIMARY'))
        .addButton(ButtonType.STOP_INTERACTION, new MessageButton().setCustomId('s').setLabel('Stop').setStyle('DANGER'))
        .addButton(ButtonType.NEXT_PAGE, new MessageButton().setCustomId('n').setLabel('Next Page').setStyle('PRIMARY'))
        .addButton(ButtonType.LAST_PAGE, new MessageButton().setCustomId('l').setLabel('Last Page').setStyle('PRIMARY'))
    )

    // No interaction timeout
    .setTimer(10000)
    
    // What to do when the pagination is disabled
    .setOnDisableAction(OnDisableAction.DISABLE_BUTTONS);

// Sends the pagination
pagination.paginate(Message|Interaction);
```

# Pagination Constructor

Simple documentation for the Pagination constructor.

## Methods

### addPage
Adds embed to the pagination.
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|page|[MessageEmbed](https://discord.js.org/#/docs/main/stable/class/MessageEmbed)|Yes|None|The embed to add to the pagination|
|content|[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)|No|None|The content of the page|

### setButtons
Sets The buttons for the pagination.
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|builder|[AddButtonType](https://github.com/GhexterCortes/djs-pagination/blob/main/src/util/Buttons.ts#L26)|Yes|[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)([PaginationButton](#BuilderConstructor))\|[PaginationButton](#BuilderConstructor)|The builder function or constructor to create the buttons|

<details>
    <summary>Builder constructor</summary>

******
# Builder Constructor
Button builder constructor.
## Methods
### addButton
Adds a button to the pagination.
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|type|[AddButtonType](https://github.com/GhexterCortes/djs-pagination/blob/main/src/util/Buttons.ts#L26)|Yes|None|The type of button to add|
|button|[MessageButton](https://discord.js.org/#/docs/main/stable/class/MessageButton)|Yes|None|The button to add|

### getButtons
Gets the buttons for the pagination and returns [MessageActionRow](https://discord.js.org/#/docs/main/stable/class/MessageActionRow).
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|disabled|[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)|No|false|Disable buttons|

### setFilter
Sets the filter for the pagination.
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|customFilter|[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)|No|None|The filter function|

## Properties
### buttons
Buttons for the pagination.
Type: [Buttons](https://github.com/GhexterCortes/djs-pagination/blob/main/src/util/Buttons.ts#L3)

### filter
Filter for the pagination.
Type: [CollectorFilter](https://discord.js.org/#/docs/main/stable/typedef/CollectorFilter)<[[MessageComponentInteraction](https://discord.js.org/#/docs/main/stable/class/MessageComponentInteraction)]>
******
</details>

### setAuthorIndependent
Set if the pagination should allow only the author of parent message to interact with it
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|authorIndependent|[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)|Yes|false|If the pagination should allow only the author of parent message to interact with it|

### setAuthor
Sets the pagination author.
> This is automatically set but can be changed.

|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|author|[UserResolvable](https://discord.js.org/#/docs/main/stable/typedef/UserResolvable)|Yes|None|The author of the pagination|

### setMaxInteractions
Sets the maximum interactions for the pagination.
> Max interaction is not limited by default.

|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|max|[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)|Yes|None|The maximum interactions|

### setTimer
Sets inactivity timeout for the pagination.
> Timeout is set to 60000ms.

|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|interval|[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)|Yes|60000|The timeout in milliseconds. The lowest is 3000ms|

### setOnDisableAction
Sets the action when the pagination collector ended.
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|action|[OnDisableAction](https://github.com/GhexterCortes/djs-pagination/blob/main/src/index.ts#L6)|Yes|OnDisableAction.DISABLE_BUTTONS|The action to do when the pagination collector ended|

### paginate `Async`
Sends the pagination.
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|parent|[Message](https://discord.js.org/#/docs/main/stable/class/Message)\|[CommandInteraction](https://discord.js.org/#/docs/main/stable/class/CommandInteraction)\|[ButtonInteraction](https://discord.js.org/#/docs/main/stable/class/ButtonInteraction)|Yes|None|The parent message|
|sendAs|[SendAs](https://github.com/GhexterCortes/djs-pagination/blob/main/src/index.ts#L25)|No|SendAs.REPLY_MESSAGE|The send as type|

### setCurrentPage `Async`
Set Pagination's current page
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|page|[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)|Yes|None|The page number|
|addButtons|[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)|No|true|If the buttons should be added to the page|
|disabledButtons|[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)|No|false|If the buttons should be disabled|

### getCurrentPage
Returns the current page options.
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|addButtons|[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)|No|true|If the buttons should be added to the page|
|disabledButtons|[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)|No|false|If the buttons should be disabled|

<details>
    <summary>Private</summary>

### addButtons
Returns message options with buttons
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|options|any|Yes|None|The message options|
|disabled|[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)|No|false|If the buttons should be disabled|
|removeButtons|[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)|No|false|If the buttons should be removed|

### getAuthor
Get the author from parent message
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|parent|[Message](https://discord.js.org/#/docs/main/stable/class/Message)\|[CommandInteraction](https://discord.js.org/#/docs/main/stable/class/CommandInteraction)\|[ButtonInteraction](https://discord.js.org/#/docs/main/stable/class/ButtonInteraction)|Yes|None|The parent message|

### addCollector `Async`
Adds collector to sent pagination message.


### send `Async`
Sends the pagination.
|Param|Type|Required|Default|Description|
|---|---|---|---|---|
|sendAs|[SendAs](https://github.com/GhexterCortes/djs-pagination/blob/main/src/index.ts#L25)|No|SendAs.REPLY_MESSAGE|The send as type|
</details>

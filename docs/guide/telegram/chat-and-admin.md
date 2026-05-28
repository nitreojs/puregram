---
title: chat & admin
description: ChatPermissions, ChatAdministratorRights, MenuButton, and BotCommands factories for managing chat settings and bot configuration
---

# chat & admin

four factories for the bits of chat and bot management that show up regularly: `ChatPermissions`, `ChatAdministratorRights`, `MenuButton`, and `BotCommands`

```ts
import { ChatPermissions } from 'puregram'

// mute a member — allow nothing
await tg.api.restrictChatMember({
  chat_id,
  user_id,
  permissions: ChatPermissions.denyAll()
})
```

## ChatPermissions

`ChatPermissions` builds the `TelegramChatPermissions` object passed to `restrictChatMember`, `setChatPermissions`, and `createChatInviteLink`. rather than enumerating every field by hand, start from `allowAll` or `denyAll` and override only the ones that differ

### factories

| factory | what it builds |
|---|---|
| `ChatPermissions.allowAll(overrides?)` | every permission `true`; pass partial camelCase overrides to flip individual fields off |
| `ChatPermissions.denyAll(overrides?)` | every permission `false`; pass partial camelCase overrides to flip individual fields on |

```ts
import { ChatPermissions } from 'puregram'

// allow everything
await tg.api.setChatPermissions({
  chat_id,
  permissions: ChatPermissions.allowAll()
})

// deny everything except text messages
await tg.api.restrictChatMember({
  chat_id,
  user_id,
  permissions: ChatPermissions.denyAll({ canSendMessages: true })
})

// restrict to text + polls only
await tg.api.restrictChatMember({
  chat_id,
  user_id,
  permissions: ChatPermissions.denyAll({
    canSendMessages: true,
    canSendPolls: true
  })
})
```

the overrides object uses camelCase keys matching the `TelegramChatPermissions` fields without underscores — `canSendMessages`, `canSendPolls`, `canPinMessages`, `canManageTopics`, etc.

::: tip every field is explicit
both factories emit an exhaustive object — no field is left `undefined`. this matters because telegram interprets missing fields as "unchanged" in some contexts, which can produce surprising results when you expect a full reset
:::

## ChatAdministratorRights

`ChatAdministratorRights` builds the `TelegramChatAdministratorRights` object for `promoteChatMember`, `setMyDefaultAdministratorRights`, and similar methods

unlike `ChatPermissions`, the bot-api schema has eleven **required** fields here — the factories always fill them. optional fields (`canPostMessages`, `canEditMessages`, `canPinMessages`, `canManageTopics`, `canManageDirectMessages`, `canManageTags`) apply to channels, groups, or supergroups respectively

### factories

| factory | what it builds |
|---|---|
| `ChatAdministratorRights.allowAll(overrides?)` | every right `true`, including optional fields |
| `ChatAdministratorRights.denyAll(overrides?)` | required rights `false`; optional fields omitted entirely |

```ts
import { ChatAdministratorRights } from 'puregram'

// set default administrator rights — full admin
await tg.api.setMyDefaultAdministratorRights({
  rights: ChatAdministratorRights.allowAll()
})

// promote a member — all rights but not anonymous
await tg.api.promoteChatMember({
  chat_id,
  user_id,
  ...ChatAdministratorRights.allowAll({ isAnonymous: false })
})

// minimal admin — can only manage the chat
await tg.api.promoteChatMember({
  chat_id,
  user_id,
  ...ChatAdministratorRights.denyAll({ canManageChat: true })
})
```

## MenuButton

`MenuButton` builds the `TelegramMenuButton` discriminated union for `setChatMenuButton` and `getChatMenuButton`. there are three variants

### factories

| factory | what it builds |
|---|---|
| `MenuButton.default()` | clears any per-chat override; falls back to bot-wide default |
| `MenuButton.commands()` | shows the bot's command list |
| `MenuButton.webApp(text, url)` | launches a web app at `url`, button label is `text` |

```ts
import { MenuButton } from 'puregram'

// open a web app from the menu button
await tg.api.setChatMenuButton({
  chat_id,
  menu_button: MenuButton.webApp('open app', 'https://example.com')
})

// reset to command list
await tg.api.setChatMenuButton({
  chat_id,
  menu_button: MenuButton.commands()
})

// clear per-chat override
await tg.api.setChatMenuButton({
  chat_id,
  menu_button: MenuButton.default()
})
```

## BotCommands

`BotCommands` builds individual `TelegramBotCommand` entries and scopes for `setMyCommands`, `deleteMyCommands`, and `getMyCommands`. scopes live under `BotCommands.scope`

```ts
import { BotCommands } from 'puregram'

await tg.api.setMyCommands({
  commands: [
    BotCommands.command('start', 'start the bot'),
    BotCommands.command('help', 'show help')
  ]
})
```

### BotCommands.scope — targeting specific audiences

`BotCommands.scope` is a nested class with static factories for every `BotCommandScope` variant

| factory | who sees the commands |
|---|---|
| `BotCommands.scope.default()` | fallback — everyone without a narrower match |
| `BotCommands.scope.allPrivateChats()` | all private chats |
| `BotCommands.scope.allGroupChats()` | all group and supergroup chats |
| `BotCommands.scope.allChatAdministrators()` | all admins across all groups/supergroups |
| `BotCommands.scope.chat(chatId)` | a specific chat |
| `BotCommands.scope.chatAdministrators(chatId)` | all admins of a specific chat |
| `BotCommands.scope.chatMember(chatId, userId)` | a specific member of a specific chat |

```ts
// separate command lists per scope
await tg.api.setMyCommands({
  commands: [BotCommands.command('start', 'start the bot')],
  scope: BotCommands.scope.allPrivateChats()
})

await tg.api.setMyCommands({
  commands: [
    BotCommands.command('pin', 'pin a message'),
    BotCommands.command('ban', 'ban a user')
  ],
  scope: BotCommands.scope.allChatAdministrators()
})

// commands visible only to a specific user in a specific chat
await tg.api.setMyCommands({
  commands: [BotCommands.command('debug', 'run diagnostics')],
  scope: BotCommands.scope.chatMember(CHAT_ID, ADMIN_USER_ID)
})
```

::: tip scope resolution order
telegram resolves commands from narrowest to widest scope. a `chatMember` scope beats `chat`, which beats `allChatAdministrators`, which beats `default`. register specific overrides first; the broader fallback fills in the rest
:::

## see also

- [keyboards](/guide/telegram/keyboards) — `InlineKeyboard`, `Keyboard`, `ForceReply`
- [messages & media](/guide/telegram/messages-and-media) — sending messages
- [methods](/api/methods) — full generated method list

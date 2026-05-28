---
title: service events
description: message-derived update kinds dispatched when a TelegramMessage payload carries a matching service field — new_chat_members, left_chat_member, pinned_message, video-chat events, and more
---

# service events

a **service event** is a telegram update where the payload arrives as a `message` but carries a special field — `new_chat_members`, `pinned_message`, `video_chat_started`, etc. — that signals a group lifecycle action rather than a user-authored message. puregram promotes these to their own update kinds, dispatched as dedicated `tg.on<Kind>` handlers just like any other update

```ts
tg.onNewChatMembers((update) => {
  const names = update.newChatMembers?.map(u => u.firstName).join(', ')
  return update.send(`welcome, ${names}!`)
})

tg.onLeftChatMember((update) => {
  return update.send(`${update.leftChatMember?.firstName} left`)
})
```

## how service events are dispatched

when a `message` payload arrives from telegram, the update builder checks whether the payload contains a service-event field. if it does, the payload is instantiated as the service event's class instead of `MessageUpdate`. the full field-check order follows `SERVICE_EVENT_ORDER` from `@puregram/api`

the check is done on `message`, `edited_message`, `channel_post`, and `edited_channel_post` payloads — the four kinds that telegram reuses for service signals

::: tip they share MessageShared
service event classes extend `MessageShared` — the same base as `MessageUpdate`. that means all the message helpers (`send`, `reply`, `delete`, `pin`, `from`, `chat`, `id`) are available on every service event update, without having to cast
:::

## all service events

| kind | class | telegram field | description |
| --- | --- | --- | --- |
| `new_chat_members` | `NewChatMembersUpdate` | `new_chat_members` | users joined the group |
| `left_chat_member` | `LeftChatMemberUpdate` | `left_chat_member` | user left or was removed |
| `new_chat_title` | `NewChatTitleUpdate` | `new_chat_title` | group title was changed |
| `new_chat_photo` | `NewChatPhotoUpdate` | `new_chat_photo` | group photo was changed |
| `delete_chat_photo` | `DeleteChatPhotoUpdate` | `delete_chat_photo` | group photo was deleted |
| `group_chat_created` | `GroupChatCreatedUpdate` | `group_chat_created` | group was created |
| `pinned_message` | `PinnedMessageUpdate` | `pinned_message` | a message was pinned |
| `invoice` | `InvoiceUpdate` | `invoice` | invoice for a payment |
| `successful_payment` | `SuccessfulPaymentUpdate` | `successful_payment` | payment completed |
| `users_shared` | `UsersSharedUpdate` | `users_shared` | users shared via a keyboard button |
| `chat_shared` | `ChatSharedUpdate` | `chat_shared` | chat shared via a keyboard button |
| `web_app_data` | `WebAppDataUpdate` | `web_app_data` | data sent from a web app |
| `video_chat_scheduled` | `VideoChatScheduledUpdate` | `video_chat_scheduled` | video chat was scheduled |
| `video_chat_started` | `VideoChatStartedUpdate` | `video_chat_started` | video chat started |
| `video_chat_ended` | `VideoChatEndedUpdate` | `video_chat_ended` | video chat ended |
| `video_chat_participants_invited` | `VideoChatParticipantsInvitedUpdate` | `video_chat_participants_invited` | participants were invited |
| `forum_topic_created` | `ForumTopicCreatedUpdate` | `forum_topic_created` | forum topic was created |
| `forum_topic_edited` | `ForumTopicEditedUpdate` | `forum_topic_edited` | forum topic was edited |
| `forum_topic_closed` | `ForumTopicClosedUpdate` | `forum_topic_closed` | forum topic was closed |
| `forum_topic_reopened` | `ForumTopicReopenedUpdate` | `forum_topic_reopened` | forum topic was reopened |
| `general_forum_topic_hidden` | `GeneralForumTopicHiddenUpdate` | `general_forum_topic_hidden` | general topic hidden |
| `general_forum_topic_unhidden` | `GeneralForumTopicUnhiddenUpdate` | `general_forum_topic_unhidden` | general topic unhidden |
| `giveaway_created` | `GiveawayCreatedUpdate` | `giveaway_created` | giveaway started |
| `giveaway_completed` | `GiveawayCompletedUpdate` | `giveaway_completed` | giveaway ended |
| `giveaway_winners` | `GiveawayWinnersUpdate` | `giveaway_winners` | giveaway winners announced |
| `boost_added` | `BoostAddedUpdate` | `boost_added` | user boosted the chat |
| `message_auto_delete_timer_changed` | `MessageAutoDeleteTimerChangedUpdate` | `message_auto_delete_timer_changed` | auto-delete timer changed |
| `migrate_to_chat_id` | `MigrateToChatIdUpdate` | `migrate_to_chat_id` | group migrated to supergroup |
| `migrate_from_chat_id` | `MigrateFromChatIdUpdate` | `migrate_from_chat_id` | supergroup migrated from group |
| `passport_data` | `PassportDataUpdate` | `passport_data` | telegram passport data |
| `proximity_alert_triggered` | `ProximityAlertTriggeredUpdate` | `proximity_alert_triggered` | proximity alert triggered |
| `write_access_allowed` | `WriteAccessAllowedUpdate` | `write_access_allowed` | bot was given write access |

## registering handlers

use the generated `tg.on<Kind>` dispatcher for each event. the kind string is the same as the field name, camelCased into `on` + PascalCase:

```ts
tg.onPinnedMessage(async (update) => {
  // update.pinnedMessage is the pinned TelegramMessage
  console.log('pinned:', update.pinnedMessage?.id)
})

tg.onVideoChatStarted(async (update) => {
  return update.send('video chat started — jump in!')
})

tg.onSuccessfulPayment(async (update) => {
  const payment = update.successfulPayment
  console.log('payment received:', payment?.totalAmount, payment?.currency)
})
```

you can also use `tg.on('kind_name', handler)` with the snake_case kind string:

```ts
tg.on('new_chat_members', async (update) => {
  // update is typed as NewChatMembersUpdate
})
```

## membership events

`new_chat_members` and `left_chat_member` are the two most common service events:

```ts
tg.onNewChatMembers(async (update) => {
  for (const member of update.newChatMembers ?? []) {
    await update.send(`welcome, ${member.firstName}!`)
  }
})

tg.onLeftChatMember(async (update) => {
  const user = update.leftChatMember
  if (!user?.isBot) {
    await update.send(`goodbye, ${user?.firstName}`)
  }
})
```

## pinned message

```ts
tg.onPinnedMessage(async (update) => {
  const pinned = update.pinnedMessage
  await update.send(
    `message ${pinned?.id} was pinned`,
    { reply_parameters: { message_id: pinned?.id ?? 0 } }
  )
})
```

## forum topic events

```ts
tg.onForumTopicCreated(async (update) => {
  const topic = update.forumTopicCreated
  await update.send(`new topic created: ${topic?.name}`)
})

tg.onForumTopicClosed(async (update) => {
  await update.send('this topic was closed')
})
```

## filtering service events

filters work on service events exactly as they do on regular messages — the `MessageShared` base means all the same accessors are available. use `tg.on<Kind>(filter, handler)`:

```ts
import { filters } from 'puregram'

// only handle joins in supergroups
tg.onNewChatMembers(filters.chat.supergroup, async (update) => {
  const member = update.newChatMembers?.[0]
  await update.send(`welcome to the supergroup, ${member?.firstName}!`)
})
```

or combine with `tg.onUpdate` for cross-kind filtering:

```ts
import { filters } from 'puregram'

// catch any service event in a specific chat
tg.onUpdate(
  filters.kindIn(['new_chat_members', 'left_chat_member', 'new_chat_title']).and(
    filters.chatId(ADMIN_CHAT_ID)
  ),
  async (update) => {
    console.log(`[admin] service event: ${update.kind}`)
    await update.send(`service event: ${update.kind}`)
  }
)
```

::: tip why not just use tg.onMessage?
service event kinds are **not** dispatched as `message` — they get their own kind string after the field check. a `tg.onMessage(...)` handler will never see a `new_chat_members` update. always use `tg.onNewChatMembers(...)` (or `tg.on('new_chat_members', ...)`) to handle membership changes
:::

## see also

- [updates](/guide/concepts/updates) — the Update class, kind discriminant, and class-per-kind model
- [dispatch & filters](/guide/handling-updates/dispatch-and-filters) — registering handlers and composing filters

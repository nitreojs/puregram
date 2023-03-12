# supported events

you can see all official events [here](https://core.telegram.org/bots/api#getting-updates).
they are represented as: `{ [update_type]: update_data }`, e.g. `message` is an event type and `Message` is the event data

## official events

these are events that are native to telegram bot api – they are listed under the `Update` object.
however, telegram has some extra events, you can find a list of them [here](#extra-events)

### `message`

called whenever a new message is sent

- **type**: `'message'`, `UpdateType.Message`
- **context**: `MessageContext`
- **how to trigger**: send a message to the bot

```ts
telegram.updates.on('message', (context: MessageContext) => {})
telegram.updates.on(UpdateType.Message, (context: MessageContext) => {})
```

### `edited_message`

called whenever a message *that is known to the bot* was edited

- **type**: `'edited_message'`, `UpdateType.EditedMessage`
- **context**: `MessageContext`
- **how to trigger**: edit a message bot has access to

```ts
telegram.updates.on('edited_message', (context: MessageContext) => {})
telegram.updates.on(UpdateType.EditedMessage, (context: MessageContext) => {})
```

### `channel_post`

called whenever a new message in a known channel is sent

- **type**: `'channel_post'`, `UpdateType.ChannelPost`
- **context**: `MessageContext`
- **how to trigger**: send a message in a channel in which bot is admin

```ts
telegram.updates.on('channel_post', (context: MessageContext) => {})
telegram.updates.on(UpdateType.ChannelPost, (context: MessageContext) => {})
```

### `edited_channel_post`

called whenever a message in a known channel *that is known to the bot* was edited

- **type**: `'edited_channel_post'`, `UpdateType.EditedChannelPost`
- **context**: `MessageContext`
- **how to trigger**: edit a message in a channel in which bot is admin

```ts
telegram.updates.on('edited_channel_post', (context: MessageContext) => {})
telegram.updates.on(UpdateType.EditedChannelPost, (context: MessageContext) => {})
```

### `inline_query`

called whenever a query starting with `@<bot-username>` was typed in the message box

- **type**: `'inline_query'`, `UpdateType.InlineQuery`
- **context**: `InlineQueryContext`
- **how to trigger**: enable `Inline mode` in [@botfather](https://t.me/botfather) & type `@<bot-username> test` in the message box

```ts
telegram.updates.on('inline_query', (context: InlineQueryContext) => {})
telegram.updates.on(UpdateType.InlineQuery, (context: InlineQueryContext) => {})
```

### `chosen_inline_result`

called whenever an inline query was pressed

- **type**: `'chosen_inline_result'`, `UpdateType.ChosenInlineResult`
- **context**: `ChosenInlineResultContext`
- **how to trigger**: enable [feedback collecting](https://core.telegram.org/bots/inline#collecting-feedback) & press on an inline query

```ts
telegram.updates.on('chosen_inline_result', (context: ChosenInlineResultContext) => {})
telegram.updates.on(UpdateType.ChosenInlineResult, (context: ChosenInlineResultContext) => {})
```

### `callback_query`

called whenever an inline button was pressed

- **type**: `'callback_query'`, `UpdateType.CallbackQuery`
- **context**: `CallbackQueryContext`
- **how to trigger**: send a message with inline buttons & click on one of them

```ts
telegram.updates.on('callback_query', (context: CallbackQueryContext) => {})
telegram.updates.on(UpdateType.CallbackQuery, (context: CallbackQueryContext) => {})
```

### `shipping_query`

called whenever shipping data was typed & sent for you to validate

- **type**: `'shipping_query'`, `UpdateType.ShippingQuery`
- **context**: `ShippingQueryContext`
- **how to trigger**: send an invoice with shipping requirements & enter shipping data

```ts
telegram.updates.on('shipping_query', (context: ShippingQueryContext) => {})
telegram.updates.on(UpdateType.ShippingQuery, (context: ShippingQueryContext) => {})
```

### `pre_checkout_query`

called whenever payment is almost done. contains full information about this checkout

- **type**: `'pre_checkout_query'`, `UpdateType.PreCheckoutQuery`
- **context**: `PreCheckoutQueryContext`
- **how to trigger**: send an invoice & complete it

```ts
telegram.updates.on('pre_checkout_query', (context: PreCheckoutQueryContext) => {})
telegram.updates.on(UpdateType.PreCheckoutQuery, (context: PreCheckoutQueryContext) => {})
```

### `poll`

called whenever poll state changes (e.g. it stops or some user votes in it)

- **type**: `'poll'`, `UpdateType.Poll`
- **context**: `PollContext`
- **how to trigger**: send a poll & vote in it

```ts
telegram.updates.on('poll', (context: PollContext) => {})
telegram.updates.on(UpdateType.Poll, (context: PollContext) => {})
```

### `poll_answer`

called whenever a user changed their answer in a non-anonymous poll

- **type**: `'poll_answer'`, `UpdateType.PollAnswer`
- **context**: `PollAnswerContext`
- **how to trigger**: send a non-anonymous poll, vote in it & change your answer

```ts
telegram.updates.on('poll_answer', (context: PollAnswerContext) => {})
telegram.updates.on(UpdateType.PollAnswer, (context: PollAnswerContext) => {})
```

### `my_chat_member`

called whenever bot's chat member status was updated. for PMs, this update is called whenever
user stops or unblocks this bot

- **type**: `'my_chat_member'`, `UpdateType.MyChatMember`
- **context**: `ChatMemberContext`
- **how to trigger**: block/unblock your bot

```ts
telegram.updates.on('my_chat_member', (context: ChatMemberContext) => {})
telegram.updates.on(UpdateType.MyChatMember, (context: ChatMemberContext) => {})
```

### `chat_member`

called whenever chat member's status was updated.
the bot must be an administrator in the chat and **must explicitly specify** `'chat_member'` in the list of `allowed_updates` to receive these updates.

- **type**: `'chat_member'`, `UpdateType.ChatMember`
- **context**: `ChatMemberContext`
- **how to trigger**: add a bot to a chat as an administrator & remove someone from it

```ts
telegram.updates.on('chat_member', (context: ChatMemberContext) => {})
telegram.updates.on(UpdateType.ChatMember, (context: ChatMemberContext) => {})
```

### `chat_join_request`

called whenever a request to join the chat has been sent

- **type**: `'chat_join_request'`, `UpdateType.ChatJoinRequest`
- **context**: `ChatJoinRequestContext`
- **how to trigger**: make a chat private, create an invite link with join requsts & send a join request

```ts
telegram.updates.on('chat_join_request', (context: ChatJoinRequestContext) => {})
telegram.updates.on(UpdateType.ChatJoinRequest, (context: ChatJoinRequestContext) => {})
```

### `user_shared`

called whenever a user has shared another user via the keyboard

- **type**: `'user_shared'`, `UpdateType.UserShared`
- **context**: `UserSharedContext`
- **hot to trigger**: send a keyboard with `request_user` button and share a user via it

```ts
telegram.updates.on('user_shared', (context: UserSharedContext) => {})
telegram.updates.on(UpdateType.UserShared, (context: UserSharedContext) => {})
```

### `chat_shared`

called whenever a user has shared a chat via the keyboard

- **type**: `'chat_shared'`, `UpdateType.ChatShared`
- **context**: `ChatSharedContext`
- **hot to trigger**: send a keyboard with `request_chat` button and share a chat via it

```ts
telegram.updates.on('chat_shared', (context: ChatSharedContext) => {})
telegram.updates.on(UpdateType.ChatShared, (context: ChatSharedContext) => {})
```

### `forum_topic_created`

called whenever a forum topic has been created

- **type**: `'forum_topic_created'`, `UpdateType.ForumTopicCreated`
- **context**: `ForumTopicCreatedContext`
- **hot to trigger**: create a forum topic with a bot as a member

```ts
telegram.updates.on('forum_topic_created', (context: ForumTopicCreatedContext) => {})
telegram.updates.on(UpdateType.ForumTopicCreated, (context: ForumTopicCreatedContext) => {})
```

### `forum_topic_edited`

called whenever a forum topic has been somehow edited

- **type**: `'forum_topic_edited'`, `UpdateType.ForumTopicEdited`
- **context**: `ForumTopicEditedContext`
- **hot to trigger**: edit a forum topic with a bot as a member

```ts
telegram.updates.on('forum_topic_edited', (context: ForumTopicEditedContext) => {})
telegram.updates.on(UpdateType.ForumTopicEdited, (context: ForumTopicEditedContext) => {})
```

### `forum_topic_closed`

called whenever a forum topic has been closed

- **type**: `'forum_topic_closed'`, `UpdateType.ForumTopicClosed`
- **context**: `ForumTopicClosedContext`
- **hot to trigger**: close a forum topic with a bot as a member

```ts
telegram.updates.on('forum_topic_closed', (context: ForumTopicClosedContext) => {})
telegram.updates.on(UpdateType.ForumTopicClosed, (context: ForumTopicClosedContext) => {})
```

### `forum_topic_reopened`

called whenever a forum topic has been reopened

- **type**: `'forum_topic_reopened'`, `UpdateType.ForumTopicReopened`
- **context**: `ForumTopicReopenedContext`
- **hot to trigger**: reopen a forum topic with a bot as a member

```ts
telegram.updates.on('forum_topic_reopened', (context: ForumTopicReopenedContext) => {})
telegram.updates.on(UpdateType.ForumTopicReopened, (context: ForumTopicReopenedContext) => {})
```

### `general_forum_topic_hidden`

called whenever a 'General' forum topic has been hidden

- **type**: `'general_forum_topic_hidden'`, `UpdateType.GeneralForumTopicHidden`
- **context**: `GeneralForumTopicHiddenContext`
- **hot to trigger**: hide a 'General' forum topic

```ts
telegram.updates.on('general_forum_topic_hidden', (context: GeneralForumTopicHiddenContext) => {})
telegram.updates.on(UpdateType.GeneralForumTopicHidden, (context: GeneralForumTopicHiddenContext) => {})
```

### `general_forum_topic_unhidden`

called whenever a 'General' forum topic has been unhidden

- **type**: `'general_forum_topic_unhidden'`, `UpdateType.GeneralForumTopicUnhidden`
- **context**: `GeneralForumTopicUnhiddenContext`
- **hot to trigger**: unhide a 'General' forum topic

```ts
telegram.updates.on('general_forum_topic_unhidden', (context: GeneralForumTopicUnhiddenContext) => {})
telegram.updates.on(UpdateType.GeneralForumTopicUnhidden, (context: GeneralForumTopicUnhiddenContext) => {})
```

## extra events

`puregram` adds some extra events so you don't have to, for example, handle `message` event just to check if there is
`new_chat_title` field in the object

### `new_chat_members`

- **type**: `'new_chat_members'`, `UpdateType.NewChatMembers`
- **context**: `NewChatMembersContext`
- **how to trigger**: invite someone to a chat
- **getter**: `eventMembers`

```ts
telegram.updates.on('new_chat_members', (context: NewChatMembersContext) => console.log(context.eventMembers))
telegram.updates.on(UpdateType.NewChatMembers, (context: NewChatMembersContext) => console.log(context.eventMembers))
```

### `left_chat_member`

- **type**: `'left_chat_member'`, `UpdateType.LeftChatMember`
- **context**: `LeftChatMemberContext`
- **how to trigger**: leave a chat
- **getter**: `eventMember`

```ts
telegram.updates.on('left_chat_member', (context: LeftChatMemberContext) => console.log(context.eventMember))
telegram.updates.on(UpdateType.LeftChatMember, (context: LeftChatMemberContext) => console.log(context.eventMember))
```

### `new_chat_photo`

- **type**: `'new_chat_photo'`, `UpdateType.NewChatPhoto`
- **context**: `NewChatPhotoContext`
- **how to trigger**: change chat's photo
- **getter**: `eventPhoto`

```ts
telegram.updates.on('new_chat_photo', (context: NewChatPhotoContext) => console.log(context.eventPhoto))
telegram.updates.on(UpdateType.NewChatPhoto, (context: NewChatPhotoContext) => console.log(context.eventPhoto))
```

### `new_chat_title`

- **type**: `'new_chat_title'`, `UpdateType.NewChatTitle`
- **context**: `NewChatTitleContext`
- **how to trigger**: change chat's title
- **getter**: `eventTitle`

```ts
telegram.updates.on('new_chat_title', (context: NewChatTitleContext) => console.log(context.eventTitle))
telegram.updates.on(UpdateType.NewChatTitle, (context: NewChatTitleContext) => console.log(context.eventTitle))
```

### `delete_chat_photo`

- **type**: `'delete_chat_photo'`, `UpdateType.DeleteChatPhoto`
- **context**: `DeleteChatPhotoContext`
- **how to trigger**: delete chat's photo
- **getter**: *none*

```ts
telegram.updates.on('delete_chat_photo', (context: DeleteChatPhotoContext) => {})
telegram.updates.on(UpdateType.DeleteChatPhoto, (context: DeleteChatPhotoContext) => {})
```

### `group_chat_created`

- **type**: `'group_chat_created'`, `UpdateType.GroupChatCreated`
- **context**: `GroupChatCreatedContext`
- **how to trigger**: create a group chat with bot as a member
- **getter**: *none*

```ts
telegram.updates.on('group_chat_created', (context: GroupChatCreatedContext) => {})
telegram.updates.on(UpdateType.GroupChatCreated, (context: GroupChatCreatedContext) => {})
```

### `supergroup_chat_created`

- **type**: `'supergroup_chat_created'`, `UpdateType.SupergroupChatCreated`
- **context**: `SupergroupChatCreatedContext`
- **how to trigger**: create a supergroup chat with bot as a member
- **getter**: *none*

```ts
telegram.updates.on('supregroup_chat_created', (context: SupergroupChatCreatedContext) => {})
telegram.updates.on(UpdateType.SupergroupChatCreated, (context: SupergroupChatCreatedContext) => {})
```

### `channel_chat_created`

- **type**: `'channel_chat_created'`, `UpdateType.ChannelChatCreated`
- **context**: `ChannelChatCreatedContext`
- **how to trigger**: create a channel chat with bot as a member
- **getters**: `id`, `createdAt`

```ts
telegram.updates.on('channel_chat_created', (context: ChannelChatCreatedContext) => console.log(context.id, context.createdAt))
telegram.updates.on(UpdateType.ChannelChatCreated, (context: ChannelChatCreatedContext) => console.log(context.id, context.createdAt))
```

### `migrate_to_chat_id`

- **type**: `'migrate_to_chat_id'`, `UpdateType.MigrateToChatId`
- **context**: `MigrateToChatIdContext`
- **how to trigger**: migrate to chat
- **getter**: `eventId`

```ts
telegram.updates.on('migrate_to_chat_id', (context: MigrateToChatIdContext) => console.log(context.eventId))
telegram.updates.on(UpdateType.MigrateToChatId, (context: MigrateToChatIdContext) => console.log(context.eventId))
```

### `migrate_from_chat_id`

- **type**: `'migrate_from_chat_id'`, `UpdateType.MigrateFromChatId`
- **context**: `MigrateFromChatIdContext`
- **how to trigger**: migrate from chat
- **getter**: `eventId`

```ts
telegram.updates.on('migrate_from_chat_id', (context: MigrateFromChatIdContext) => console.log(context.eventId))
telegram.updates.on(UpdateType.MigrateFromChatId, (context: MigrateFromChatIdContext) => console.log(context.eventId))
```

### `pinned_message`

- **type**: `'pinned_message'`, `UpdateType.PinnedMessage`
- **context**: `PinnedMessageContext`
- **how to trigger**: pin a message
- **getter**: `eventMessage`

```ts
telegram.updates.on('pinned_message', (context: PinnedMessageContext) => console.log(context.eventMessage))
telegram.updates.on(UpdateType.PinnedMessage, (context: PinnedMessageContext) => console.log(context.eventMessage))
```

### `invoice`

- **type**: `'invoice'`, `UpdateType.Invoice`
- **context**: `InvoiceContext`
- **how to trigger**: send an invoice
- **getter**: `eventInvoice`

```ts
telegram.updates.on('invoice', (context: InvoiceContext) => console.log(context.eventInvoice))
telegram.updates.on(UpdateType.Invoice, (context: InvoiceContext) => console.log(context.eventInvoice))
```

### `successful_payment`

- **type**: `'successful_payment'`, `UpdateType.SuccessfulPayment`
- **context**: `SuccessfulPaymentContext`
- **how to trigger**: make a successful payment
- **getter**: `eventPayment`

```ts
telegram.updates.on('successful_payment', (context: SuccessfulPaymentContext) => console.log(context.eventPayment))
telegram.updates.on(UpdateType.SuccessfulPayment, (context: SuccessfulPaymentContext) => console.log(context.eventPayment))
```

### `location`

- **type**: `'location'`, `UpdateType.Location`
- **context**: `LocationContext`
- **how to trigger**: send location
- **getter**: `eventLocation`

```ts
telegram.updates.on('location', (context: LocationContext) => console.log(context.eventLocation))
telegram.updates.on(UpdateType.Location, (context: LocationContext) => console.log(context.eventLocation))
```

### `message_auto_delete_timer_changed`

- **type**: `'message_auto_delete_timer_changed'`, `UpdateType.MessageAutoDeleteTimerChanged`
- **context**: `MessageAutoDeleteTimerChangedContext`
- **how to trigger**: change the time after which all sent messages will be automatically deleted
- **getter**: `autoDeleteTimer`

```ts
telegram.updates.on('message_auto_delete_timer_changed', (context: MessageAutoDeleteTimerChangedContext) => console.log(context.autoDeleteTimer))
telegram.updates.on(UpdateType.MessageAutoDeleteTimeChanged, (context: MessageAutoDeleteTimerChangedContext) => console.log(context.autoDeleteTimer))
```

### `video_chat_scheduled`

- **type**: `'video_chat_scheduled'`, `UpdateType.VideoChatScheduled`
- **context**: `VideoChatScheduledContext`
- **how to trigger**: schedule a video chat
- **getter**: `eventScheduled`

```ts
telegram.updates.on('video_chat_scheduled', (context: VideoChatScheduledContext) => console.log(context.eventScheduled))
telegram.updates.on(UpdateType.VideoChatScheduled, (context: VideoChatScheduledContext) => console.log(context.eventScheduled))
```

### `video_chat_started`

- **type**: `'video_chat_started'`, `UpdateType.VideoChatStarted`
- **context**: `VideoChatStartedContext`
- **how to trigger**: start a video chat
- **getter**: `eventStarted`

```ts
telegram.updates.on('video_chat_started', (context: VideoChatStartedContext) => console.log(context.eventStarted))
telegram.updates.on(UpdateType.VideoChatStarted, (context: VideoChatStartedContext) => console.log(context.eventStarted))
```

### `video_chat_ended`

- **type**: `'video_chat_ended'`, `UpdateType.VideoChatEnded`
- **context**: `VideoChatEndedContext`
- **how to trigger**: end a video chat
- **getter**: `eventEnded`

```ts
telegram.updates.on('video_chat_ended', (context: VideoChatEndedContext) => console.log(context.eventEnded))
telegram.updates.on(UpdateType.VideoChatEnded, (context: VideoChatEndedContext) => console.log(context.eventEnded))
```

### `video_chat_participants_invited`

- **type**: `'video_chat_participants_invited'`, `UpdateType.VideoChatParticipantsInvited`
- **context**: `VideoChatParticipantsInvitedContext`
- **how to trigger**: invite participants to video chat
- **getter**: `eventParticipantsInvited`

```ts
telegram.updates.on('video_chat_participants_invited', (context: VideoChatParticipantsInvitedContext) => console.log(context.eventParticipantsInvited))
telegram.updates.on(UpdateType.VideoChatParticipantsInvited, (context: VideoChatParticipantsInvitedContext) => console.log(context.eventParticipantsInvited))
```

### `web_app_data`

- **type**: `'web_app_data'`, `UpdateType.WebAppData`
- **context**: `WebAppDataContext`
- **how to trigger**: send Web App data
- **getters**: `data`, `buttonText`

```ts
telegram.updates.on('web_app_data', (context: WebAppDataContext) => console.log(context.data, context.buttonText))
telegram.updates.on(UpdateType.WebAppData, (context: WebAppDataContext) => console.log(context.data, context.buttonText))
```

### `proximity_alert_triggered`

- **type**: `'proximity_alert_triggered'`, `UpdateType.ProximityAlertTriggered`
- **context**: `ProximityAlertTriggeredContext`
- **how to trigger**: trigger another user's proximity alert while sharing live location *(pretty hard one, huh?)*
- **getter**: `proximityAlert`

```ts
telegram.updates.on('proximity_alert_triggered', (context: ProximityAlertTriggeredContext) => console.log(context.proximityAlert))
telegram.updates.on(UpdateType.ProximityAlertTriggered, (context: ProximityAlertTriggeredContext) => console.log(context.proximityAlert))
```

### `passport_data`

- **type**: `'passport_data'`, `UpdateType.PassportData`
- **context**: `PassportDataContext`
- **how to trigger**: send a passport *(honestly, i dont even know what that means)*
- **getter**: `passportData`

```ts
telegram.updates.on('passport_data', (context: PassportDataContext) => console.log(context.passportData))
telegram.updates.on(UpdateType.PassportData, (context: PassportDataContext) => console.log(context.passportData))
```

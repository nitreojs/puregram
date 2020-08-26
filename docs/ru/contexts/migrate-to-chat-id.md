# `MigrateToChatIdContext`

Контекст, наследуемый от [`Context`](context.md).

**Вызывается, когда группа перешла в супергруппу.**

```ts
import { MigrateToChatIdContext } from 'puregram';
```

## Table of Contents

* [**События, вызывающие контекст**](#события-вызывающие-контекст)
* [**Constructor**](#constructor)
* [**Методы и геттеры контекста**](#методы-и-геттеры-контекста)
* [**Контекстуальные методы**](#контекстуальные-методы)

## События, вызывающие контекст

* `migrate_to_chat_id`

## Constructor

```ts
const context: MigrateToChatIdContext = new MigrateToChatIdContext(telegram, update);
```

|  Параметр  |        Тип        |              Описание             |
| :--------: | :---------------: | :-------------------------------: |
| `telegram` | `Telegram`        | Инстанция `Telegram`              |
| `update`   | `TelegramMessage` | [Объект события][TelegramMessage] |

[TelegramMessage]: https://core.telegram.org/bots/api#message

## Методы и геттеры контекста

### Table of Contents

* [`id`](#id)
* [`from`](#from)
* [`senderId`](#senderid)
* [`createdAt`](#createdat)
* [`chat`](#chat)
* [`chatId`](#chatid)
* [`chatType`](#chattype)
* [`isPM`](#ispm)
* [`isGroup`](#isgroup)
* [`isSupergroup`](#issupergroup)
* [`isChannel`](#ischannel)
* [`eventId`](#eventid)

---

### `id`

**Возвращает ID сообщения**

```ts
context.id // => number
```

### `from`

**Возвращает пользователя, закрепившего сообщение**

```ts
context.from // => User | undefined
```

### `senderId`

**Возвращает ID пользователя, закрепившего сообщение**

```ts
context.senderId // => number | undefined
```

### `createdAt`

**Возвращает дату создания сообщения в Unix**

```ts
context.createdAt // => number
```

### `chat`

**Возвращает объект диалога**

```ts
context.chat // => Chat | undefined
```

### `chatId`

**Возвращает ID диалога**

```ts
context.chatId // => number | undefined
```

### `chatType`

**Возвращает тип диалога**

```ts
context.chatType // => ChatType | undefined
```

### `isPM`

**Является ли данный диалог личными сообщениями с пользователем?**

```ts
context.isPM // => boolean
```

### `isGroup`

**Является ли данный диалог группой?**

```ts
context.isGroup // => boolean
```

### `isSupergroup`

**Является ли данный диалог супергруппой?**

```ts
context.isSupergroup // => boolean
```

### `isChannel`

**Является ли данный диалог каналом?**

```ts
context.isChannel // => boolean
```

### `eventId`

**Возвращает ID нового чата.**

```ts
context.eventId // => number
```

## Контекстуальные методы

### Table of contents

* [`send`](#sendtext-params)
* [`reply`](#replytext-params)
* [`sendPhoto`](#sendphotophoto-params)
* [`replyWithPhoto`](#replywithphotophoto-params)
* [`sendAudio`](#sendaudioaudio-params)
* [`replyWithAudio`](#replywithaudioaudio-params)
* [`sendVideo`](#sendvideovideo-params)
* [`replyWithVideo`](#replywithvideovideo-params)
* [`sendAnimation`](#sendanimationanimation-params)
* [`replyWithAnimation`](#replywithanimationanimation-params)
* [`sendVideoNote`](#sendvideonotevideonote-params)
* [`replyWithVideoNote`](#replywithvideonotevideonote-params)
* [`sendVoice`](#sendvoicevoice-params)
* [`replyWithVoice`](#replywithvoicevoice-params)
* [`sendMediaGroup`](#sendmediagroupmediagroup-params)
* [`replyWithMediaGroup`](#replywithmediagroupmediagroup-params)
* [`sendLocation`](#sendlocationlatitude-longitude-params)
* [`replyWithLocation`](#replywithlocationlatitude-longitude-params)
* [`editMessageLiveLocation`](#editmessagelivelocationparams)
* [`stopMessageLiveLocation`](#stopmessagelivelocationparams)
* [`sendVenue`](#sendvenueparams)
* [`replyWithVenue`](#replywithvenueparams)
* [`sendContact`](#sendcontactparams)
* [`replyWithContact`](#replywithcontactparams)
* [`sendPoll`](#sendpollparams)
* [`replyWithPoll`](#replywithpollparams)
* [`stopPoll`](#stoppollmessageid-params)
* [`sendChatAction`](#sendchatactionaction-params)
* [`deleteMessage`](#deletemessage)
* [`sendSticker`](#sendstickersticker-params)
* [`sendDice`](#senddiceemoji-params)
* [`getMyCommands`](#getmycommands)
* [`editMessageText`](#editmessagetexttext-params)
* [`editMessageCaption`](#editmessagecaptioncaption-params)
* [`editMessageMedia`](#editmessagemediamedia-params)
* [`editMessageReplyMarkup`](#editmessagereplymarkupreplymarkup-params)

---

### `send(text, params?)`

**Отправляет сообщение в данный диалог**

| Параметр  |              Тип             |
| :-------: | :--------------------------: |
| `text`    | `string`                     |
| `params?` | `Partial<SendMessageParams>` |

```ts
context.send('Hello!') // => Promise<MessageContext>
```

### `reply(text, params?)`

**Отправляет сообщение в данный диалог, попутно отвечая на пришедшее**

| Параметр  |              Тип             |
| :-------: | :--------------------------: |
| `text`    | `string`                     |
| `params?` | `Partial<SendMessageParams>` |

```ts
context.reply('That\'s great!') // => Promise<MessageContext>
```

### `sendPhoto(photo, params?)`

**Отправляет сообщение с фотографией в данный диалог**

| Параметр  |             Тип            |
| :-------: | :------------------------: |
| `photo`   | `TelegramInputFile`        |
| `params?` | `Partial<SendPhotoParams>` |

```ts
context.sendPhoto(photoUrl) // => Promise<MessageContext>
```

### `replyWithPhoto(photo, params?)`

**Отправляет сообщение с фотографией в данный диалог, попутно отвечая на пришедшее**

| Параметр  |             Тип            |
| :-------: | :------------------------: |
| `photo`   | `TelegramInputFile`        |
| `params?` | `Partial<SendPhotoParams>` |

```ts
context.replyWithPhoto(photoUrl) // => Promise<MessageContext>
```

### `sendAudio(audio, params?)`

**Отправляет сообщение с аудиозаписью в данный диалог**

| Параметр  |             Тип            |
| :-------: | :------------------------: |
| `audio`   | `TelegramInputFile`        |
| `params?` | `Partial<SendAudioParams>` |

```ts
context.sendAudio(audioUrl) // => Promise<MessageContext>
```

### `replyWithAudio(audio, params?)`

**Отправляет сообщение с аудиозаписью в данный диалог, попутно отвечая на пришедшее**

| Параметр  |             Тип            |
| :-------: | :------------------------: |
| `audio`   | `TelegramInputFile`        |
| `params?` | `Partial<SendAudioParams>` |

```ts
context.replyWithAudio(audioUrl) // => Promise<MessageContext>
```

### `sendVideo(video, params?)`

**Отправляет сообщение с видеозаписью в данный диалог**

| Параметр  |             Тип            |
| :-------: | :------------------------: |
| `video`   | `TelegramInputFile`        |
| `params?` | `Partial<SendVideoParams>` |

```ts
context.sendVideo(videoUrl) // => Promise<MessageContext>
```

### `replyWithVideo(video, params?)`

**Отправляет сообщение с видеозаписью в данный диалог, попутно отвечая на пришедшее**

| Параметр  |             Тип            |
| :-------: | :------------------------: |
| `video`   | `TelegramInputFile`        |
| `params?` | `Partial<SendVideoParams>` |

```ts
context.replyWithVideo(videoUrl) // => Promise<MessageContext>
```

### `sendAnimation(animation, params?)`

**Отправляет сообщение с анимацией в данный диалог**

|  Параметр   |               Тип              |
| :---------: | :----------------------------: |
| `animation` | `TelegramInputFile`            |
| `params?`   | `Partial<SendAnimationParams>` |

```ts
context.sendAnimation(animationUrl) // => Promise<MessageContext>
```

### `replyWithAnimation(animation, params?)`

**Отправляет сообщение с анимацией в данный диалог, попутно отвечая на пришедшее**

|  Параметр   |               Тип              |
| :---------: | :----------------------------: |
| `animation` | `TelegramInputFile`            |
| `params?`   | `Partial<SendAnimationParams>` |

```ts
context.replyWithAnimation(animationUrl) // => Promise<MessageContext>
```

### `sendVideoNote(videoNote, params?)`

**Отправляет сообщение с видео-заметкой в данный диалог**

|  Параметр   |               Тип              |
| :---------: | :----------------------------: |
| `videoNote` | `TelegramInputFile`            |
| `params?`   | `Partial<SendVideoNoteParams>` |

```ts
context.sendVideoNote(videoNoteUrl) // => Promise<MessageContext>
```

### `replyWithVideoNote(videoNote, params?)`

**Отправляет сообщение с видео-заметкой в данный диалог, попутно отвечая на пришедшее**

|  Параметр   |               Тип              |
| :---------: | :----------------------------: |
| `videoNote` | `TelegramInputFile`            |
| `params?`   | `Partial<SendVideoNoteParams>` |

```ts
context.replyWithVideoNote(videoNoteUrl) // => Promise<MessageContext>
```

### `sendVoice(voice, params?)`

**Отправляет сообщение с голосовым сообщением в данный диалог**

| Параметр  |             Тип            |
| :-------: | :------------------------: |
| `voice`   | `TelegramInputFile`        |
| `params?` | `Partial<SendVoiceParams>` |

```ts
context.sendVoice(voiceUrl) // => Promise<MessageContext>
```

### `replyWithVoice(voice, params?)`

**Отправляет сообщение с голосовым сообщением в данный диалог, попутно отвечая на пришедшее**

| Параметр  |             Тип            |
| :-------: | :------------------------: |
| `voice`   | `TelegramInputFile`        |
| `params?` | `Partial<SendVoiceParams>` |

```ts
context.replyWithVoice(voiceUrl) // => Promise<MessageContext>
```

### `sendMediaGroup(mediaGroup, params?)`

**Отправляет сообщение с альбомом в данный диалог**

|   Параметр   |                            Тип                          |
| :----------: | :-----------------------------------------------------: |
| `mediaGroup` | <code>(InputMediaPhoto &#124; InputMediaVideo)[]</code> |
| `params?`    | `Partial<SendMediaGroupParams>`                         |

```ts
context.sendMediaGroup(mediaGroup) // => Promise<Message[]>
```

### `replyWithMediaGroup(mediaGroup, params?)`

**Отправляет сообщение с альбомом в данный диалог, попутно отвечая на пришедшее**

|   Параметр   |                            Тип                          |
| :----------: | :-----------------------------------------------------: |
| `mediaGroup` | <code>(InputMediaPhoto &#124; InputMediaVideo)[]</code> |
| `params?`    | `Partial<SendMediaGroupParams>`                         |

```ts
context.replyWithMediaGroup(mediaGroup) // => Promise<Message[]>
```

### `sendLocation(latitude, longitude, params?)`

**Отправляет сообщение с локацией в данный диалог**

|  Параметр   |               Тип             |
| :---------: | :---------------------------: |
| `latitude`  | `number`                      |
| `longitude` | `number`                      |
| `params?`   | `Partial<SendLocationParams>` |

```ts
context.sendLocation(59.843586, 30.3180333) // => Promise<MessageContext>
```

_Кстати, указанная локация - Санкт-Петербург!_

### `replyWithLocation(latitude, longitude, params?)`

**Отправляет сообщение с локацией в данный диалог, попутно отвечая на пришедшее**

|  Параметр   |               Тип             |
| :---------: | :---------------------------: |
| `latitude`  | `number`                      |
| `longitude` | `number`                      |
| `params?`   | `Partial<SendLocationParams>` |

```ts
context.replyWithLocation(0, 0) // => Promise<MessageContext>
```

_Указанная локация - [Остров Ноль](https://ru.wikipedia.org/wiki/%D0%9E%D1%81%D1%82%D1%80%D0%BE%D0%B2_%D0%9D%D0%BE%D0%BB%D1%8C)_

### `sendVenue(params)`

**Отправляет сообщение с местом встречи**

| Параметр |        Тип        |
| :------: | :---------------: |
| `params` | `SendVenueParams` |

```ts
context.sendVenue(params) // => Promise<MessageContext>
```

### `replyWithVenue(params)`

**Отправляет сообщение с местом встречи, попутно отвечая на пришедшее**

| Параметр |        Тип        |
| :------: | :---------------: |
| `params` | `SendVenueParams` |

```ts
context.replyWithVenue(params) // => Promise<MessageContext>
```

### `sendContact(params)`

**Отправляет сообщение с контактом**

| Параметр |         Тип         |
| :------: | :-----------------: |
| `params` | `SendContactParams` |

```ts
context.sendContact(params) // => Promise<MessageContext>
```

### `replyWithContact(params)`

**Отправляет сообщение с местом встречи, попутно отвечая на пришедшее**

| Параметр |        Тип        |
| :------: | :---------------: |
| `params` | `SendVenueParams` |

```ts
context.replyWithVenue(params) // => Promise<MessageContext>
```

### `sendPoll(params)`

**Отправляет сообщение с опросом**

| Параметр |        Тип       |
| :------: | :--------------: |
| `params` | `SendPollParams` |

```ts
context.sendPoll(params) // => Promise<SendPollParams>
```

### `replyWithPoll(params)`

**Отправляет сообщение с опросом, попутно отвечая на пришедшее**

| Параметр |        Тип       |
| :------: | :--------------: |
| `params` | `SendPollParams` |

```ts
context.replyWithPoll(params) // => Promise<SendPollParams>
```

### `stopPoll(messageId, params?)`

**Останавливает опрос у сообщения `messageId`**

|  Параметр   |            Тип            |
| :---------: | :-----------------------: |
| `messageId` | `number`                  |
| `params?`   | `Partial<StopPollParams>` |

```ts
context.stopPoll(1337) // => Promise<Poll>
```

### `editMessageLiveLocation(params)`

**Редактирует live-location у пришедшего сообщения**

| Параметр |               Тип               |
| :------: | :-----------------------------: |
| `params` | `EditMessageLiveLocationParams` |

```ts
context.editMessageLiveLocation(params) // => Promise<true | MessageContext>
```

### `stopMessageLiveLocation(params?)`

**Прекращает трансляцию live-location у пришедшего сообщения**

| Параметр  |               Тип               |
| :-------: | :-----------------------------: |
| `params?` | `StopMessageLiveLocationParams` |

```ts
context.stopMessageLiveLocation(params) // => Promise<true | MessageContext>
```

### `sendChatAction(action, params?)`

**Отправляет уведомление в чат о работе бота (печатает, отправляет голосовое сообщение и т.д.)**

| Параметр  |           Тип          |
| :-------: | :--------------------: |
| `action`  | `ChatAction`           |
| `params?` | `SendChatActionParams` |

```ts
context.sendChatAction('typing') // => Promise<true>
```

### `deleteMessage()`

**Удаляет сообщение**

```ts
context.deleteMessage() // => Promise<true>
```

### `sendSticker(sticker, params?)`

**Отправляет стикер в данный диалог**

| Параметр  |              Тип             |
| :-------: | :--------------------------: |
| `sticker` | `TelegramInputFile`          |
| `params?` | `Partial<SendStickerParams>` |

```ts
context.sendSticker(sticker) // => Promise<MessageContext>
```

### `sendDice(emoji, params?)`

**Отправляет dice с указанным `emoji` в данный диалог**

| Параметр  |            Тип            |
| :-------: | :-----------------------: |
| `emoji`   | `DiceEmoji`               |
| `params?` | `Partial<SendDiceParams>` |

```ts
context.sendDice('🎲') // => Promise<MessageContext>
```

### `getMyCommands`

**Возвращает список команд, указанных через @BotFather или через `setMyCommands`**

```ts
context.getMyCommands() // => Promise<BotCommand[]>
```

### `editMessageText(text, params?)`

**Редактирует текст [и указанные параметры] у сообщения**

| Параметр  |               Тип                |
| :-------: | :------------------------------: |
| `text`    | `string`                         |
| `params?` | `Partial<EditMessageTextParams>` |

```ts
context.editMessageText('New text of the message') // => Promise<true | MessageContext>
```

### `editMessageCaption(caption, params?)`

**Редактирует подпись [и указанные параметры] у сообщения**

| Параметр  |                 Тип                 |
| :-------: | :---------------------------------: |
| `caption` | `string`                            |
| `params?` | `Partial<EditMessageCaptionParams>` |

```ts
context.editMessageCaption('New caption of the message') // => Promise<true | MessageContext>
```

### `editMessageMedia(media, params?)`

**Редактирует вложения [и указанные параметры] у сообщения**

| Параметр  |                Тип                |
| :-------: | :-------------------------------: |
| `media`   | `InputMediaUnion`                 |
| `params?` | `Partial<EditMessageMediaParams>` |

```ts
context.editMessageMedia(media) // => Promise<true | MessageContext>
```

### `editMessageReplyMarkup(replyMarkup, params?)`

**Редактирует клавиатуру [и указанные параметры] у сообщения**

|   Параметр    |                   Тип                   |
| :-----------: | :-------------------------------------: |
| `replyMarkup` | `TelegramInlineKeyboardMarkup`          |
| `params?`     | `Partial<EditMessageReplyMarkupParams>` |

```ts
context.editMessageReplyMarkup(replyMarkup) // => Promise<true | MessageContext>
```

# `ShippingQueryContext`

Контекст, наследуемый от `ShippingQuery` и [`Context`](context.md).

**Вызывается, когда боту приходит `ShippingQuery`.**

```ts
import { ShippingQueryContext } from 'puregram';
```

## Содержание

* [**События, вызывающие контекст**](#события-вызывающие-контекст)
* [**Constructor**](#constructor)
* [**Контекстуальные методы**](#контекстуальные-методы)

## События, вызывающие контекст

* `shipping_query`

## Constructor

```ts
const context = new ShippingQueryContext(telegram, update);
```

|  Параметр  |            Тип          |                  Описание               |
| :--------: | :---------------------: | :-------------------------------------: |
| `telegram` | `Telegram`              | Инстанция `Telegram`                    |
| `update`   | `TelegramShippingQuery` | [Объект события][TelegramShippingQuery] |

[TelegramShippingQuery]: https://core.telegram.org/bots/api#shippingquery

## Контекстуальные методы

### Содержание

* [`send`](#sendtext-params)
* [`sendPhoto`](#sendphotophoto-params)
* [`sendAudio`](#sendaudioaudio-params)
* [`sendVideo`](#sendvideovideo-params)
* [`sendAnimation`](#sendanimationanimation-params)
* [`sendVideoNote`](#sendvideonotevideonote-params)
* [`sendVoice`](#sendvoicevoice-params)
* [`sendMediaGroup`](#sendmediagroupmediagroup-params)
* [`sendLocation`](#sendlocationlatitude-longitude-params)
* [`sendVenue`](#sendvenueparams)
* [`sendContact`](#sendcontactparams)
* [`sendPoll`](#sendpollparams)
* [`stopPoll`](#stoppollmessageid-params)
* [`sendChatAction`](#sendchatactionaction-params)
* [`sendSticker`](#sendstickersticker-params)
* [`sendDice`](#senddiceemoji-params)
* [`getMyCommands`](#getmycommands)

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

### `sendPhoto(photo, params?)`

**Отправляет сообщение с фотографией в данный диалог**

| Параметр  |             Тип            |
| :-------: | :------------------------: |
| `photo`   | `TelegramInputFile`        |
| `params?` | `Partial<SendPhotoParams>` |

```ts
context.sendPhoto(photoUrl) // => Promise<MessageContext>
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

### `sendVideo(video, params?)`

**Отправляет сообщение с видеозаписью в данный диалог**

| Параметр  |             Тип            |
| :-------: | :------------------------: |
| `video`   | `TelegramInputFile`        |
| `params?` | `Partial<SendVideoParams>` |

```ts
context.sendVideo(videoUrl) // => Promise<MessageContext>
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

### `sendVideoNote(videoNote, params?)`

**Отправляет сообщение с видео-заметкой в данный диалог**

|  Параметр   |               Тип              |
| :---------: | :----------------------------: |
| `videoNote` | `TelegramInputFile`            |
| `params?`   | `Partial<SendVideoNoteParams>` |

```ts
context.sendVideoNote(videoNoteUrl) // => Promise<MessageContext>
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

### `sendMediaGroup(mediaGroup, params?)`

**Отправляет сообщение с альбомом в данный диалог**

|   Параметр   |                            Тип                          |
| :----------: | :-----------------------------------------------------: |
| `mediaGroup` | <code>(InputMediaPhoto &#124; InputMediaVideo)[]</code> |
| `params?`    | `Partial<SendMediaGroupParams>`                         |

```ts
context.sendMediaGroup(mediaGroup) // => Promise<Message[]>
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

### `sendVenue(params)`

**Отправляет сообщение с местом встречи**

| Параметр |        Тип        |
| :------: | :---------------: |
| `params` | `SendVenueParams` |

```ts
context.sendVenue(params) // => Promise<MessageContext>
```

### `sendContact(params)`

**Отправляет сообщение с контактом**

| Параметр |         Тип         |
| :------: | :-----------------: |
| `params` | `SendContactParams` |

```ts
context.sendContact(params) // => Promise<MessageContext>
```

### `sendPoll(params)`

**Отправляет сообщение с опросом**

| Параметр |        Тип       |
| :------: | :--------------: |
| `params` | `SendPollParams` |

```ts
context.sendPoll(params) // => Promise<SendPollParams>
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

### `sendChatAction(action, params?)`

**Отправляет уведомление в чат о работе бота (печатает, отправляет голосовое сообщение и т.д.)**

| Параметр  |           Тип          |
| :-------: | :--------------------: |
| `action`  | `ChatAction`           |
| `params?` | `SendChatActionParams` |

```ts
context.sendChatAction('typing') // => Promise<true>
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

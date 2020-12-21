# `Chat`

```ts
import { Chat } from 'puregram';
```

## Constructor

```ts
const chat = new Chat(payload);
```

| Параметр  |         Тип         |
| :-------: | :-----------------: |
| `payload` | `TelegramChatUnion` |

## Геттеры структуры

### Содержание

* [`id`](#id)
* [`type`](#type)
* [`title`](#title)
* [`username`](#username)
* [`firstName`](#firstname)
* [`lastName`](#lastname)
* [`photo`](#photo)
* [`bio`](#bio)
* [`linkedChatId`](#linkedchatid)
* [`location`](#location)
* [`description`](#description)
* [`inviteLink`](#invitelink)
* [`pinnedMessage`](#pinnedmessage)
* [`permissions`](#permissions)
* [`slowModeDelay`](#slowmodedelay)
* [`stickerSetName`](#stickersetname)
* [`canSetStickerSet`](#cansetstickerset)

---

### `id`

**Уникальный идентификатор чата**

```ts
chat.id // => number
```

### `type`

**Тип чата**

* _Возможные значения:_ `private`, `group`, `supergroup`, `channel`

```ts
chat.type // => ChatType
```

### `title`

**Название чата**

* _Для супергрупп, каналов или групповых чатов_

```ts
chat.title // => string | undefined
```

### `username`

**Короткое имя чата**

* _Для ЛС, супергрупп и каналов_

```ts
chat.username // => string | undefined
```

### `firstName`

**Имя собеседника**

* _Для ЛС_

```ts
chat.firstName // => string | undefined
```

### `lastName`

**Фамилия собеседника**

* _Для ЛС_

```ts
chat.lastName // => string | undefined
```

### `photo`

**Фотография чата**

* _Возвращается только в методе `getChat`_

```ts
chat.photo // => ChatPhoto | undefined
```

### `bio`

**Описание человека**

* _Для ЛС_
* _Возвращается только в методе `getChat`_

```ts
chat.bio // => string | undefined
```

### `linkedChatId`

**Уникальный идентификатор привязанного чата**

* _Для каналов_
* _Возвращается только в методе `getChat`_

```ts
chat.linkedChatId // => number | undefined
```

### `location`

**Локация чата**

* _Для супергрупп_
* _Возвращается только в методе `getChat`_

```ts
chat.location // => ChatLocation | undefined
```

### `description`

**Описание чата**

* _Для групп, супергрупп и групповых чатов_
* _Возвращается только в методе `getChat`_

```ts
chat.description // => string | undefined
```

### `inviteLink`

**Ссылка-приглашение**

* _Возвращается только в методе `getChat`_

```ts
chat.inviteLink // => string | undefined
```

### `pinnedMessage`

**Закрепленное сообщение (для групп, супергрупп и каналов)**

* _Для групп, супергрупп и каналов_
* _Возвращается только в методе `getChat`_

```ts
chat.pinnedMessage // => Message | undefined
```

### `permissions`

**Права пользователя по умолчанию (для групп и супергрупп)**

* _Для групп и супергрупп_
* _Возвращается только в методе `getChat`_

```ts
chat.permissions // => ChatPermissions | undefined
```

### `slowModeDelay`

**Минимальная задержка между отправкой сообщений в чате**

* _Для супергрупп_
* _Возвращается только в методе `getChat`_

```ts
chat.slowModeDelay // => number | undefined
```

### `stickerSetName`

**Название стикерпака чата**

* _Для супергрупп_
* _Возвращается только в методе `getChat`_

```ts
chat.stickerSetName // => string | undefined
```

### `canSetStickerSet`

**`true`, если бот может менять стикеры в стикерпаке чата.**

* _Для супергрупп_
* _Возвращается только в методе `getChat`_

```ts
chat.canSetStickerSet // => boolean | undefined
```
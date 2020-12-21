# `ChatPermissions`

```ts
import { ChatPermissions } from 'puregram';
```

## Constructor

```ts
const permissions = new ChatPermissions(payload);
```

| Параметр  |            Тип            |
| :-------: | :-----------------------: |
| `payload` | `TelegramChatPermissions` |

## Геттеры структуры

### Содержание

* [`canSendMessages`](#cansendmessages)
* [`canSendMediaMessages`](#cansendmediamessages)
* [`canSendPolls`](#cansendpolls)
* [`canSendOtherMessages`](#cansendothermessages)
* [`canAddWebPagePreviews`](#canaddwebpagepreviews)
* [`canChangeInfo`](#canchangeinfo)
* [`canInviteUsers`](#caninviteusers)
* [`canPinMessages`](#canpinmessages)

---

### `canSendMessages`

**`true`, если пользователь может отправлять сообщения**

```ts
permissions.canSendMessages // => boolean | undefined
```

### `canSendMediaMessages`

**`true`, если пользователь может отправлять медиа-сообщения**

```ts
permissions.canSendMediaMessages // => boolean | undefined
```

### `canSendPolls`

**`true`, если пользователь может отправлять опросы**

```ts
permissions.canSendPolls // => boolean | undefined
```

### `canSendOtherMessages`

**`true`, если пользователь может отправлять анимации, игры, стикеры и использовать инлайн-ботов**

```ts
permissions.canSendOtherMessages // => boolean | undefined
```

### `canAddWebPagePreviews`

**`true`, если пользователь может прикреплять сниппеты веб-страниц к сообщению**

```ts
permissions.canAddWebPagePreviews // => boolean | undefined
```

### `canChangeInfo`

**`true`, если пользователь может редактировать информацию беседы (название, фото и т.д.)**

```ts
permissions.canChangeInfo // => boolean | undefined
```

### `canInviteUsers`

**`true`, если пользователь может приглашать других пользователей**

```ts
permissions.canInviteUsers // => boolean | undefined
```

### `canPinMessages`

**`true`, если пользователь может закреплять сообщения**

```ts
permissions.canPinMessages // => boolean | undefined
```
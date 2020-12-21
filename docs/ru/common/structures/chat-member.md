# `ChatMember`

**Класс, содержащий информацию о пользователе в чате.**

```ts
import { ChatMember } from 'puregram';
```

## Constructor

```ts
const chatMember = new ChatMember(payload);
```

| Параметр  |         Тип          |
| :-------: | :------------------: |
| `payload` | `TelegramChatMember` |

## Геттеры структуры

### Содержание

* [`user`](#user)
* [`status`](#status)
* [`customTitle`](#customtitle)
* [`isAnonymous`](#isanonymous)
* [`untilDate`](#untildate)
* [`canBeEdited`](#canbeedited)
* [`canPostMessages`](#canpostmessages)
* [`canEditMessages`](#caneditmessages)
* [`canDeleteMessages`](#candeletemessages)
* [`canRestrictMembers`](#canrestrictmembers)
* [`canPromoteMembers`](#canpromotemembers)
* [`canChangeInfo`](#canchangeinfo)
* [`canInviteUsers`](#caninviteusers)
* [`canPinMessages`](#canpinmessages)
* [`isMember`](#ismember)
* [`canSendMessages`](#cansendmessages)
* [`canSendMediaMessages`](#cansendmediamessages)
* [`canSendPolls`](#cansendpolls)
* [`canSendOtherMessages`](#cansendothermessages)
* [`canAddWebPagePreviews`](#canaddwebpagepreviews)

---

### `user`

**Информация о пользователе**

```ts
chatMember.user // => User
```

### `status`

**Статус пользователя**

```ts
chatMember.status // => ChatMemberStatus
```

### `customTitle`

**Должность пользователя**

* _Только для владельцев и администраторов_

```ts
chatMember.customTitle // => string | undefined
```

### `isAnonymous`

**`true`, если пользователь был скрыт из списка пользователей**

* _Только для владельцев и администраторов_

```ts
chatMember.isAnonymous // => boolean | undefined
```

### `untilDate`

**UNIX-дата окончания ограничений для пользователя**

* _Только для исключенных пользователей_

```ts
chatMember.untilDate // => number | undefined
```

### `canBeEdited`

**`true`, если бот может редактировать пользователя**

* _Только для владельцев и администраторов_

```ts
chatMember.canBeEdited // => boolean | undefined
```

### `canPostMessages`

**`true`, если администратор может выкладывать посты**

* _Для каналов_
* _Только для владельцев и администраторов_

```ts
chatMember.canPostMessages // => boolean | undefined
```

### `canEditMessages`

**`true`, если администратор может закреплять сообщения и редактировать чужие сообщения**

* _Для каналов_
* _Только для владельцев и администраторов_

```ts
chatMember.canEditMessages // => boolean | undefined
```

### `canDeleteMessages`

**`true`, если администратор может удалять чужие сообщения**

* _Только для владельцев и администраторов_

```ts
chatMember.canDeleteMessages // => boolean | undefined
```

### `canRestrictMembers`

**`true`, если администратор может ограничивать, банить или разбанивать пользователей**

* _Только для владельцев и администраторов_

```ts
chatMember.canRestrictMembers // => boolean | undefined
```

### `canPromoteMembers`

**`true`, если администратор может назначать других администраторов**

* _Только для владельцев и администраторов_

```ts
chatMember.canPromoteMembers // => boolean | undefined
```

### `canChangeInfo`

**`true`, если пользователь может редактировать информацию беседы (название, фото и т.д.)**

* _Только для владельцев и администраторов_

```ts
chatMember.canChangeInfo // => boolean | undefined
```

### `canInviteUsers`

**`true`, если пользователь может приглашать других пользователей**

* _Только для владельцев и администраторов_

```ts
chatMember.canInviteUsers // => boolean | undefined
```

### `canPinMessages`

**`true`, если пользователь может закреплять сообщения**

* _Для групповых чатов и супергрупп_
* _Только для владельцев и администраторов_

```ts
chatMember.canPinMessages // => boolean | undefined
```

### `isMember`

**`true`, если пользователь является участником группы/чата/канала**

* _Только для ограниченных пользователей_

```ts
chatMember.isMember // => boolean | undefined
```

### `canSendMessages`

**`true`, если пользователь может отправлять сообщения**

* _Только для ограниченных пользователей_

```ts
chatMember.canSendMessages // => boolean | undefined
```

### `canSendMediaMessages`

**`true`, если пользователь может отправлять медиа-сообщения**

* _Только для ограниченных пользователей_

```ts
chatMember.canSendMediaMessages // => boolean | undefined
```

### `canSendPolls`

**`true`, если пользователь может отправлять опросы**

* _Только для ограниченных пользователей_

```ts
chatMember.canSendPolls // => boolean | undefined
```

### `canSendOtherMessages`

**`true`, если пользователь может отправлять анимации, игры, стикеры и использовать инлайн-ботов**

* _Только для ограниченных пользователей_

```ts
chatMember.canSendOtherMessages // => boolean | undefined
```

### `canAddWebPagePreviews`

**`true`, если пользователь может прикреплять сниппеты веб-страниц к сообщению**

* _Только для ограниченных пользователей_

```ts
chatMember.canAddWebPagePreviews // => boolean | undefined
```
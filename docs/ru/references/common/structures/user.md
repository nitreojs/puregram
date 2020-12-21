# `User`

```ts
import { User } from 'puregram';
```

## Constructor

```ts
const user = new User(payload);
```

| Параметр  |      Тип       |
| :-------: | :------------: |
| `payload` | `TelegramUser` |

## Геттеры структуры

### Содержание

* [`id`](#id)
* [`isBot`](#isbot)
* [`firstName`](#firstname)
* [`lastName`](#lastname)
* [`username`](#username)
* [`languageCode`](#languagecode)
* [`canJoinGroups`](#canjoingroups)
* [`canReadAllGroupMessages`](#canreadallgroupmessages)
* [`supportsInlineQueries`](#supportsinlinequeries)

---

### `id`

**Уникальный идентификатор пользователя/бота**

```ts
user.id // => number
```

### `isBot`

**`true`, если пользователь является ботом**

```ts
user.isBot // => boolean
```

### `firstName`

**Имя бота или пользователя**

```ts
user.firstName // => string
```

### `lastName`

**Фамилия бота или пользователя**

```ts
user.lastName // => string | undefined
```

### `username`

**Короткое имя бота или пользователя**

```ts
user.username // => string | undefined
```

### `languageCode`

**Код языка пользователя или бота**

```ts
user.languageCode // => string | undefined
```

### `canJoinGroups`

**`true`, если бот может быть приглашён в групповые чаты**

* _Только для `getMe`_

```ts
user.canJoinGroups // => boolean | undefined
```

### `canReadAllGroupMessages`

**`true`, если в боте выключен `privacy mode`**

* _Только для `getMe`_

```ts
user.canReadAllGroupMessages // => boolean | undefined
```

### `supportsInlineQueries`

**`true`, если бот поддерживает инлайн-запросы**

* _Только для `getMe`_

```ts
user.supportsInlineQueries // => boolean | undefined
```
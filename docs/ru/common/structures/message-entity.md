# `MessageEntity`

```ts
import { MessageEntity } from 'puregram';
```

## Constructor

```ts
const messageEntity = new MessageEntity(payload);
```

| Параметр  |             Тип              |
| :-------: | :--------------------------: |
| `payload` | `TelegramMessageEntityUnion` |

## Геттеры структуры

### Содержание

* [`type`](#type)
* [`offset`](#offset)
* [`length`](#length)
* [`url`](#url)
* [`user`](#user)
* [`language`](#language)

---

### `type`

**Тип `entity`**

* _Возможные значения:_  `mention`, `hashtag`, `cashtag`, `bot_command`, `url`, `email`, `phone_number`, `bold`, `italic`, `underline`, `strikethrough`, `code`, `pre`, `text_link`, `text_mention`

```ts
messageEntity.type // => EntityType
```

### `offset`

**Отступ `entity`**

```ts
messageEntity.offset // => number
```

### `length`

**Длина `entity`**

```ts
messageEntity.length // => number
```

### `url`

**Ссылка, которая будет открыта по нажатии на текст**

* _Только для `text_link`_

```ts
messageEntity.url // => string | undefined
```

### `user`

**Упомянутый пользователь**

* _Только для `text_mention`_

```ts
messageEntity.user // => User | undefined
```

### `language`

**Язык программирования, указанный для этого `entity`**

* _Только для `pre`_

```ts
messageEntity.language // => string | undefined
```
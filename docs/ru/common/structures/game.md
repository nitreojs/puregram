# `Game`

```ts
import { Game } from 'puregram';
```

## Constructor

```ts
const game = new Game(payload);
```

| Параметр  |      Тип       |
| :-------: | :------------: |
| `payload` | `TelegramGame` |

## Геттеры структуры

### Содержание

* [`title`](#title)
* [`description`](#description)
* [`photo`](#photo)
* [`text`](#text)
* [`textEntities`](#textentities)

---

### `title`

**Название игры**

```ts
game.title // => string
```

### `description`

**Описание игры**

```ts
game.description // => string
```

### `photo`

**Фото, отображаемое во время игры другим пользователям в чате**

```ts
game.photo // => PhotoSize[]
```

### `text`

**Описание игры или топов, которые будут отображены в игровом сообщении**

* _`0-4096` символов_

```ts
game.text // => string | undefined
```

### `textEntities`

**`entities` сообщения**

```ts
game.textEntities // => MessageEntity[]
```
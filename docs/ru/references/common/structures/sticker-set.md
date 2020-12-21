# `StickerSet`

```ts
import { StickerSet } from 'puregram';
```

## Constructor

```ts
const stickerSet = new StickerSet(payload);
```

| Параметр  |         Тип          |
| :-------: | :------------------: |
| `payload` | `TelegramStickerSet` |

## Геттеры структуры

### Содержание

* [`name`](#name)
* [`title`](#title)
* [`isAnimated`](#isanimated)
* [`containsMasks`](#containsmasks)
* [`stickers`](#stickers)
* [`thumb`](#thumb)

---

### `name`

**Название стикерпака**

```ts
stickerSet.name // => string
```

### `title`

**Заголовок стикерпака**

```ts
stickerSet.title // => string
```

### `isAnimated`

**`true`, если в стикерпаке есть анимированные стикеры**

```ts
stickerSet.isAnimated // => boolean
```

### `containsMasks`

**`true`, если стикерпак содержит маски**

```ts
stickerSet.containsMasks // => boolean
```

### `stickers`

**Список стикеров**

```ts
stickerSet.stickers // => StickerAttachment[]
```

### `thumb`

**Обложка стикерпака**

```ts
stickerSet.thumb // => PhotoSize | undefined
```

References: [`PhotoSize`](./photo-size.md)
# `Animation`

Класс **анимации**, наследуется от [`FileAttachment`](file-attachment.md).

```ts
import { Animation } from 'puregram';
```

## Constructor

```ts
const animation = new Animation(payload);
```

| Параметр  |                                 Тип                                 |
| :-------: | :-----------------------------------------------------------------: |
| `payload` | [`TelegramAnimation`](https://core.telegram.org/bots/api#animation) |

## Геттеры класса

### Содержание

* [`width`](#width)
* [`height`](#height)
* [`duration`](#duration)
* [`thumb`](#thumb)
* [`fileName`](#filename)
* [`mimeType`](#mimetype)
* [`fileSize`](#filesize)

---

### `width`

**Возвращает ширину анимации**

```ts
animation.width // => number
```

### `height`

**Возвращает высоту анимации**

```ts
animation.height // => number
```

### `duration`

**Возвращает длину анимации в секундах**

```ts
animation.duration // => number
```

### `thumb`

**Возвращает обложку анимации**

```ts
animation.thumbnail // => PhotoSize | undefined
```

References: [`PhotoSize`](../structures/photo-size.md)

### `fileName`

**Возвращает название файла анимации**

```ts
animation.fileName // => string | undefined
```

### `mimeType`

**Возвращает MIME тип файла**

```ts
animation.mimeType // => string | undefined
```

### `fileSize`

**Возвращает вес файла**

```ts
animation.fileSize // => number | undefined
```


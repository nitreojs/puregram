# `Video`

Класс **видео-вложения**, наследуется от [`FileAttachment`](file-attachment.md).

```ts
import { Video } from 'puregram';
```

## Constructor

```ts
const video = new Video(payload);
```

| Параметр  |                             Тип                             |
| :-------: | :---------------------------------------------------------: |
| `payload` | [`TelegramVideo`](https://core.telegram.org/bots/api#video) |

## Геттеры класса

### Содержание

* [`width`](#width)
* [`height`](#height)
* [`duration`](#duration)
* [`thumb`](#thumb)
* [`mimeType`](#mimetype)
* [`fileSize`](#filesize)

---

### `width`

**Возвращает ширину видео.**

```ts
video.width // => number
```

### `height`

**Возвращает высоту видео.**

```ts
video.height // => number
```

### `duration`

**Возвращает длительность видео в секундах.**

```ts
video.duration // => number
```

### `thumb`

**Возвращает обложку видео.**

```ts
video.thumb // => PhotoSize | undefined
```

### `mimeType`

**Возвращает MIME тип видео.**

```ts
video.mimeType // => string | undefined
```

### `fileSize`

**Возвращает вес файла.**

```ts
video.fileSize // => number | undefined
```

# `VideoNote`

Класс **видео-заметки**, наследуется от [`FileAttachment`](file-attachment.md).

```ts
import { VideoNote } from 'puregram';
```

## Constructor

```ts
const videoNote: VideoNote = new VideoNote(payload);
```

| Параметр  |                                 Тип                                 |
| :-------: | :-----------------------------------------------------------------: |
| `payload` | [`TelegramVideoNote`](https://core.telegram.org/bots/api#videonote) |

## Геттеры класса

### Table of Contents

* [`length`](#length)
* [`duration`](#duration)
* [`thumb`](#thumb)
* [`fileSize`](#filesize)

---

### `length`

**Возвращает диаметр (ширина * высота) видео-заметки.**

```ts
videoNote.length // => number
```

### `duration`

**Возвращает длительность видео-заметки в секундах.**

```ts
videoNote.duration // => number
```

### `thumb`

**Возвращает обложку видео-заметки.**

```ts
videoNote.thumb // => PhotoSize | undefined
```

### `fileSize`

**Возвращает вес файла.**

```ts
videoNote.fileSize // => number | undefined
```

# `Audio`

Класс **аудио-вложения**, наследуется от [`FileAttachment`](file-attachment.md).

```ts
import { Audio } from 'puregram';
```

## Constructor

```ts
const audio = new Audio(payload);
```

| Параметр  |                             Тип                             |
| :-------: | :---------------------------------------------------------: |
| `payload` | [`TelegramAudio`](https://core.telegram.org/bots/api#audio) |

## Геттеры класса

### Содержание

* [`duration`](#duration)
* [`performer`](#performer)
* [`title`](#title)
* [`mimeType`](#mimetype)
* [`fileSize`](#filesize)
* [`thumb`](#thumb)

---

### `duration`

**Возвращает длительность трека в секундах.**

```ts
audio.duration // => number
```

### `performer`

**Возвращает исполнителя трека.**

```ts
audio.performer // => string | undefined
```

### `title`

**Возвращает название трека.**

```ts
audio.title // => string | undefined
```

### `mimeType`

**Возвращает MIME тип трека.**

```ts
audio.mimeType // => string | undefined
```

### `fileSize`

**Возвращает вес файла.**

```ts
audio.fileSize // => number | undefined
```

### `thumb`

**Возвращает обложку аудио-вложения.**

```ts
audio.thumb // => PhotoSize | undefined
```

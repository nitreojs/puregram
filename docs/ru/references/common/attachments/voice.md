# `Voice`

Класс **голосового сообщения**, наследуется от [`FileAttachment`](file-attachment.md).

```ts
import { Voice } from 'puregram';
```

## Constructor

```ts
const voice = new Voice(payload);
```

| Параметр  |                             Тип                             |
| :-------: | :---------------------------------------------------------: |
| `payload` | [`TelegramVoice`](https://core.telegram.org/bots/api#voice) |

## Геттеры класса

### Содержание

* [`duration`](#duration)
* [`mimeType`](#mimetype)
* [`fileSize`](#filesize)

---

### `duration`

**Возвращает длительность голосового сообщения в секундах**

```ts
voice.duration // => number
```

### `mimeType`

**Возвращает MIME тип голосового сообщения**

```ts
voice.mimeType // => string | undefined
```

### `fileSize`

**Возвращает вес файла**

```ts
voice.fileSize // => number | undefined
```

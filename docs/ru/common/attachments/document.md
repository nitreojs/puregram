# `Document`

Класс **документа**, наследуется от [`FileAttachment`](file-attachment.md).

```ts
import { Document } from 'puregram';
```

## Constructor

```ts
const document = new Document(payload);
```

| Параметр  |                                Тип                                |
| :-------: | :---------------------------------------------------------------: |
| `payload` | [`TelegramDocument`](https://core.telegram.org/bots/api#document) |

## Геттеры класса

### Содержание

* [`thumb`](#thumb)
* [`fileName`](#filename)
* [`mimeType`](#mimetype)
* [`fileSize`](#filesize)

---

### `thumb`

**Возвращает обложку документа.**

```ts
document.thumb // => PhotoSize | undefined
```

### `fileName`

**Возвращает название файла.**

```ts
document.fileName // => string | undefined
```

### `mimeType`

**Возвращает MIME тип документа.**

```ts
document.mimeType // => string | undefined
```

### `fileSize`

**Возвращает вес файла.**

```ts
document.fileSize // => number | undefined
```

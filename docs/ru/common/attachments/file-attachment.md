# `FileAttachment`

Класс **FileAttachment**, наследуется от [`Attachment`](attachment.md).

```ts
import { FileAttachment } from 'puregram';
```

## Constructor

```ts
const fileAttachment: FileAttachment<T> = new FileAttachment<T>(payload);
```

| Параметр |              Тип               |
| :------: | :----------------------------: |
| `T?`     | `T extends TelegramAttachment` |

## Геттеры класса

### Table of Contents

* [`fileId`](#fileid)
* [`fileUniqueId`](#fileuniqueid)

---

### `fileId`

**Возвращает `fileId` вложения.**

```ts
fileAttachment.fileId // => string
```

### `fileUniqueId`

**Возвращает `fileUniqueId` вложения.**

```ts
fileAttachment.fileUniqueId // => string
```

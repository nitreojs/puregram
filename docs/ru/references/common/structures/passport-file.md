# `PassportFile`

```ts
import { PassportFile } from 'puregram';
```

## Constructor

```ts
const passportFile = new PassportFile(payload);
```

| Параметр  |          Тип           |
| :-------: | :--------------------: |
| `payload` | `TelegramPassportFile` |

## Геттеры структуры

### Содержание

* [`fileId`](#fileid)
* [`fileUniqueId`](#fileuniqueid)
* [`fileSize`](#filesize)
* [`fileDate`](#filedate)

---

### `fileId`

**Уникальный идентификатор файла, который можно использовать для прикрепления / скачивания**

```ts
passportFile.fileId // => string
```

### `fileUniqueId`

**Уникальный идентификатор файла; используется для сравнивания контента файлов**

```ts
passportFile.fileUniqueId // => string
```

### `fileSize`

**Размер файла**

```ts
passportFile.fileSize // => number
```

### `fileDate`

**UNIX-дата выкладывания файла**

```ts
passportFile.fileDate // => number
```
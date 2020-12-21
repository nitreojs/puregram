# `File`

```ts
import { File } from 'puregram';
```

## Constructor

```ts
const file = new File(payload);
```

| Параметр  |      Тип       |
| :-------: | :------------: |
| `payload` | `TelegramFile` |

## Геттеры структуры

### Содержание

* [`fileId`](#fileid)
* [`fileUniqueId`](#fileuniqueid)
* [`fileSize`](#filesize)
* [`filePath`](#filepath)

---

### `fileId`

**Уникальный идентификатор файла, который можно использовать для прикрепления / скачивания**

```ts
file.fileId // => string
```

### `fileUniqueId`

**Уникальный идентификатор файла; используется для сравнивания контента файлов**

```ts
file.fileUniqueId // => string
```

### `fileSize`

**Размер файла, если известен**

```ts
file.fileSize // => number | undefined
```

### `filePath`

**Путь до файла**

* _Используйте `https://api.telegram.org/file/bot<token>/<file_path>`, чтобы скачать файл_

```ts
file.filePath // => string | undefined
```
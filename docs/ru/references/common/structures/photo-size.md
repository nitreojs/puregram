# `PhotoSize`

```ts
import { PhotoSize } from 'puregram';
```

## Constructor

```ts
const photoSize = new PhotoSize(payload);
```

| Параметр  |         Тип         |
| :-------: | :-----------------: |
| `payload` | `TelegramPhotoSize` |

## Геттеры структуры

### Содержание

* [`fileId`](#fileid)
* [`fileUniqueId`](#fileuniqueid)
* [`width`](#width)
* [`height`](#height)
* [`fileSize`](#filesize)

---

### `fileId`

**Уникальный идентификатор файла, который можно использовать для прикрепления / скачивания**

```ts
photoSize.fileId // => string
```

### `fileUniqueId`

**Уникальный идентификатор файла; используется для сравнивания контента файлов**

```ts
photoSize.fileUniqueId // => string
```

### `width`

**Ширина фотографии**

```ts
photoSize.width // => number
```

### `height`

**Высота фотографии**

```ts
photoSize.height // => number
```

### `fileSize`

**Размер файла**

```ts
photoSize.fileSize // => number | undefined
```
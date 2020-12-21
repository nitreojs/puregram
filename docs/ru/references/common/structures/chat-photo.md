# `ChatPhoto`

```ts
import { ChatPhoto } from 'puregram';
```

## Constructor

```ts
const chatPhoto = new ChatPhoto(payload);
```

| Параметр  |         Тип         |
| :-------: | :-----------------: |
| `payload` | `TelegramChatPhoto` |

## Геттеры структуры

### Содержание

* [`smallFileId`](#smallfileid)
* [`smallFileUniqueId`](#smallfileuniqueid)
* [`bigFileId`](#bigfileid)
* [`bigFileUniqueId`](#bigfileuniqueid)

---

### `smallFileId`

**`file_id` чата, `160x160`**

* _Можно скачивать_

```ts
chatPhoto.smallFileId // => string
```

### `smallFileUniqueId`

**`file_unique_id` чата, `160x160`**

```ts
chatPhoto.smallFileUniqueId // => string
```

### `bigFileId`

**`file_id` чата, `640x640`**

* _Можно скачивать_

```ts
chatPhoto.bigFileId // => string
```

### `bigFileUniqueId`

**`file_unique_id` чата, `640x640`**

```ts
chatPhoto.bigFileUniqueId // => string
```
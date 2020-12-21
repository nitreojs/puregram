# `UserProfilePhotos`

```ts
import { UserProfilePhotos } from 'puregram';
```

## Constructor

```ts
const userProfilePhotos = new UserProfilePhotos(payload);
```

| Параметр  |             Тип             |
| :-------: | :-------------------------: |
| `payload` | `TelegramUserProfilePhotos` |

## Геттеры структуры

### Содержание

* [`totalCount`](#totalcount)
* [`photos`](#photos)

---

### `totalCount`

**Общее количество фотографий профиля**

```ts
userProfilePhotos.totalCount // => number
```

### `photos`

**Запрашиваемые фотографии профиля (до 4 размеров)**

```ts
userProfilePhotos.photos // => PhotoSize[][]
```
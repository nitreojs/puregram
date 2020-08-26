# `Photo`

Класс **фотографии**, наследуется от [`Attachment`](attachment.md).

```ts
import { Photo } from 'puregram';
```

## Constructor

```ts
const photo: Photo = new Photo(payload);
```

| Параметр  |                             Тип                             |
| :-------: | :---------------------------------------------------------: |
| `payload` | [`TelegramPhoto`](https://core.telegram.org/bots/api#photo) |

## Геттеры класса

### Содержание

* [`sizes`](#sizes)
* [`bigSize`](#bigsize)
* [`mediumSize`](#mediumsize)
* [`smallSize`](#smallsize)

---

### `sizes`

**Возвращает список размеров фотографии.**

```ts
photo.sizes // => PhotoSize[]
```

### `bigSize`

**Возвращает самый большой размер фотографии.**

```ts
photo.bigSize // => PhotoSize
```

### `mediumSize`

**Возвращает средний размер фотографии.**

```ts
photo.mediumSize // => PhotoSize
```

### `smallSize`

**Возвращает самый маленький размер фотографии.**

```ts
photo.smallSize // => PhotoSize
```

# `Photo`

Класс **фотографии**, наследуется от [`Attachment`](attachment.md).

```ts
import { Photo } from 'puregram';
```

## Constructor

```ts
const photo = new Photo(payload);
```

| Параметр  |                                  Тип                                  |
| :-------: | :-------------------------------------------------------------------: |
| `payload` | [`TelegramPhotoSize`](https://core.telegram.org/bots/api#photosize)[] |

## Геттеры класса

### Содержание

* [`sizes`](#sizes)
* [`bigSize`](#bigsize)
* [`mediumSize`](#mediumsize)
* [`smallSize`](#smallsize)

---

### `sizes`

**Возвращает список размеров фотографии**

```ts
photo.sizes // => PhotoSize[]
```

References: [`PhotoSize`](../structures/photo-size.md)

### `bigSize`

**Возвращает самый большой размер фотографии**

```ts
photo.bigSize // => PhotoSize
```

References: [`PhotoSize`](../structures/photo-size.md)

### `mediumSize`

**Возвращает средний размер фотографии**

```ts
photo.mediumSize // => PhotoSize
```

References: [`PhotoSize`](../structures/photo-size.md)

### `smallSize`

**Возвращает самый маленький размер фотографии**

```ts
photo.smallSize // => PhotoSize
```

References: [`PhotoSize`](../structures/photo-size.md)

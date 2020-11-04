# `Sticker`

Класс **стикера**, наследуется от [`FileAttachment`](file-attachment.md).

```ts
import { Sticker } from 'puregram';
```

## Constructor

```ts
const sticker = new Sticker(payload);
```

| Параметр  |                               Тип                               |
| :-------: | :-------------------------------------------------------------: |
| `payload` | [`TelegramSticker`](https://core.telegram.org/bots/api#sticker) |

## Геттеры класса

### Содержание

* [`width`](#width)
* [`height`](#height)
* [`isAnimated`](#isanimated)
* [`thumb`](#thumb)
* [`emoji`](#emoji)
* [`setName`](#setname)
* [`maskPosition`](#maskposition)
* [`fileSize`](#filesize)

---

### `width`

**Возвращает ширину стикера**

```ts
sticker.width // => number
```

### `height`

**Возвращает высоту стикера**

```ts
sticker.height // => number
```

### `isAnimated`

**Является ли стикер анимированным?**

```ts
sticker.isAnimated // => boolean
```

### `thumb`

**Возвращает обложку стикера**

```ts
sticker.thumb // => PhotoSize | undefined
```

### `emoji`

**Возвращает смайлик, с которым ассоциируется этот стикер**

```ts
sticker.emoji // => string | undefined
```

### `setName`

**Возвращает название стикер-пака, в котором находится данный стикер**

```ts
sticker.setName // => string | undefined
```

### `maskPosition`

**Если стикер является `mask-sticker`, возвращается позиция маски**

```ts
sticker.maskPosition // => MaskPosition | undefined
```

### `fileSize`

**Возвращает вес файла**

```ts
sticker.fileSize // => number | undefined
```

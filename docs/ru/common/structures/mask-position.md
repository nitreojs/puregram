# `MaskPosition`

```ts
import { MaskPosition } from 'puregram';
```

## Constructor

```ts
const maskPosition = new MaskPosition(payload);
```

| Параметр  |          Тип           |
| :-------: | :--------------------: |
| `payload` | `TelegramMaskPosition` |

## Геттеры структуры

### Содержание

* [`point`](#point)
* [`xShift`](#xshift)
* [`yShift`](#yshift)
* [`scale`](#scale)

---

### `point`

**Часть лица, куда должна быть прикреплена маска**

* _Возможные значения:_ `forehead`, `eyes`, `mouth`, `chin

```ts
maskPosition.point // => MaskPositionPoint
```

### `xShift`

**Смещение по оси X, выраженное в ширинах вписанной в `face` маски, слева направо**

```ts
maskPosition.xShift // => number
```

### `yShift`

**Смещение по оси Y, выраженное в высотах вписанной в `face` маски, сверху вниз**

```ts
maskPosition.yShift // => number
```

### `scale`

**Размер маски**

```ts
maskPosition.scale // => number
```
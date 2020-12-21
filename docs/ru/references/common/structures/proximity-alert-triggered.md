# `ProximityAlertTriggered`

```ts
import { ProximityAlertTriggered } from 'puregram';
```

## Constructor

```ts
const proximityAlertTriggered = new ProximityAlertTriggered(payload);
```

| Параметр  |                Тип                |
| :-------: | :-------------------------------: |
| `payload` | `TelegramProximityAlertTriggered` |

## Геттеры структуры

### Содержание

* [`traveler`](#traveler)
* [`watcher`](#watcher)
* [`distance`](#distance)

---

### `traveler`

**Пользователь, вызвавший предупреждение**

```ts
proximityAlertTriggered.traveler // => User
```

References: [`User`](./user.md)

### `watcher`

**Пользователь, установивший предупреждение**

```ts
proximityAlertTriggered.watcher // => User
```

References: [`User`](./user.md)

### `distance`

**Дистанция между пользователями**

```ts
proximityAlertTriggered.distance // => number
```
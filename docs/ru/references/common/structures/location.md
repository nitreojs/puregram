# `Location`

```ts
import { Location } from 'puregram';
```

## Constructor

```ts
const location = new Location(payload);
```

| Параметр  |        Тип         |
| :-------: | :----------------: |
| `payload` | `TelegramLocation` |

## Геттеры структуры

### Содержание

* [`longitude`](#longitude)
* [`latitude`](#latitude)
* [`horizontalAccuracy`](#horizontalaccuracy)
* [`livePeriod`](#liveperiod)
* [`heading`](#heading)
* [`proximityAlertRadius`](#proximityalertradius)

---

### `longitude`

**Широта**

```ts
location.longitude // => number
```

### `latitude`

**Долгота**

```ts
location.latitude // => number
```

### `horizontalAccuracy`

**Радиус погрешности в метрах**

* _От `0` до `1500`_

```ts
location.horizontalAccuracy // => number | undefined
```

### `livePeriod`

**Время возможного обновления локации в секундах**

* _Только для live-локаций_

```ts
location.livePeriod // => number | undefined
```

### `heading`

**Направление, в котором движется пользователь**

* _От `1` до `360`_
* _Только для live-локаций_

```ts
location.heading // => number | undefined
```

### `proximityAlertRadius`

**Максимальная дистанция в метрах, при достижении которой второй пользователь будет уведомлен о вас**

* _Только для live-локаций_

```ts
location.proximityAlertRadius // => number | undefined
```
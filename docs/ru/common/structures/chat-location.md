# `ChatLocation`

```ts
import { ChatLocation } from 'puregram';
```

## Constructor

```ts
const chatLocation = new ChatLocation(payload);
```

| Параметр  |          Тип           |
| :-------: | :--------------------: |
| `payload` | `TelegramChatLocation` |

## Геттеры структуры

### Содержание

* [`location`](#location)
* [`address`](#address)

---

### `location`

**Локация супергруппы**

* _**Не** может быть live-локацией_

```ts
chatLocation.location // => Location
```

### `address`

**Адрес локации**

* `1-64` символов

```ts
chatLocation.address // => string
```
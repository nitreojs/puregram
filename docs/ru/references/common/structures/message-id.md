# `MessageId`

```ts
import { MessageId } from 'puregram';
```

## Constructor

```ts
const messageId = new MessageId(payload);
```

| Параметр  |         Тип         |
| :-------: | :-----------------: |
| `payload` | `TelegramMessageId` |

## Геттеры структуры

### Содержание

* [`id`](#id)

---

### `id`

**Уникальный идентификатор сообщения**

```ts
messageId.id // => number
```
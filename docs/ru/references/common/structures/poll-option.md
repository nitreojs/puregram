# `PollOption`

```ts
import { PollOption } from 'puregram';
```

## Constructor

```ts
const pollOption = new PollOption(payload);
```

| Параметр  |         Тип          |
| :-------: | :------------------: |
| `payload` | `TelegramPollOption` |

## Геттеры структуры

### Содержание

* [`text`](#text)
* [`voterCount`](#votercount)

---

### `text`

**Текст выбора**

* _`1-100` символов_

```ts
pollOption.text // => string
```

### `voterCount`

**Кол-во пользователей, проголосовавших за этот вариант**

```ts
pollOption.voterCount // => number
```
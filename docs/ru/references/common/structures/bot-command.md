# `BotCommand`

```ts
import { BotCommand } from 'puregram';
```

## Constructor

```ts
const botCommand = new BotCommand(payload);
```

| Параметр  |         Тип          |
| :-------: | :------------------: |
| `payload` | `TelegramBotCommand` |

## Геттеры структуры

### Содержание

* [`command`](#command)
* [`description`](#description)

---

### `command`

**Команда**

```ts
botCommand.command // => string
```

### `description`

**Описание команды**

```ts
botCommand.description // => string
```
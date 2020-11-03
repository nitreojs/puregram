# `PollContext`

Контекст, наследуемый от `Poll` и [`Context`](context.md).

**Вызывается, когда в диалог приходит опрос.**

```ts
import { PollContext } from 'puregram';
```

## Содержание

* [**События, вызывающие контекст**](#события-вызывающие-контекст)
* [**Constructor**](#constructor)

## События, вызывающие контекст

* `poll`

## Constructor

```ts
const context = new PollContext(telegram, update);
```

|  Параметр  |       Тип      |             Описание           |
| :--------: | :------------: | :----------------------------: |
| `telegram` | `Telegram`     | Инстанция `Telegram`           |
| `update`   | `TelegramPoll` | [Объект события][TelegramPoll] |

[TelegramPoll]: https://core.telegram.org/bots/api#poll

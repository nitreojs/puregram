# `InlineQueryContext`

Контекст, наследуемый от классов `InlineQuery` и [`Context`](context.md).

**Вызывается, когда пользователь ввёл какую-либо информацию в инлайн-бота.**

```ts
import { InlineQueryContext } from 'puregram';
```

## Содержание

* [**События, вызывающие контекст**](#события-вызывающие-контекст)
* [**Constructor**](#constructor)
* [**Контекстуальные методы**](#контекстуальные-методы)

## События, вызывающие контекст

* `inline_query`

## Constructor

```ts
const context: InlineQueryContext = new InlineQueryContext(telegram, update);
```

|  Параметр  |          Тип          |                Описание               |
| :--------: | :-------------------: | :-----------------------------------: |
| `telegram` | `Telegram`            | Инстанция `Telegram`                  |
| `update`   | `TelegramInlineQuery` | [Объект события][TelegramInlineQuery] |

[TelegramInlineQuery]: https://core.telegram.org/bots/api#inlinequery

## Контекстуальные методы

### Содержание

* [`answerInlineQuery`](#answerinlinequeryresults-params)

---

### `answerInlineQuery(results, params?)`

**Отсылает пользователю ответ на инлайн-запрос.**

| Параметр  |                Тип                 |
| :-------: | :--------------------------------: |
| `results` | `InlineQueryResultUnion[]`         |
| `params?` | `Partial<AnswerInlineQueryParams>` |

```ts
context.answerInlineQuery(results) // => Promise<true>
```

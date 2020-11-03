# `CallbackQueryContext`

Контекст, наследуемый от классов `CallbackQuery` и [`Context`](context.md).

**Вызывается, когда пользователь нажимает на инлайн-кнопку.**

```ts
import { CallbackQueryContext } from 'puregram';
```

## Содержание

* [**События, вызывающие контекст**](#события-вызывающие-контекст)
* [**Constructor**](#constructor)
* [**Методы и геттеры контекста**](#методы-и-геттеры-контекста)
* [**Контекстуальные методы**](#контекстуальные-методы)

## События, вызывающие контекст

* `callback_query`

## Constructor

```ts
const context: CallbackQueryContext = new CallbackQueryContext(telegram, update);
```

|  Параметр  |           Тип           |                 Описание                |
| :--------: | :---------------------: | :-------------------------------------: |
| `telegram` | `Telegram`              | Инстанция `Telegram`                    |
| `update`   | `TelegramCallbackQuery` | [Объект события][TelegramCallbackQuery] |

[TelegramCallbackQuery]: https://core.telegram.org/bots/api#callbackquery

## Методы и геттеры контекста

### Содержание

* [`message`](#message)
* [`queryPayload`](#querypayload)

---

### `message`

**Возвращает контекст того сообщения, у которого была нажата инлайн-кнопка.**

```ts
context.message // => MessageContext | undefined
```

### `queryPayload`

**Возвращает данные, которые были переданы в качестве `payload` у кнопки**

```ts
context.queryPayload // => Record<string, any> | string | undefined
```

## Контекстуальные методы

### Содержание

* [`answerCallbackQuery`](#answercallbackqueryparams)

---

### `answerCallbackQuery(params?)`

**Отсылает пользователю индикатор в виде "уведомления" или окошка.**

| Параметр  |                 Тип                  |
| :-------: | :----------------------------------: |
| `params?` | `Partial<AnswerCallbackQueryParams>` |

```ts
context.answerCallbackQuery(params) // => Promise<true>
```

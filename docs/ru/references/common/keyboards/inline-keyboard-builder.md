# `InlineKeyboardBuilder`

**Класс сборщика инлайн клавиатуры.**

```js
import { InlineKeyboardBuilder } from 'puregram';
```

## Содержание

* [**Constructor**](#constructor)
* [**Пример использования**](#пример-использования)
* [**Методы и геттеры класса**](#методы-и-геттеры-класса)

## Constructor

```ts
const builder = new InlineKeyboardBuilder();
```

## Пример использования

```js
const keyboard = new InlineKeyboardBuilder()
  .textButton({
    text: 'Some text',
    payload: 'some-payload'
  })
  .row()
  .textButton({
    text: 'Some more text',
    payload: 'some-more-payload'
  })
  .textButton({
    text: 'Another text',
    payload: 'another-payload'
  });

context.send('Take the keyboard, built using inline keyboard builder!', {
  reply_markup: keyboard
});
```

## Методы и геттеры класса

### Содержание

* [`textButton`](#textbuttonparams)
* [`urlButton`](#urlbuttonparams)
* [`switchToCurrentChatButton`](#switchtocurrentchatbuttonparams)
* [`switchToChatButton`](#switchtochatbuttonparams)
* [`gameButton`](#gamebuttonparams)
* [`payButton`](#paybuttonparams)
* [`loginButton`](#loginbuttonparams)
* [`row`](#row)

---

### `textButton(params)`

**Создаёт текстовую инлайн кнопку**

| Параметр |        Тип         |
| :------: | :----------------: |
| `params` | `TextButtonParams` |

```ts
builder.textButton({
  text: 'Text',
  payload: 'some-payload'
}) // => InlineKeyboardBuilder
```

### `urlButton(params)`

**Создаёт инлайн кнопку-ссылку**

| Параметр |        Тип        |
| :------: | :---------------: |
| `params` | `UrlButtonParams` |

```ts
builder.urlButton({
  text: 'Text',
  url: 'https://example.com'
}) // => InlineKeyboardBuilder
```

### `switchToCurrentChatButton(params)`

**Создаёт кнопку, при нажатии на которую в текущий чат вставляется упоминание бота и указанный `query`**

| Параметр |                Тип                |
| :------: | :-------------------------------: |
| `params` | `SwitchToCurrentChatButtonParams` |

```ts
builder.switchToCurrentChatButton({
  text: 'Text',
  query: 'Test query'
}) // => InlineKeyboardBuilder
```

### `switchToChatButton(params)`

**Создаёт кнопку, которая попросит выбрать чат, в который будет вставлено упоминание бота и указанный `query`**

| Параметр |            Тип             |
| :------: | :------------------------: |
| `params` | `SwitchToChatButtonParams` |

```ts
builder.switchToChatButton({
  text: 'Text',
  query: 'Test query'
}) // => InlineKeyboardBuilder
```

### `gameButton(params)`

**Создаёт кнопку игры**

| Параметр |        Тип         |
| :------: | :----------------: |
| `params` | `GameButtonParams` |

```ts
builder.gameButton({
  text: 'Text',
  game
}) // => InlineKeyboardBuilder
```

### `payButton(params)`

**Создаёт кнопку оплаты**

| Параметр |        Тип        |
| :------: | :---------------: |
| `params` | `PayButtonParams` |

```ts
builder.payButton({
  text: 'Text'
}) // => InlineKeyboardBuilder
```

### `loginButton(params)`

**Создаёт кнопку-логин**

| Параметр |         Тип         |
| :------: | :-----------------: |
| `params` | `LoginButtonParams` |

```ts
builder.loginButton({
  text: 'Text',
  loginUrl
}) // => InlineKeyboardBuilder
```

### `row()`

**Отделяет прошлую строку кнопок от следующей**

```ts
builder
  .textButton({ text: 'Text', payload: 'some-payload' })
  .row()
  .textButton({ text: 'Text', payload: 'some-payload' }) // => InlineKeyboardBuilder
```
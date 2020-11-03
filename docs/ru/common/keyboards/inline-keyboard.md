# `InlineKeyboard`

**Класс клавиатуры, присоединяемой к сообщению.**

```js
import { InlineKeyboard } from 'puregram';
```

## Методы и геттеры класса

### Содержание

* [`keyboard`](#static-keyboardrows)
* [`textButton`](#static-textbuttonparams)
* [`urlButton`](#static-urlbuttonparams)
* [`switchToCurrentChatButton`](#static-switchtocurrentchatbuttonparams)
* [`switchToChatButton`](#static-switchtochatbuttonparams)
* [`gameButton`](#static-gamebuttonparams)
* [`payButton`](#static-paybuttonparams)
* [`loginButton`](#static-loginbuttonparams)

---

### `static keyboard(rows)`

**Создаёт клавиатуру из заданных кнопок.**

| Параметр |                                 Тип                                 |
| :------: | :-----------------------------------------------------------------: |
| `rows`   | `(TelegramInlineKeyboardButton | TelegramInlineKeyboardButton[])[]` |

```ts
InlineKeyboard.keyboard(rows) // => InlineKeyboard
```

### `static textButton(params)`

**Создаёт текстовую инлайн кнопку.**

| Параметр |        Тип         |
| :------: | :----------------: |
| `params` | `TextButtonParams` |

```ts
InlineKeyboard.textButton({
  text: 'Text',
  payload: 'some-payload'
}) // => InlineKeyboardTextButton
```

### `static urlButton(params)`

**Создаёт инлайн кнопку-ссылку.**

| Параметр |        Тип        |
| :------: | :---------------: |
| `params` | `UrlButtonParams` |

```ts
InlineKeyboard.urlButton({
  text: 'Text',
  url: 'https://example.com'
}) // => InlineKeyboardUrlButton
```

### `static switchToCurrentChatButton(params)`

**Создаёт кнопку, при нажатии на которую в текущий чат вставляется упоминание бота и указанный `query`.**

| Параметр |                Тип                |
| :------: | :-------------------------------: |
| `params` | `SwitchToCurrentChatButtonParams` |

```ts
InlineKeyboard.switchToCurrentChatButton({
  text: 'Text',
  query: 'Test query'
}) // => InlineKeyboardSwitchToCurrentChatButton
```

### `static switchToChatButton(params)`

**Создаёт кнопку, которая попросит выбрать чат, в который будет вставлено упоминание бота и указанный `query`.**

| Параметр |            Тип             |
| :------: | :------------------------: |
| `params` | `SwitchToChatButtonParams` |

```ts
InlineKeyboard.switchToChatButton({
  text: 'Text',
  query: 'Test query'
}) // => InlineKeyboardSwitchToChatButton
```

### `static gameButton(params)`

**Создаёт кнопку игры.**

| Параметр |        Тип         |
| :------: | :----------------: |
| `params` | `GameButtonParams` |

```ts
InlineKeyboard.gameButton({
  text: 'Text',
  game
}) // => InlineKeyboardGameButton
```

### `static payButton(params)`

**Создаёт кнопку оплаты.**

| Параметр |        Тип        |
| :------: | :---------------: |
| `params` | `PayButtonParams` |

```ts
InlineKeyboard.payButton({
  text: 'Text'
}) // => InlineKeyboardPayButton
```

### `static loginButton(params)`

**Создаёт кнопку-логин.**

| Параметр |         Тип         |
| :------: | :-----------------: |
| `params` | `LoginButtonParams` |

```ts
InlineKeyboard.loginButton({
  text: 'Text',
  loginUrl
}) // => InlineKeyboardLoginButton
```
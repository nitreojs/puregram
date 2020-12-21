# `InlineKeyboardButton`

```ts
import { InlineKeyboardButton } from 'puregram';
```

## Constructor

```ts
const button = new InlineKeyboardButton(payload);
```

| Параметр  |              Тип               |
| :-------: | :----------------------------: |
| `payload` | `TelegramInlineKeyboardButton` |

## Геттеры структуры

### Содержание

* [`text`](#text)
* [`url`](#url)
* [`loginUrl`](#loginurl)
* [`callbackData`](#callbackdata)
* [`switchInlineQuery`](#switchinlinequery)
* [`switchInlineQueryCurrentChat`](#switchinlinequerycurrentchat)
* [`callbackGame`](#callbackgame)
* [`pay`](#pay)

---

### `text`

**Текст кнопки**

```ts
button.text // => string
```

### `url`

**Ссылка, на которую перейдет пользователь по нажатии**

```ts
button.url // => string | undefined
```

### `loginUrl`

**Ссылка, используемая для автоматической авторизации на сайте**

```ts
button.loginUrl // => LoginUrl | undefined
```

References: [`LoginUrl`](./login-url.md)

### `callbackData`

**Полезный `payload`, отправляемый по нажатии на кнопку**

* _`1-64` символов_

```ts
button.callbackData // => string | undefined
```

### `switchInlineQuery`

**Если не `undefined`, то пользователя попросят выбрать чат, после чего откроется чат и в текстовое поле вставится короткое имя бота и указанный текст по нажатии на кнопку**

```ts
button.switchInlineQuery // => string | undefined
```

### `switchInlineQueryCurrentChat`

**Если не `undefined`, то в текстовое поле вставится короткое имя бота и указанный текст по нажатии на кнопку**

```ts
button.switchInlineQueryCurrentChat // => string | undefined
```

### `callbackGame`

**Описание игры, которая будет запущена по нажатии на кнопку**

* _Должна быть самой первой кнопкой в клавиатуре_

```ts
button.callbackGame // => CallbackGame | undefined
```

### `pay`

**`true`, если это кнопка-платёж**

* _Должна быть самой первой кнопкой в клавиатуре_

```ts
button.pay // => boolean | undefined
```
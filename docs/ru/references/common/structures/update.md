# `Update`

```ts
import { Update } from 'puregram';
```

## Constructor

```ts
const update = new Update(payload);
```

| Параметр  |       Тип        |
| :-------: | :--------------: |
| `payload` | `TelegramUpdate` |

## Геттеры структуры

### Содержание

* [`id`](#id)
* [`message`](#message)
* [`editedMessage`](#editedmessage)
* [`channelPost`](#channelpost)
* [`editedChannelPost`](#editedchannelpost)
* [`inlineQuery`](#inlinequery)
* [`chosenInlineResult`](#choseninlineresult)
* [`callbackQuery`](#callbackquery)
* [`shippingQuery`](#shippingquery)
* [`preCheckoutQuery`](#precheckoutquery)
* [`poll`](#poll)
* [`pollAnswer`](#pollanswer)

---

### `id`

**Уникальный идентификатор обновления**

```ts
update.id // => number
```

### `message`

**Новое входящее сообщение**

```ts
update.message // => Message | undefined
```

### `editedMessage`

**Отредактированная версия сообщения**

```ts
update.editedMessage // => Message | undefined
```

### `channelPost`

**Новый пост в канале**

```ts
update.channelPost // => Message | undefined
```

### `editedChannelPost`

**Отредактированная версия поста в канале**

```ts
update.editedChannelPost // => Message | undefined
```

### `inlineQuery`

**Инлайн-запрос**

```ts
update.inlineQuery // => InlineQuery | undefined
```

### `chosenInlineResult`

**Выбранный результат инлайн-запроса**

```ts
update.chosenInlineResult // => ChosenInlineResult | undefined
```

### `callbackQuery`

**Новый входящий callback-запрос**

```ts
update.callbackQuery // => CallbackQuery | undefined
```

### `shippingQuery`

**Новый входящий shipping-запрос**

```ts
update.shippingQuery // => ShippingQuery | undefined
```

### `preCheckoutQuery`

**Новый входящий pre-checkout-запрос**

```ts
update.preCheckoutQuery // => PreCheckoutQuery | undefined
```

### `poll`

**Новое состояние опроса**

```ts
update.poll // => Poll | undefined
```

### `pollAnswer`

**Пользователь выбрал вариант в опросе**

```ts
update.pollAnswer // => PollAnswer | undefined
```
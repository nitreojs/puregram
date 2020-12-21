# `InlineKeyboardMarkup`

```ts
import { InlineKeyboardMarkup } from 'puregram';
```

## Constructor

```ts
const markup = new InlineKeyboardMarkup(payload);
```

| Параметр  |              Тип               |
| :-------: | :----------------------------: |
| `payload` | `TelegramInlineKeyboardMarkup` |

## Геттеры структуры

### Содержание

* [`inlineKeyboard`](#inlinekeyboard)

---

### `inlineKeyboard`

**Массив инлайн-кнопок**

```ts
inlineKeyboardMarkup.inlineKeyboard // => InlineKeyboardButton[][]
```
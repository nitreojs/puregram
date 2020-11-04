# `Keyboard`

**Класс клавиатуры, присоединяемой к полю ввода.**

```js
import { Keyboard } from 'puregram';
```

## Содержание

* [**Пример использования**](#пример-использования)
* [**Методы и геттеры класса**](#методы-и-геттеры-класса)

## Пример использования

```js
const keyboard = Keyboard.keyboard([
  [
    Keyboard.textButton('Some text')
  ],
  [
    Keyboard.textButton('Some more text'),
    Keyboard.textButton('Another text')
  ]
]);

context.send('Take the keyboard!', {
  reply_markup: keyboard
});
```

## Методы и геттеры класса

### Содержание

* [`keyboard`](#static-keyboardrows)
* [`resize`](#resizeresize)
* [`oneTime`](#onetimeonetime)
* [`selective`](#selectiveselective)
* [`textButton`](#static-textbuttontext)
* [`requestContactButton`](#static-requestcontactbuttontext)
* [`requestLocationButton`](#static-requestlocationbuttontext)
* [`requestPollButton`](#static-requestpollbuttontext-type)

---

### `static keyboard(rows)`

**Создаёт клавиатуру из заданных кнопок**

| Параметр |                                         Тип                                         |
| :------: | :---------------------------------------------------------------------------------: |
| `rows`   | <code>(TelegramInlineKeyboardButton &#124; TelegramInlineKeyboardButton[])[]</code> |

```ts
Keyboard.keyboard(rows) // => Keyboard
```

### `resize(resize?)`

**Уменьшает размер клавиатуры**

| Параметр |    Тип    |
| :------: | :-------: |
| `resize` | `boolean` |

```ts
Keyboard.keyboard(rows).resize() // => Keyboard
```

### `oneTime(oneTime?)`

**Если включено, при нажатии на кнопку клавиатура пропадёт**

| Параметр  |    Тип    |
| :-------: | :-------: |
| `oneTime` | `boolean` |

```ts
Keyboard.keyboard(rows).oneTime(true) // => Keyboard
```

### `selective(selective?)`

**При включении клавиатура будет показана только указанным в отправляемом сообщении пользователям**

|  Параметр   |    Тип    |
| :---------: | :-------: |
| `selective` | `boolean` |

```ts
Keyboard.keyboard(rows).selective(true) // => Keyboard
```

### `static textButton(text)`

**Создаёт текстовую кнопку**

| Параметр |   Тип    |
| :------: | :------: |
| `text`   | `string` |

```ts
Keyboard.textButton('Text') // => KeyboardTextButton
```

### `static requestContactButton(text)`

**Создаёт кнопку запроса контакта**

| Параметр |   Тип    |
| :------: | :------: |
| `text`   | `string` |

```ts
Keyboard.requestContactButton('Text') // => KeyboardRequestContactButton
```

### `static requestLocationButton(text)`

**Создаёт кнопку запроса локации**

| Параметр |   Тип    |
| :------: | :------: |
| `text`   | `string` |

```ts
Keyboard.requestLocationButton('Text') // => KeyboardRequestLocationButton
```

### `static requestPollButton(text, type?)`

**Создаёт кнопку создания опроса**

| Параметр |    Тип     |
| :------: | :--------: |
| `text`   | `string`   |
| `type`   | `PollType` |

```ts
Keyboard.requestPollButton('Regular poll') // => KeyboardRequestPollButton
Keyboard.requestPollButton('Some quiz', 'quiz') // => KeyboardRequestPollButton
```
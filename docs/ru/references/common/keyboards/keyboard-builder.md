# `KeyboardBuilder`

**Класс сборщика клавиатуры.**

```js
import { KeyboardBuilder } from 'puregram';
```

## Содержание

* [**Constructor**](#constructor)
* [**Пример использования**](#пример-использования)
* [**Методы и геттеры класса**](#методы-и-геттеры-класса)

## Constructor

```ts
const builder = new KeyboardBuilder();
```

## Пример использования

```js
const keyboard = new KeyboardBuilder()
  .textButton('Some text')
  .row()
  .textButton('Some more text')
  .textButton('Another text');

context.send('Take the keyboard!', {
  reply_markup: keyboard
});
```

## Методы и геттеры класса

### Содержание

* [`textButton`](#textbuttontext)
* [`requestLocationButton`](#requestlocationbuttontext)
* [`requestPollButton`](#requestpollbuttontext-type)
* [`requestContactButton`](#requestcontactbuttontext)
* [`oneTime`](#onetimeonetime)
* [`resize`](#resizeresize)
* [`selective`](#selectiveselective)
* [`row`](#row)

---

### `textButton(text)`

**Создаёт текстовую кнопку**

| Параметр |   Тип    |
| :------: | :------: |
| `text`   | `string` |

```ts
builder.textButton('Text') // => KeyboardBuilder
```

### `requestLocationButton(text)`

**Создаёт кнопку запроса локации**

| Параметр |   Тип    |
| :------: | :------: |
| `text`   | `string` |

```ts
builder.requestLocationButton('Text') // => KeyboardBuilder
```

### `requestPollButton(text, type?)`

**Создаёт кнопку создания опроса**

| Параметр |    Тип     |
| :------: | :--------: |
| `text`   | `string`   |
| `type`   | `PollType` |

```ts
builder.requestPollButton('Regular poll') // => KeyboardBuilder
builder.requestPollButton('Some quiz', 'quiz') // => KeyboardBuilder
```

### `requestContactButton(text)`

**Создаёт кнопку запроса контакта**

| Параметр |   Тип    |
| :------: | :------: |
| `text`   | `string` |

```ts
builder.requestContactButton('Text') // => KeyboardBuilder
```

### `row()`

**Отделяет прошлую строку кнопок от следующей**

```ts
builder
  .textButton('Text')
  .row()
  .textButton('Text') // => KeyboardBuilder
```

### `oneTime(oneTime?)`

**Если включено, при нажатии на кнопку клавиатура пропадёт**

| Параметр  |    Тип    |
| :-------: | :-------: |
| `oneTime` | `boolean` |

```ts
builder.oneTime(true) // => KeyboardBuilder
```

### `resize(resize?)`

**Уменьшает размер клавиатуры**

| Параметр |    Тип    |
| :------: | :-------: |
| `resize` | `boolean` |

```ts
builder.resize(true) // => KeyboardBuilder
```

### `selective(selective?)`

**При включении клавиатура будет показана только указанным в отправляемом сообщении пользователям**

|  Параметр   |    Тип    |
| :---------: | :-------: |
| `selective` | `boolean` |

```ts
builder.selective(true) // => KeyboardBuilder
```
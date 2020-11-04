# `RemoveKeyboard`

**Класс клавиатуры; используется, когда нужно убрать клавиатуру.**

```js
import { RemoveKeyboard } from 'puregram';
```

## Содержание

* [**Constructor**](#constructor)
* [**Пример использования**](#пример-использования)
* [**Методы и геттеры класса**](#методы-и-геттеры-класса)

## Constructor

```js
const keyboard = new RemoveKeyboard();
```

## Пример использования

```js
const keyboard = new RemoveKeyboard();

context.send('Removing the keyboard...', {
  reply_markup: keyboard
});
```

## Методы и геттеры класса

### Содержание

* [`selective`](#selectiveselective)

---

### `selective(selective?)`

**При включении клавиатура будет показана только указанным в отправляемом сообщении пользователям**

|  Параметр   |    Тип    |
| :---------: | :-------: |
| `selective` | `boolean` |

```ts
keyboard.selective(true) // => RemoveKeyboard
```
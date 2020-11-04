# `ForceReply`

**Класс клавиатуры; используется, когда нужно показать пользователю интерфейс ответа на сообщение.**

```js
import { ForceReply } from 'puregram';
```

## Содержание

* [**Constructor**](#constructor)
* [**Пример использования**](#пример-использования)
* [**Методы и геттеры класса**](#методы-и-геттеры-класса)

## Constructor

```js
const forceReply = new ForceReply();
```

## Пример использования

```js
const keyboard = new ForceReply();

context.send('There\'s some force reply keyboard.', {
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
forceReply.selective(true) // => ForceReply
```
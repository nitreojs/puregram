# `RemoveKeyboard`

**Класс клавиатуры; используется, когда нужно убрать клавиатуру.**

```js
import { RemoveKeyboard } from 'puregram';
```

## Constructor

```js
const keyboard = new RemoveKeyboard();
```

## Методы и геттеры класса

### Содержание

* [`selective`](#selectiveselective)

---

### `selective(selective?)`

**При включении клавиатура будет показана только указанным в отправляемом сообщении пользователям.**

|  Параметр   |    Тип    |
| :---------: | :-------: |
| `selective` | `boolean` |

```ts
keyboard.selective(true) // => RemoveKeyboard
```
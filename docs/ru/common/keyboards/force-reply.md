# `ForceReply`

**Класс клавиатуры; используется, когда нужно показать пользователю интерфейс ответа на сообщение.**

```js
import { ForceReply } from 'puregram';
```

## Constructor

```js
const forceReply = new ForceReply();
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
forceReply.selective(true) // => ForceReply
```
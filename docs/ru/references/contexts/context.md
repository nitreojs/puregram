# `Context`

Базовый контекст, от которого наследуются
**все** остальные контексты.

```ts
import { Context } from 'puregram';
```

## Constructor

```ts
const context = new Context(telegram, updateName);
```

|   Параметр   |     Тип      |       Описание       |
| :----------: | :----------: | :------------------: |
| `telegram`   | `Telegram`   | Инстанция `Telegram` |
| `updateName` | `UpdateName` | Название события     |

## Методы и геттеры контекста

### `is(rawTypes)`

**Является ли контекст событием с указанным кодом?**

|  Параметр  |                        Тип                        |
| :--------: | :-----------------------------------------------: |
| `rawTypes` | <code>AllowArray<UpdateName &#124; string></code> |

```ts
context.is('message') // => boolean
```

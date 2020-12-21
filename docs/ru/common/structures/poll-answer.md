# `PollAnswer`

**This object represents an answer of a user in a non-anonymous poll.**

```ts
import { PollAnswer } from 'puregram';
```

## Constructor

```ts
const pollAnswer = new PollAnswer(payload);
```

| Параметр  |         Тип          |
| :-------: | :------------------: |
| `payload` | `TelegramPollAnswer` |

## Геттеры структуры

### Содержание

* [`pollId`](#pollid)
* [`user`](#user)
* [`senderId`](#senderid)
* [`optionIds`](#optionids)

---

### `pollId`

**Идентификатор опроса**

```ts
pollAnswer.pollId // => string
```

### `user`

**Пользователь, проголосовавший в опросе**

```ts
pollAnswer.user // => User
```

### `senderId`

**ID отправителя опроса**

```ts
pollAnswer.senderId // => number
```

### `optionIds`

**Массив ID выбранных ответов в опросе**

* _Может быть пустым, если пользователь отменил свой голос_

```ts
pollAnswer.optionIds // => number[]
```
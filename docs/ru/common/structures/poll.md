# `Poll`

```ts
import { Poll } from 'puregram';
```

## Constructor

```ts
const poll = new Poll(payload);
```

| Параметр  |      Тип       |
| :-------: | :------------: |
| `payload` | `TelegramPoll` |

## Геттеры структуры

### Содержание

* [`id`](#id)
* [`question`](#question)
* [`options`](#options)
* [`totalVoterCount`](#totalvotercount)
* [`isClosed`](#isclosed)
* [`isAnonymous`](#isanonymous)
* [`type`](#type)
* [`allowsMultipleAnswers`](#allowsmultipleanswers)
* [`correctOptionId`](#correctoptionid)
* [`explanation`](#explanation)
* [`explanationEntities`](#explanationentities)
* [`openPeriod`](#openperiod)
* [`closeDate`](#closedate)

---

### `id`

**Уникальный идентификатор опроса**

```ts
poll.id // => string
```

### `question`

**Вопрос опроса**

* _`1-300` символов_

```ts
poll.question // => string
```

### `options`

**Список вариантов ответов**

```ts
poll.options // => PollOption[]
```

References: [`PollOption`](./poll-option.md)

### `totalVoterCount`

**Кол-во проголосовавших пользователей**

```ts
poll.totalVoterCount // => number
```

### `isClosed`

**`true`, если опрос закончен**

```ts
poll.isClosed // => boolean
```

### `isAnonymous`

**`true`, если опрос анонимный**

```ts
poll.isAnonymous // => boolean
```

### `type`

**Тип опроса**

* _Возможные значения:_ `regular`, `quiz`

```ts
poll.type // => PollType
```

### `allowsMultipleAnswers`

**`true`, если в опросе можно выбирать несколько вариантов**

```ts
poll.allowsMultipleAnswers // => boolean
```

### `correctOptionId`

**ID верного варианта (начиная с нуля)**

* _Только для `quiz`-опросов_

```ts
poll.correctOptionId // => number | undefined
```

### `explanation`

**Обьяснение, появляющееся, если пользователь неправильно ответил на `quiz`-опрос**

* _`1-200` символов_

```ts
poll.explanation // => string | undefined
```

### `explanationEntities`

**`entities` для обьяснения**

```ts
poll.explanationEntities // => MessageEntity[]
```

References: [`MessageEntity`](./message-entity.md)

### `openPeriod`

**Время в секундах; сколько будет опрос идти**

```ts
poll.openPeriod // => number | undefined
```

### `closeDate`

**UNIX-точка во времени, когда опрос будет закрыт**

```ts
poll.closeDate // => number | undefined
```
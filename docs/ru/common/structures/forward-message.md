# `ForwardMessage`

```ts
import { ForwardMessage } from 'puregram';
```

## Constructor

```ts
const message = new ForwardMessage(payload);
```

| Параметр  |           Тип           |
| :-------: | :---------------------: |
| `payload` | `ForwardMessagePayload` |

## Геттеры структуры

### Содержание

* [`id`](#id)
* [`from`](#from)
* [`chat`](#chat)
* [`signature`](#signature)
* [`senderName`](#sendername)
* [`createdAt`](#createdat)

---

### `id`

**Идентификатор оригинального сообщения**

* _Для сообщений, пересланных из каналов_

```ts
message.id // => number | undefined
```

### `from`

**Отправитель оригинального сообщения**

* _Для пересланных сообщений_

```ts
message.from // => User
```

### `chat`

**Информация про оригинальный канал**

* _Для сообщений, пересланных из каналов_

```ts
message.chat // => Chat | undefined
```

### `signature`

**Подпись автора к посту**

* _Для сообщений, пересланных из каналов_

```ts
message.signature // => string | undefined
```

### `senderName`

**Имя отправителя на случай, если отправитель запретил переход на его канал по пересланным сообщениям**

* _Для сообщений, пересланных от пользователей_

```ts
message.senderName // => string | undefined
```

### `createdAt`

**UNIX-дата оригинального сообщения**

* _Для пересланных сообщений_

```ts
message.createdAt // => number
```
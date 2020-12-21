# `Contact`

```ts
import { Contact } from 'puregram';
```

## Constructor

```ts
const contact = new Contact(payload);
```

| Параметр  |        Тип        |
| :-------: | :---------------: |
| `payload` | `TelegramContact` |

## Геттеры структуры

### Содержание

* [`phoneNumber`](#phonenumber)
* [`firstName`](#firstname)
* [`lastName`](#lastname)
* [`userId`](#userid)
* [`vCard`](#vcard)

---

### `phoneNumber`

**Номер телефона контакта**

```ts
contact.phoneNumber // => string
```

### `firstName`

**Имя контакта**

```ts
contact.firstName // => string
```

### `lastName`

**Фамилия контакта**

```ts
contact.lastName // => string | undefined
```

### `userId`

**ID контакта в Telegram**

```ts
contact.userId // => number | undefined
```

### `vCard`

**Дополнительные данные о пользователе в формате vCard**

```ts
contact.vCard // => string | undefined
```
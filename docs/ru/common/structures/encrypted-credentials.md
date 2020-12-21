# `EncryptedCredentials`

**Класс, содержащий данные, необходимые для дешифровки и аутентификации `EncryptedPassportElement`.**

```ts
import { EncryptedCredentials } from 'puregram';
```

## Constructor

```ts
const credentials = new EncryptedCredentials(payload);
```

| Параметр  |              Тип               |
| :-------: | :----------------------------: |
| `payload` | `TelegramEncryptedCredentials` |

## Геттеры структуры

### Содержание

* [`data`](#data)
* [`hash`](#hash)
* [`secret`](#secret)

---

### `data`

**JSON-сериализованные base64 данные с уникальным `payload`, `data hashes` и `secrets` пользователя**

```ts
credentials.data // => string
```

### `hash`

**Base64-encoded `data hash` для аутентификации**

```ts
credentials.hash // => string
```

### `secret`

**Base64-encoded `secret` для аутентификации**

```ts
credentials.secret // => string
```
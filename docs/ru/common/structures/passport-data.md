# `PassportData`

```ts
import { PassportData } from 'puregram';
```

## Constructor

```ts
const passportData = new PassportData(payload);
```

| Параметр  |          Тип           |
| :-------: | :--------------------: |
| `payload` | `TelegramPassportData` |

## Геттеры структуры

### Содержание

* [`data`](#data)
* [`credentials`](#credentials)

---

### `data`

**Массив с информацией про документы и другие Telegram Passport-элементы, которыми поделился пользователь**

```ts
passportData.data // => EncryptedPassportElement[]
```

### `credentials`

**Зашифрованные документы, необходимые для дешифровки**

```ts
passportData.credentials // => EncryptedCredentials
```
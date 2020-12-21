# `EncryptedPassportElement`

```ts
import { EncryptedPassportElement } from 'puregram';
```

## Constructor

```ts
const encryptedPassportElement = new EncryptedPassportElement(payload);
```

| Параметр  |                   Тип                   |
| :-------: | :-------------------------------------: |
| `payload` | `TelegramEncryptedPassportElementUnion` |

## Геттеры структуры

### Содержание

* [`type`](#type)
* [`data`](#data)
* [`phoneNumber`](#phonenumber)
* [`email`](#email)
* [`files`](#files)
* [`frontSide`](#frontside)
* [`reverseSide`](#reverseside)
* [`selfie`](#selfie)
* [`translation`](#translation)
* [`hash`](#hash)

---

### `type`

**Тип элемента**

* _Возможные значения:_ `personal_details`, `passport`, `driver_license`,
`identity_card`, `internal_passport`, `address`, `utility_bill`,
`bank_statement`, `rental_agreement`, `passport_registration`,
`temporary_registration`, `phone_number`, `email`

```ts
encryptedPassportElement.type // => EncryptedPassportElementType
```

### `data`

**Base64-encoded зашифрованный `data`-элемент**

```ts
encryptedPassportElement.data // => string | undefined
```

### `phoneNumber`

**Подтвержденный номер телефона пользователя**

```ts
encryptedPassportElement.phoneNumber // => string | undefined
```

### `email`

**Подтвержденный email-адрес пользователя**

```ts
encryptedPassportElement.email // => string | undefined
```

### `files`

**Массив зашифрованных файлов с документами пользователя**

```ts
encryptedPassportElement.files // => PassportFile[]
```

References: [`PassportFile`](./passport-file.md)

### `frontSide`

**Зашифрованный файл с лицевой стороной документа**

```ts
encryptedPassportElement.frontSide // => PassportFile | undefined
```

References: [`PassportFile`](./passport-file.md)

### `reverseSide`

**Зашифрованный файл с задней стороной документа**

```ts
encryptedPassportElement.reverseSide // => PassportFile | undefined
```

References: [`PassportFile`](./passport-file.md)

### `selfie`

**Зашифрованный файл с селфи пользователя, держащего в руках документ**

```ts
encryptedPassportElement.selfie // => PassportFile | undefined
```

References: [`PassportFile`](./passport-file.md)

### `translation`

**Массив зашифрованных файлов с переведенными документами**

```ts
encryptedPassportElement.translation // => PassportFile[]
```

References: [`PassportFile`](./passport-file.md)

### `hash`

**Base64-encoded `hash`-элемент**

```ts
encryptedPassportElement.hash // => string
```
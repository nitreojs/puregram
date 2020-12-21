# `OrderInfo`

```ts
import { OrderInfo } from 'puregram';
```

## Constructor

```ts
const orderInfo = new OrderInfo(payload);
```

| Параметр  |         Тип         |
| :-------: | :-----------------: |
| `payload` | `TelegramOrderInfo` |

## Геттеры структуры

### Содержание

* [`name`](#name)
* [`phoneNumber`](#phonenumber)
* [`email`](#email)
* [`shippingAddress`](#shippingaddress)

---

### `name`

**Имя пользователя**

```ts
orderInfo.name // => string | undefined
```

### `phoneNumber`

**Номер телефона пользователя**

```ts
orderInfo.phoneNumber // => string | undefined
```

### `email`

**Email-адрес пользователя**

```ts
orderInfo.email // => string | undefined
```

### `shippingAddress`

**Адрес доставки**

```ts
orderInfo.shippingAddress // => ShippingAddress | undefined
```
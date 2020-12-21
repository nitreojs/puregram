# `SuccessfulPayment`

```ts
import { SuccessfulPayment } from 'puregram';
```

## Constructor

```ts
const successfulPayment = new SuccessfulPayment(payload);
```

| Параметр  |             Тип             |
| :-------: | :-------------------------: |
| `payload` | `TelegramSuccessfulPayment` |

## Геттеры структуры

### Содержание

* [`currency`](#currency)
* [`totalAmount`](#totalamount)
* [`invoicePayload`](#invoicepayload)
* [`shippingOptionId`](#shippingoptionid)
* [`orderInfo`](#orderinfo)
* [`telegramPaymentChargeId`](#telegrampaymentchargeid)
* [`providerPaymentChargeId`](#providerpaymentchargeid)

---

### `currency`

**Трёхсимвольный код валюты**

```ts
successfulPayment.currency // => string
```

### `totalAmount`

**Общая стоимость покупки**

```ts
successfulPayment.totalAmount // => number
```

### `invoicePayload`

**Полезная нагрузка оплаты**

```ts
successfulPayment.invoicePayload // => string
```

### `shippingOptionId`

**ID выбранного метода отправки**

```ts
successfulPayment.shippingOptionId // => string | undefined
```

### `orderInfo`

**Информация о доставке**

```ts
successfulPayment.orderInfo // => OrderInfo | undefined
```

### `telegramPaymentChargeId`

**Telegram payment ID**

```ts
successfulPayment.telegramPaymentChargeId // => string
```

### `providerPaymentChargeId`

**Provider payment ID**

```ts
successfulPayment.providerPaymentChargeId // => string
```
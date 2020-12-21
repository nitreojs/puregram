# `Invoice`

```ts
import { Invoice } from 'puregram';
```

## Constructor

```ts
const invoice = new Invoice(payload);
```

| Параметр  |        Тип        |
| :-------: | :---------------: |
| `payload` | `TelegramInvoice` |

## Геттеры структуры

### Содержание

* [`title`](#title)
* [`description`](#description)
* [`startParameter`](#startparameter)
* [`currency`](#currency)
* [`totalAmount`](#totalamount)

---

### `title`

**Название продукта**

```ts
invoice.title // => string
```

### `description`

**Описание продукта**

```ts
invoice.description // => string
```

### `startParameter`

**Уникальный параметр, использованный для генерации этого платежа**

```ts
invoice.startParameter // => string
```

### `currency`

**Трёхсимвольная валюта**

```ts
invoice.currency // => string
```

### `totalAmount`

**Общая сумма платежа**

```ts
invoice.totalAmount // => number
```
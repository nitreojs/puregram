# `ShippingAddress`

```ts
import { ShippingAddress } from 'puregram';
```

## Constructor

```ts
const shippingAddress = new ShippingAddress(payload);
```

| Параметр  |            Тип            |
| :-------: | :-----------------------: |
| `payload` | `TelegramShippingAddress` |

## Геттеры структуры

### Содержание

* [`countryCode`](#countrycode)
* [`state`](#state)
* [`city`](#city)
* [`firstStreetLine`](#firststreetline)
* [`secondStreetLine`](#secondstreetline)
* [`postCode`](#postcode)

---

### `countryCode`

**Код страны**

```ts
shippingAddress.countryCode // => string
```

### `state`

**Штат, если указан**

```ts
shippingAddress.state // => string
```

### `city`

**Город**

```ts
shippingAddress.city // => string
```

### `firstStreetLine`

**Первая строка адреса**

```ts
shippingAddress.firstStreetLine // => string
```

### `secondStreetLine`

**Вторая строка адреса**

```ts
shippingAddress.secondStreetLine // => string
```

### `postCode`

**Почтовый индекс**

```ts
shippingAddress.postCode // => string
```
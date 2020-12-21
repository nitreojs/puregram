# `Venue`

```ts
import { Venue } from 'puregram';
```

## Constructor

```ts
const venue = new Venue(payload);
```

| Параметр  |       Тип       |
| :-------: | :-------------: |
| `payload` | `TelegramVenue` |

## Геттеры структуры

### Содержание

* [`location`](#location)
* [`title`](#title)
* [`address`](#address)
* [`foursquareId`](#foursquareid)
* [`foursquareType`](#foursquaretype)
* [`googlePlaceId`](#googleplaceid)
* [`googlePlaceType`](#googleplacetype)

---

### `location`

**Локация**

```ts
venue.location // => Location | undefined
```

References: [`Location`](./location.md)

### `title`

**Название места**

```ts
venue.title // => string
```

### `address`

**Адрес места**

```ts
venue.address // => string
```

### `foursquareId`

**Идентификатор места в Foursquare**

```ts
venue.foursquareId // => string | undefined
```

### `foursquareType`

**Тип места в Foursquare**

```ts
venue.foursquareType // => string | undefined
```

### `googlePlaceId`

**ID места в Google Places**

```ts
venue.googlePlaceId // => string | undefined
```

### `googlePlaceType`

**Тип места в Google Places**

* _[Поддерживаемые типы](https://developers.google.com/places/web-service/supported_types)_

```ts
venue.googlePlaceType // => string | undefined
```
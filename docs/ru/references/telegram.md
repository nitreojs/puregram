# `Telegram`

```ts
import { Telegram } from 'puregram';
```

## Содержание

* [**Constructor**](#constructor)
* [**Методы**](#методы)

## Constructor

```ts
const telegram = new Telegram(options);
```

## Методы

### Содержание

* [`хуй знает`](#не-ебу)
* [`хуй знает`](#не-ебу)

---

### `setOptions(options)`

**Устанавливает новые `options`**

```ts
telegram.setOptions(options); // => this
```

### `callApi(method, params)`

**Вызывает метод `method` с параметрами `params`**

```ts
telegram.callApi('getMe'); // => Promise<any>
```

### `uploadMedia(options)`

**Вызывает метод `options.method` и выкладывает `options.values` под ключом `options.key`**



В основном используется для выкладывания локальных файлов, `Buffer` или `Stream`

```ts
telegram.uploadMedia({
  key: 'photo',
  method: 'sendPhoto',
  values: mediaValues
}); // => Promise<any>
```

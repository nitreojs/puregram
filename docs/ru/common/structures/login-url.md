# `LoginUrl`

```ts
import { LoginUrl } from 'puregram';
```

## Constructor

```ts
const loginUrl = new LoginUrl(payload);
```

| Параметр  |        Тип         |
| :-------: | :----------------: |
| `payload` | `TelegramLoginUrl` |

## Геттеры структуры

### Содержание

* [`url`](#url)
* [`forwardText`](#forwardtext)
* [`botUsername`](#botusername)
* [`requestWriteAccess`](#requestwriteaccess)

---

### `url`

**Ссылка**

```ts
loginUrl.url // => string
```

### `forwardText`

**Новый текст кнопки в пересланном сообщении**

```ts
loginUrl.forwardText // => string | undefined
```

### `botUsername`

**Короткое имя бота**

```ts
loginUrl.botUsername // => string | undefined
```

### `requestWriteAccess`

**`true`, если хотите запросить право на отправку сообщений ботом пользователю**

```ts
loginUrl.requestWriteAccess // => boolean | undefined
```
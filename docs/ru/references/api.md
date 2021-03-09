# `API`

Объект `Proxy`, используемый для вызова API методов.

```ts
const telegram = new Telegram(options);

telegram.api;
```

## Использование

```ts
telegram.api.getMe();
telegram.api.sendMessage(params);
```

Эквивалент:

```ts
telegram.callApi('getMe');
telegram.callApi('sendMessage', params);
```

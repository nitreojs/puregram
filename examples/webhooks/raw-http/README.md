# raw http webhook

zero-deps webhook server using node's built-in `http` via puregram's bundled listener.

## run

```sh
cp .env.example .env
# fill in TOKEN and WEBHOOK_URL
yarn install
yarn dev
```

`tg.startWebhook` calls `setWebhook` on the telegram api, spins up a node `http` server, and returns a handle with a `stop()` method for graceful shutdown.

## see also

- [fastify webhook](../fastify/)

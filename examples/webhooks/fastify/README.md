# fastify webhook example

a minimal puregram bot served via fastify.

## prerequisites

- a public https url that forwards to this server (production: nginx / cloud load balancer; dev: ngrok / cloudflared)
- a bot token from @BotFather

## run

```sh
cp .env.example .env
# fill in TOKEN and WEBHOOK_URL
yarn install
yarn dev
```

the bot calls `tg.api.setWebhook(...)` on boot, then fastify routes incoming `POST /webhook` requests through puregram's `fastifyAdapter`.

## how it works

`tg.webhookHandler()` returns a framework-agnostic handler. `fastifyAdapter` wraps it into a fastify-compatible route handler — fastify already parses json bodies, so no raw stream buffering is needed.

## see also

- [raw http webhook](../raw-http/)

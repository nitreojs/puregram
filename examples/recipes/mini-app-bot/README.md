# mini-app bot recipe

a full-stack telegram mini app: bot serves a tiny settings page over fastify, the in-app form POSTs back with the user's signed `initData`, the bot verifies it via `@puregram/utils`, persists the settings to `@puregram/session`, and pushes a confirmation message into the chat. a second "share" button demonstrates `answerWebAppQuery` — posting an inline article into the launching chat **on behalf of the user**.

```
┌─ telegram client ─────────────┐
│ user taps the menu button     │
│ → opens https://<PUBLIC_URL>/ │
└─────────────┬─────────────────┘
              │ GET /
              ▼
       ┌────────────┐
       │  fastify   │  serves webapp/index.html
       └─────┬──────┘
             │
             │ POST /api/save  { initData, settings }
             ▼
   ┌────────────────────────┐
   │ WebApp.validate(...)   │  HMAC against bot token
   │ tg.session.set(...)    │  per-user kv store
   │ tg.api.sendMessage(.)  │  confirmation in chat
   └────────────────────────┘
```

## prerequisites

- a bot token from @BotFather
- a publicly-reachable https origin pointing at your local fastify port — telegram refuses to load mini apps over http. easy options:
  - `ngrok http 3000`
  - `cloudflared tunnel --url http://localhost:3000`
  - `lt --port 3000` (localtunnel)
- nothing in @BotFather to configure manually — the bot installs its own menu button via `setChatMenuButton` on `/start`

## run

```sh
cp .env.example .env
# fill in TOKEN= and PUBLIC_URL=<https tunnel url>
yarn install
yarn dev
```

then send `/start` to your bot in telegram. tap the persistent "settings" button at the bottom of the chat → fill in the form → tap save. the bot will confirm in chat that the settings landed

## how it works

- **`src/server.ts`** runs fastify. `/` and static webapp assets are served from `webapp/`. three api endpoints: `GET /api/initial`, `POST /api/save`, `POST /api/share`
- **initData verification** — `WebApp.validate({ initData, token })` recomputes the HMAC against the bot token and matches it against the `hash` field. only validated requests proceed; everything else returns 401. **never trust `initDataUnsafe` for anything that touches state**
- **session save** — uses `tg.session.set(key, value)` directly (not `update.session`, since the http handler isn't inside an update flow). the key matches what the bot-side handler uses for `update.session`, so reading from either path returns the same data
- **menu button** — `setChatMenuButton({ chat_id, menu_button: { type: 'web_app', text: 'settings', web_app: { url } } })` on every `/start`. this puts a persistent button in the chat composer that launches the mini app

### the two flows side by side

| button | endpoint | bot api call | who sends the message |
|---|---|---|---|
| **save** | `POST /api/save` | `sendMessage` | **the bot** — quiet confirmation to the user |
| **share my settings** | `POST /api/share` | `answerWebAppQuery` | **the user** — inline article posted into the launching chat |

`answerWebAppQuery` requires a `query_id`, which initData carries when the mini app was launched from a menu button, an inline keyboard button, the main mini app, or a named mini app. it is **absent** for reply-keyboard launches — those use `sendData()` from the client side instead. since this recipe launches via the menu button, `query_id` is always present

## see also

- [@puregram/utils — WebApp.validate](../../../packages/utils/README.md)
- [@puregram/session](../../../packages/session/README.md)
- [bot api mini apps docs](https://core.telegram.org/bots/webapps)

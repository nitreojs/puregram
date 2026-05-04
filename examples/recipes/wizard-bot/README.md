# wizard bot recipe

a small but realistic signup wizard wiring `@puregram/scenes` + `@puregram/session` + `@puregram/callback-data` together.

the user runs `/signup`, the bot asks for a name (free-text reply), then asks to pick a color (typed inline-keyboard buttons), then echoes the answers back and tracks how many times that user has signed up via session.

## prerequisites

- a bot token from @BotFather

## run

```sh
cp .env.example .env
# fill in TOKEN=
yarn install
yarn dev
```

## how it works

three plugins compose top-to-bottom, in order:

1. `session()` attaches `update.session` and persists across handlers
2. `scenes()` attaches `update.scene` and intercepts every update for users with an active scene (`dependsOn: ['session']`)
3. callback-data schemas are not a plugin — they're standalone packers that produce filters and inline-keyboard buttons

since scenes intercept every update kind (including callback queries) for active-scene users, the wizard handles both message replies and button taps inside the same step body. each step narrows the update with `update.is('message')` / `update.is('callback_query')` and advances via `scene.step.next()`.

the wizard's per-run answers live in `update.scene.state` — scratched on entry, dropped on leave. cross-scene data (like the signup counter) lives in `update.session`.

## see also

- [../../src/scenes/linear-wizard.ts](../../src/scenes/linear-wizard.ts)
- [../../src/session/in-memory-basics.ts](../../src/session/in-memory-basics.ts)
- [../../src/callback-data/basics.ts](../../src/callback-data/basics.ts)

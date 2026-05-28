# order wizard recipe

a **branching** scene — the shape real bots use and the one straight-line wizards
can't teach. a buyer places a bracelet order through a hub menu they keep coming
back to, with sub-screens, an in-place toggle, free-text capture, and a
confirmation screen they can edit field-by-field before the order is sent to a
staff chat.

wires `@puregram/scenes` + `@puregram/session` + `@puregram/callback-data`.

## prerequisites

- a bot token from @BotFather
- optional: a second chat (group/channel the bot is a member of) to receive orders

## run

```sh
cp .env.example .env
# fill in TOKEN= (and optionally ORDERS_CHAT_ID=)
yarn install
yarn dev
```

send `/order` to start.

## the flow

```
/order ─enter─▶ [0 contact]   reply keyboard: requestContactButton
                    │ shares contact → store phone, drop keyboard
                    ▼
              ┌▶ [1 menu] ◀─────────────┐   the hub — one inline "control panel"
              │   • bracelet: <value>    │   message that morphs via editMessageText
              │   • engraving: <value>   │
              │   • ▫️/✅ gift wrap (toggle, edits in place)
              │   • done →               │
              │     │ type     │ engraving   │ confirm
              │     ▼          ▼             ▼
              ├─ [2 type]  [3 engraving]  [4 confirm]
              │   leather/    free text      summary +
              │   beaded/     reply          ✏️ bracelet → [2]
              │   silver      (deleted       ✏️ engraving → [3]
              │   + back      after read)    ▫️/✅ gift wrap (in place)
              └────┴──────────┘              ✅ confirm → staff chat, leave
                go(state.returnTo)           edits return HERE (returnTo = Confirm)
```

## how scenes navigate (the teaching bit)

a `StepScene`'s steps aren't a queue you can only walk forward — they're
**destinations**. navigate with `scene.step.go(Step.Type)` / `previous()`, not
just `next()`. this wizard is a **hub** (the menu) with **spokes** (type,
engraving, confirm) that everyone returns to.

the trick that makes per-field edit work is a single `returnTo` field in
`scene.state`. before opening a spoke, the active step stamps
`state.returnTo = Step.Menu` (from the menu) or `Step.Confirm` (from confirm's ✏️
button). the spoke, once it captures a value, does
`scene.step.go(state.returnTo ?? Step.Menu)`. so the *same* type screen returns to
the menu when reached from the menu, and to confirm when reached from confirm —
one field of state drives the navigation.

everything after the contact screen edits **one** message — the "control panel".
its `message_id` is stashed in `scene.state.panelId`, and `renderPanel` sends it
the first time then `editMessageText`s it forever after. the gift-wrap toggle
just flips a boolean and redraws that same message, so the checkmark moves in
place without a new message.

one scene handles three update kinds — a contact message, an engraving text
message, and a pile of callback taps — narrowed per step with
`update.is('message')` / `update.is('callback_query')`. taps are answered to clear
the loading spinner.

## not shown (kept minimal on purpose)

- persistence — this uses the default in-memory session; production would add
  `@puregram/storage`
- validation (engraving length, contact ownership) — left as an exercise

## see also

- [../../src/scenes/linear-wizard.ts](../../src/scenes/linear-wizard.ts) — the straight-line counterpart
- [../wizard-bot/](../wizard-bot/) — a smaller linear scene + session + callback-data
- [../../src/callback-data/with-keyboard.ts](../../src/callback-data/with-keyboard.ts)

import { StepScene, type StepContext } from '@puregram/scenes'
import { Keyboard, type CallbackQueryUpdate, type InlineKeyboard, type MessageUpdate } from 'puregram'

import { Action, Type, confirmKeyboard, engravingKeyboard, menuKeyboard, typeKeyboard } from './keyboards'
import { Step, buildSummary, type OrderState } from './state'

// where finished orders go. unset → sent back to the buyer so the recipe runs with just a token
const ORDERS_CHAT_ID = process.env.ORDERS_CHAT_ID
  ? Number(process.env.ORDERS_CHAT_ID)
  : undefined

// a step sees either a message (contact, engraving text) or a callback tap (every menu),
// since scenes intercept every update kind while the user has an active scene
type OrderUpdate = MessageUpdate | CallbackQueryUpdate
type Ctx = StepContext<OrderState, OrderUpdate>

const MENU_TEXT = 'pick your bracelet options:'
const TYPE_TEXT = 'choose a bracelet type:'
const ENGRAVING_TEXT = 'send me the engraving text (or tap ← back):'

// the wizard drives one inline "control panel" message that morphs between screens —
// born on the first render (a fresh send), edited in place forever after
async function renderPanel (update: Ctx, text: string, keyboard: InlineKeyboard) {
  const { state } = update.scene
  const chatId = update.chatId

  if (chatId === undefined) {
    return
  }

  if (state.panelId === undefined) {
    const sent = await update.api.sendMessage({ chat_id: chatId, text, reply_markup: keyboard })

    state.panelId = sent.message_id

    return
  }

  await update.api.editMessageText({ chat_id: chatId, message_id: state.panelId, text, reply_markup: keyboard })
}

async function submitOrder (update: Ctx, state: OrderState) {
  const chatId = update.chatId

  if (chatId === undefined) {
    return
  }

  const target = ORDERS_CHAT_ID ?? chatId
  const note = ORDERS_CHAT_ID === undefined ? '\n\n(no ORDERS_CHAT_ID set — sent to you instead)' : ''

  await update.api.sendMessage({ chat_id: target, text: buildSummary(state, { forStaff: true }) + note })

  // drop the keyboard and leave a final receipt in place of the panel
  if (state.panelId !== undefined) {
    await update.api.editMessageText({ chat_id: chatId, message_id: state.panelId, text: '✅ order placed — thank you!' })
  }
}

export const order = new StepScene<OrderState, OrderUpdate>('order', [
  // [0] contact — the only reply-keyboard screen; can't be inline-edited, so it lives outside the panel
  async (update) => {
    if (!update.is('message')) {
      return
    }

    if (update.scene.step.firstTime) {
      return update.send('to place an order, share your contact 👇', {
        reply_markup: Keyboard
          .keyboard([[Keyboard.requestContactButton('📱 share contact')]])
          .resize()
          .oneTime()
      })
    }

    if (!update.hasContact()) {
      return
    }

    update.scene.state.phone = update.contact.phoneNumber

    await update.send("thanks! let's build your bracelet 🧵", { reply_markup: Keyboard.remove() })

    // hand off to the hub — its first render creates the panel
    return update.scene.step.go(Step.Menu)
  },

  // [1] menu — the hub. every spoke comes back here
  async (update) => {
    const { state } = update.scene

    if (update.scene.step.firstTime) {
      return renderPanel(update, MENU_TEXT, menuKeyboard(state))
    }

    if (!update.is('callback_query') || !update.hasData() || !Action.validate(update.data)) {
      return
    }

    const { do: action } = Action.unpack(update.data)!

    // toggling stays on this step — just flip and redraw the same panel
    if (action === 'gift') {
      state.giftWrap = !state.giftWrap

      await update.answer()

      return renderPanel(update, MENU_TEXT, menuKeyboard(state))
    }

    if (action === 'type') {
      state.returnTo = Step.Menu

      await update.answer()

      return update.scene.step.go(Step.Type)
    }

    if (action === 'engraving') {
      state.returnTo = Step.Menu

      await update.answer()

      return update.scene.step.go(Step.Engraving)
    }

    if (action === 'confirm') {
      await update.answer()

      return update.scene.step.go(Step.Confirm)
    }
  },

  // [2] type — a spoke; returns to wherever it was opened from
  async (update) => {
    const { state } = update.scene

    if (update.scene.step.firstTime) {
      return renderPanel(update, TYPE_TEXT, typeKeyboard(state))
    }

    if (!update.is('callback_query') || !update.hasData()) {
      return
    }

    if (Type.validate(update.data)) {
      state.type = Type.unpack(update.data)!.value

      await update.answer({ text: `picked ${state.type}` })

      return update.scene.step.go(state.returnTo ?? Step.Menu)
    }

    if (Action.validate(update.data) && Action.unpack(update.data)!.do === 'back') {
      await update.answer()

      return update.scene.step.go(state.returnTo ?? Step.Menu)
    }
  },

  // [3] engraving — a spoke that captures free text instead of a tap
  async (update) => {
    const { state } = update.scene

    if (update.scene.step.firstTime) {
      return renderPanel(update, ENGRAVING_TEXT, engravingKeyboard())
    }

    if (update.is('callback_query') && update.hasData() && Action.validate(update.data) && Action.unpack(update.data)!.do === 'back') {
      await update.answer()

      return update.scene.step.go(state.returnTo ?? Step.Menu)
    }

    if (!update.is('message') || !update.hasText()) {
      return
    }

    state.engraving = update.text

    // the panel already shows the new value, so drop the user's raw text to keep the chat clean
    await update.delete()

    return update.scene.step.go(state.returnTo ?? Step.Menu)
  },

  // [4] confirm — review + per-field edit. edits set returnTo = Confirm so they come back here
  async (update) => {
    const { state } = update.scene

    if (update.scene.step.firstTime) {
      return renderPanel(update, buildSummary(state), confirmKeyboard(state))
    }

    if (!update.is('callback_query') || !update.hasData() || !Action.validate(update.data)) {
      return
    }

    const { do: action } = Action.unpack(update.data)!

    if (action === 'gift') {
      state.giftWrap = !state.giftWrap

      await update.answer()

      return renderPanel(update, buildSummary(state), confirmKeyboard(state))
    }

    if (action === 'edit-type') {
      state.returnTo = Step.Confirm

      await update.answer()

      return update.scene.step.go(Step.Type)
    }

    if (action === 'edit-engraving') {
      state.returnTo = Step.Confirm

      await update.answer()

      return update.scene.step.go(Step.Engraving)
    }

    if (action === 'submit') {
      await update.answer({ text: 'order placed!' })
      await submitOrder(update, state)

      return update.scene.leave()
    }
  }
])

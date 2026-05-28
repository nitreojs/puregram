import { defineCallbackData } from '@puregram/callback-data'
import { InlineKeyboard } from 'puregram'

import { BRACELET_TYPES, type OrderState, tick } from './state'

// payload-less buttons — what each `do` means depends on which step is active when
// it's tapped (e.g. `gift` toggles on both the menu and the confirm screen)
export const Action = defineCallbackData('order:action')
  .literal('do', ['type', 'engraving', 'gift', 'confirm', 'submit', 'edit-type', 'edit-engraving', 'back'] as const)

// the bracelet-type choice carries the picked value
export const Type = defineCallbackData('order:type').literal('value', BRACELET_TYPES)

/** the hub — every spoke returns here */
export function menuKeyboard (state: OrderState) {
  return InlineKeyboard.keyboard([
    [Action.button({ text: `bracelet: ${state.type ?? '—'}`, do: 'type' })],
    [Action.button({ text: `engraving: ${state.engraving ?? '—'}`, do: 'engraving' })],
    [Action.button({ text: `${tick(state.giftWrap)} gift wrap`, do: 'gift' })],
    [Action.button({ text: 'done →', do: 'confirm' })]
  ])
}

export function typeKeyboard (state: OrderState) {
  return InlineKeyboard.keyboard([
    BRACELET_TYPES.map(value => Type.button({ text: state.type === value ? `• ${value}` : value, value })),
    [Action.button({ text: '← back', do: 'back' })]
  ])
}

export function engravingKeyboard () {
  return InlineKeyboard.keyboard([
    [Action.button({ text: '← back', do: 'back' })]
  ])
}

/** per-field edit buttons jump straight to the field's step via `go(stepId)` */
export function confirmKeyboard (state: OrderState) {
  return InlineKeyboard.keyboard([
    [Action.button({ text: '✏️ bracelet', do: 'edit-type' })],
    [Action.button({ text: '✏️ engraving', do: 'edit-engraving' })],
    [Action.button({ text: `${tick(state.giftWrap)} gift wrap`, do: 'gift' })],
    [Action.button({ text: '✅ confirm order', do: 'submit' })]
  ])
}

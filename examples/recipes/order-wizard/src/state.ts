// steps double as navigation targets — `scene.step.go(Step.Confirm)` reads better
// than `go(4)`. the StepScene's steps array is built in this exact order
export enum Step {
  Contact = 0,
  Menu = 1,
  Type = 2,
  Engraving = 3,
  Confirm = 4
}

// the literal values are also the display labels, so there's no separate label map
export const BRACELET_TYPES = ['leather', 'beaded', 'silver'] as const

export type BraceletType = typeof BRACELET_TYPES[number]

export interface OrderState {
  phone?: string
  type?: BraceletType
  engraving?: string
  /** the gift-wrap toggle */
  giftWrap: boolean
  /** message_id of the one inline "control panel" message the wizard keeps editing */
  panelId?: number
  /** where a sub-screen returns to — Menu when opened from the menu, Confirm when opened from confirm */
  returnTo?: Step
}

export const tick = (on: boolean) => on ? '✅' : '▫️'

export function buildSummary (state: OrderState, options: { forStaff?: boolean } = {}) {
  const lines = [
    options.forStaff ? '🧾 new bracelet order' : 'here is your order:',
    '',
    `• bracelet: ${state.type ?? '—'}`,
    `• engraving: ${state.engraving ?? '—'}`,
    `• gift wrap: ${tick(state.giftWrap)}`
  ]

  if (options.forStaff && state.phone !== undefined) {
    lines.push(`• contact: ${state.phone}`)
  }

  return lines.join('\n')
}

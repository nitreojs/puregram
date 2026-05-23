// invoice_payload values used to discriminate payments in preCheckoutQuery
// and successfulPayment handlers. bot-defined and never shown to the user
export const PAYLOAD = {
  oneTime: 'unlock-onetime',
  subscription: 'unlock-subscription'
} as const

export type Payload = typeof PAYLOAD[keyof typeof PAYLOAD]

export function isKnownPayload (value: string): value is Payload {
  return value === PAYLOAD.oneTime || value === PAYLOAD.subscription
}

interface ProductTemplate {
  payload: Payload
  title: string
  description: string
  prices: Array<{ label: string; amount: number }>
  subscriptionPeriod?: number
}

/** stars-only invoice templates — `currency: 'XTR'` and empty `provider_token` */
export const products: Record<Payload, ProductTemplate> = {
  [PAYLOAD.oneTime]: {
    payload: PAYLOAD.oneTime,
    title: 'Premium pass',
    description: 'one-time unlock of premium content. no renewal',
    prices: [{ label: 'Premium', amount: 50 }]
  },
  [PAYLOAD.subscription]: {
    payload: PAYLOAD.subscription,
    title: 'Premium monthly',
    description: 'premium content, renewed every 30 days until cancelled',
    prices: [{ label: 'Monthly premium', amount: 100 }],
    // 30 days — currently the only interval the bot api accepts
    subscriptionPeriod: 2592000
  }
}

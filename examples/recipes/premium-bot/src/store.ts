import type { Payload } from './products'

export interface ChargeRecord {
  /** stable id from telegram — needed for refundStarPayment / editUserStarSubscription */
  chargeId: string
  /** which product this charge paid for */
  payload: Payload
  /** stars amount paid */
  amount: number
  /** unix seconds when telegram reported the payment */
  paidAt: number
  /** unix seconds when the subscription period ends (subscription payments only) */
  subscriptionExpiresAt: number | undefined
  refunded: boolean
}

export interface UserState {
  userId: number
  charges: ChargeRecord[]
  /** chargeId of the active (non-cancelled) subscription, when one exists */
  activeSubscriptionChargeId: string | undefined
  /** true if the user previously paid the one-time unlock and hasn't been refunded */
  hasOneTime: boolean
}

const store = new Map<number, UserState>()

function ensure (userId: number): UserState {
  let state = store.get(userId)

  if (state === undefined) {
    state = { userId, charges: [], activeSubscriptionChargeId: undefined, hasOneTime: false }
    store.set(userId, state)
  }

  return state
}

export function recordCharge (
  userId: number,
  charge: Omit<ChargeRecord, 'refunded'>
) {
  const state = ensure(userId)

  state.charges.push({ ...charge, refunded: false })

  if (charge.payload === 'unlock-onetime') {
    state.hasOneTime = true
  }

  if (charge.payload === 'unlock-subscription') {
    state.activeSubscriptionChargeId = charge.chargeId
  }
}

export function markRefunded (userId: number, chargeId: string) {
  const state = store.get(userId)

  if (state === undefined) {
    return
  }

  const charge = state.charges.find(c => c.chargeId === chargeId)

  if (charge === undefined) {
    return
  }

  charge.refunded = true

  if (charge.payload === 'unlock-onetime') {
    state.hasOneTime = false
  }

  if (charge.payload === 'unlock-subscription' && state.activeSubscriptionChargeId === chargeId) {
    state.activeSubscriptionChargeId = undefined
  }
}

export function getState (userId: number) {
  return store.get(userId)
}

/** flatten every charge across every user — handy for the admin /refund command */
export function listAllCharges () {
  const out: Array<ChargeRecord & { userId: number }> = []

  for (const state of store.values()) {
    for (const charge of state.charges) {
      out.push({ ...charge, userId: state.userId })
    }
  }

  return out.sort((a, b) => b.paidAt - a.paidAt)
}

/** is the user currently entitled to premium content? */
export function isPremium (userId: number) {
  const state = store.get(userId)

  if (state === undefined) {
    return false
  }

  if (state.hasOneTime) {
    return true
  }

  if (state.activeSubscriptionChargeId === undefined) {
    return false
  }

  const sub = state.charges.find(c => c.chargeId === state.activeSubscriptionChargeId)

  if (sub === undefined || sub.subscriptionExpiresAt === undefined) {
    return false
  }

  return sub.subscriptionExpiresAt * 1000 > Date.now()
}

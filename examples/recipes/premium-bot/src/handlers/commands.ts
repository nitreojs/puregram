import { InlineKeyboard, type MessageUpdate, type Telegram } from 'puregram'

import { PAYLOAD, products } from '../products'
import { getState, isPremium, listAllCharges, markRefunded } from '../store'

interface CommandsConfig {
  adminUserId: number
}

export function registerCommandHandlers (telegram: Telegram, { adminUserId }: CommandsConfig) {
  telegram.onMessage(async (message, next) => {
    if (message.text === undefined || !message.text.startsWith('/')) {
      return next()
    }

    const command = message.text.split(/\s+/, 1)[0]

    switch (command) {
      case '/start':
        return handleStart(message)
      case '/unlock':
        return handleUnlock(message, telegram)
      case '/status':
        return handleStatus(message)
      case '/content':
        return handleContent(message)
      case '/cancel':
        return handleCancel(message, telegram)
      case '/refund':
        return handleRefund(message, telegram, adminUserId)
      default:
        return next()
    }
  })
}

function handleStart (message: MessageUpdate) {
  return message.send(
    'premium-bot demo\n\n'
    + `your user id: ${message.from!.id}\n\n`
    + 'commands:\n'
    + '/unlock  — see purchase options (stars)\n'
    + '/status  — check your entitlement\n'
    + '/content — premium-gated content\n'
    + '/cancel  — cancel active subscription'
  )
}

async function handleUnlock (message: MessageUpdate, telegram: Telegram) {
  const chatId = message.chatId

  if (chatId === undefined) {
    return
  }

  // one-time goes via sendInvoice — telegram renders it as a message with a
  // built-in "Pay X ⭐" button
  const oneTime = products[PAYLOAD.oneTime]

  await telegram.api.sendInvoice({
    chat_id: chatId,
    title: oneTime.title,
    description: oneTime.description,
    payload: oneTime.payload,
    currency: 'XTR',
    // stars use an empty provider_token (not omitted — empty string)
    provider_token: '',
    prices: oneTime.prices
  })

  // subscriptions can't go through sendInvoice — the bot api only accepts
  // subscription_period on createInvoiceLink. so we generate a link and ship
  // it as a URL button the user taps to open the invoice
  const sub = products[PAYLOAD.subscription]

  if (sub.subscriptionPeriod === undefined) {
    return
  }

  const link = await telegram.api.createInvoiceLink({
    title: sub.title,
    description: sub.description,
    payload: sub.payload,
    currency: 'XTR',
    provider_token: '',
    prices: sub.prices,
    subscription_period: sub.subscriptionPeriod
  })

  await message.send(`monthly subscription — ${sub.prices[0]!.amount} ⭐ every 30 days:`, {
    reply_markup: InlineKeyboard.keyboard([
      [InlineKeyboard.urlButton({ text: `subscribe — ${sub.prices[0]!.amount} ⭐`, url: link })]
    ])
  })
}

function handleStatus (message: MessageUpdate) {
  const state = getState(message.from!.id)

  if (state === undefined || state.charges.length === 0) {
    return message.send('no payments yet. /unlock to start')
  }

  const lines: string[] = []

  if (state.hasOneTime) {
    lines.push('✅ one-time premium pass active')
  }

  if (state.activeSubscriptionChargeId !== undefined) {
    const sub = state.charges.find(c => c.chargeId === state.activeSubscriptionChargeId)

    if (sub?.subscriptionExpiresAt !== undefined) {
      const expires = new Date(sub.subscriptionExpiresAt * 1000).toISOString().slice(0, 10)

      lines.push(`✅ subscription active until ${expires}`)
    }
  }

  if (lines.length === 0) {
    lines.push('no active entitlements — past charges only')
  }

  lines.push('', `charges on record: ${state.charges.length}`)

  return message.send(lines.join('\n'))
}

function handleContent (message: MessageUpdate) {
  if (!isPremium(message.from!.id)) {
    return message.send('🔒 premium content — /unlock to access')
  }

  return message.send('🌟 secret premium content goes here.\n\nthanks for supporting the bot!')
}

async function handleCancel (message: MessageUpdate, telegram: Telegram) {
  const state = getState(message.from!.id)
  const chargeId = state?.activeSubscriptionChargeId

  if (chargeId === undefined) {
    return message.send('no active subscription to cancel')
  }

  await telegram.api.editUserStarSubscription({
    user_id: message.from!.id,
    telegram_payment_charge_id: chargeId,
    is_canceled: true
  })

  // note: we don't drop the charge id from local state — the subscription remains
  // valid until the current period ends, telegram just won't bill the next renewal
  return message.send('subscription cancelled — premium stays active until the current period ends, no renewal will occur')
}

async function handleRefund (message: MessageUpdate, telegram: Telegram, adminUserId: number) {
  if (message.from!.id !== adminUserId) {
    return message.send('not authorized')
  }

  const parts = message.text!.split(/\s+/)
  const chargeId = parts[1]

  if (chargeId === undefined) {
    const charges = listAllCharges().slice(0, 10)

    if (charges.length === 0) {
      return message.send('no charges to refund')
    }

    const lines = charges.map(c => {
      const refunded = c.refunded ? ' (refunded)' : ''

      return `• user ${c.userId} ${c.payload} ${c.amount}⭐${refunded}\n  /refund ${c.chargeId}`
    })

    return message.send('recent charges:\n\n' + lines.join('\n\n'))
  }

  const charge = listAllCharges().find(c => c.chargeId === chargeId)

  if (charge === undefined) {
    return message.send(`no charge with id ${chargeId}`)
  }

  if (charge.refunded) {
    return message.send('already refunded')
  }

  try {
    await telegram.api.refundStarPayment({
      user_id: charge.userId,
      telegram_payment_charge_id: chargeId
    })

    markRefunded(charge.userId, chargeId)

    return message.send(`refunded ${charge.amount}⭐ to user ${charge.userId}`)
  } catch (error) {
    return message.send(`refund failed: ${(error as Error).message}`)
  }
}

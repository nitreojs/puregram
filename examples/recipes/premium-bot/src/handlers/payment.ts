import type { Telegram } from 'puregram'

import { isKnownPayload } from '../products'
import { recordCharge } from '../store'

export function registerPaymentHandlers (telegram: Telegram) {
  // last chance to refuse the payment. must answer within 10 seconds —
  // do nothing slow here (no http calls, no waiting on db locks)
  telegram.onPreCheckoutQuery(async (query) => {
    if (!isKnownPayload(query.invoicePayload)) {
      await query.answer({
        ok: false,
        error_message: 'unknown product. please pick from /unlock again'
      })

      return
    }

    // real bots would check inventory / per-user limits here. for the demo
    // we accept everything from a known payload
    await query.answer({ ok: true })
  })

  // payment confirmed by telegram. fires once for one-time charges,
  // and once per period for subscriptions (isRecurring=true on renewals)
  telegram.onSuccessfulPayment((message) => {
    const payment = message.successfulPayment

    if (payment === undefined || !isKnownPayload(payment.invoicePayload)) {
      return
    }

    recordCharge(message.from!.id, {
      chargeId: payment.telegramPaymentChargeId,
      payload: payment.invoicePayload,
      amount: payment.totalAmount,
      paidAt: Math.floor(Date.now() / 1000),
      subscriptionExpiresAt: payment.subscriptionExpirationDate
    })

    const isFirst = payment.isFirstRecurring === true
    const isRenewal = payment.isRecurring === true && !isFirst

    const reply = isRenewal
      ? `🔁 subscription renewed — ${payment.totalAmount} ⭐ charged, valid until ${formatExpiry(payment.subscriptionExpirationDate)}`
      : isFirst
        ? `⭐ subscription active — ${payment.totalAmount} ⭐, renews on ${formatExpiry(payment.subscriptionExpirationDate)}`
        : `⭐ premium unlocked — thanks for the ${payment.totalAmount} ⭐!\n\ntry /content`

    return message.send(reply)
  })
}

function formatExpiry (unix: number | undefined) {
  if (unix === undefined) {
    return 'unknown'
  }

  return new Date(unix * 1000).toISOString().slice(0, 10)
}

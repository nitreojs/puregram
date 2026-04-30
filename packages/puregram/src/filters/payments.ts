// payment-payload filters — equality match against the `invoice_payload` set
// at invoice creation time. shipping/pre-checkout queries expose it directly
// on the query payload; for completed payments the field lives nested under
// `successful_payment.invoice_payload` on the service-event message

import { defineFilter } from '@puregram/api'
import type { Filter, PreCheckoutQueryUpdate, ShippingQueryUpdate, SuccessfulPayment, SuccessfulPaymentUpdate } from '@puregram/api'

const SHIPPING_KINDS = ['shipping_query'] as const
const PRE_CHECKOUT_KINDS = ['pre_checkout_query'] as const
const SUCCESSFUL_PAYMENT_KINDS = ['successful_payment'] as const

/**
 * match `shipping_query` updates whose `invoice_payload` exactly equals the
 * supplied value
 */
export function shippingPayload (
  value: string
): Filter<ShippingQueryUpdate, { invoicePayload: string }> {
  return defineFilter<ShippingQueryUpdate, { invoicePayload: string }>(
    `shippingPayload(${value})`,
    (u): u is ShippingQueryUpdate =>
      (u as { raw?: { invoice_payload?: unknown } }).raw?.invoice_payload === value,
    { kinds: SHIPPING_KINDS }
  )
}

/**
 * match `pre_checkout_query` updates whose `invoice_payload` exactly equals
 * the supplied value
 */
export function preCheckoutPayload (
  value: string
): Filter<PreCheckoutQueryUpdate, { invoicePayload: string }> {
  return defineFilter<PreCheckoutQueryUpdate, { invoicePayload: string }>(
    `preCheckoutPayload(${value})`,
    (u): u is PreCheckoutQueryUpdate =>
      (u as { raw?: { invoice_payload?: unknown } }).raw?.invoice_payload === value,
    { kinds: PRE_CHECKOUT_KINDS }
  )
}

/**
 * match `successful_payment` service-event updates whose
 * `successful_payment.invoice_payload` exactly equals the supplied value
 */
export function successfulPaymentPayload (
  value: string
): Filter<SuccessfulPaymentUpdate, { successfulPayment: SuccessfulPayment }> {
  return defineFilter<SuccessfulPaymentUpdate, { successfulPayment: SuccessfulPayment }>(
    `successfulPaymentPayload(${value})`,
    (u): u is SuccessfulPaymentUpdate =>
      (u as { raw?: { successful_payment?: { invoice_payload?: unknown } } })
        .raw?.successful_payment?.invoice_payload === value,
    { kinds: SUCCESSFUL_PAYMENT_KINDS }
  )
}

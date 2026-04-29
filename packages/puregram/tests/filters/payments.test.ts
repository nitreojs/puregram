import { describe, expect, it } from 'vitest'

import { preCheckoutPayload, shippingPayload, successfulPaymentPayload } from '../../src/filters/payments'

describe('shippingPayload', () => {
  const update = (payload: string) => ({
    kind: 'shipping_query',
    raw: {
      id: 'sq1',
      from: { id: 1, is_bot: false, first_name: 'x' },
      invoice_payload: payload,
      shipping_address: {
        country_code: 'US', state: '', city: '', street_line1: '', street_line2: '', post_code: ''
      }
    }
  })

  it('matches exact invoice_payload value', () => {
    expect(shippingPayload('p1')(update('p1'))).toBe(true)
    expect(shippingPayload('p1')(update('p2'))).toBe(false)
  })
})

describe('preCheckoutPayload', () => {
  const update = (payload: string) => ({
    kind: 'pre_checkout_query',
    raw: {
      id: 'pc1',
      from: { id: 1, is_bot: false, first_name: 'x' },
      currency: 'USD',
      total_amount: 100,
      invoice_payload: payload
    }
  })

  it('matches exact invoice_payload value', () => {
    expect(preCheckoutPayload('p1')(update('p1'))).toBe(true)
    expect(preCheckoutPayload('p1')(update('p2'))).toBe(false)
  })
})

describe('successfulPaymentPayload', () => {
  const update = (payload: string) => ({
    kind: 'successful_payment',
    raw: {
      message_id: 1,
      date: 0,
      chat: { id: 100, type: 'private' },
      successful_payment: {
        currency: 'USD',
        total_amount: 100,
        invoice_payload: payload,
        telegram_payment_charge_id: 'tp',
        provider_payment_charge_id: 'pp'
      }
    }
  })

  it('matches exact nested invoice_payload value', () => {
    expect(successfulPaymentPayload('p1')(update('p1'))).toBe(true)
    expect(successfulPaymentPayload('p1')(update('p2'))).toBe(false)
  })
})

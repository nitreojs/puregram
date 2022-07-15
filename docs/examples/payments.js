// --> https://core.telegram.org/bots/payments <--

import { Telegram } from 'puregram'
import { HearManager } from '@puregram/hear'

const telegram = Telegram.fromToken(process.env.TOKEN)
const hearManager = new HearManager()

telegram.updates.on('message', hearManager.middleware)

hearManager.hear(/^\/payments$/i, (context) => {
  // INFO: sending an invoice to user

  return context.sendInvoice({
    title: 'product name',
    description: 'product description (actual message text)',
    currency: 'USD', // INFO: https://core.telegram.org/bots/payments#supported-currencies
    payload: { product: 'product name' },
    prices: [
      {
        label: 'product name',
        amount: 5000 // 50,00$
      },
      {
        label: 'some more stuff',
        amount: 135 // 1,35$
      }
    ],
    provider_token: process.env.STRIPE_TOKEN, // INFO: https://core.telegram.org/bots/payments#getting-a-token
    start_parameter: 'test',

    is_flexible: true,
    need_name: true
  })
})

telegram.updates.on('shipping_query', async (context) => {
  // INFO: triggered when product has `is_flexible` or `need_shipping_address` options

  console.log(`${context.from.firstName} wants to ship ${context.invoicePayload.product} to ${context.shippingAddress.city}!`)

  await telegram.api.answerShippingQuery({
    shipping_query_id: context.id,
    ok: true,
    shipping_options: [
      {
        id: 'shipping-somewhere',
        title: 'shipping to somewhere',
        prices: [
          {
            label: 'shipping to somewhere',
            amount: 1250 // 12,50$
          }
        ]
      }
    ]
  })
})

telegram.updates.on('pre_checkout_query', async (context) => {
  // INFO: triggered when user pressed "Pay" button and Telegram expecting
  // INFO: you to verify all the data and say if everything is OK

  await context.answerPreCheckoutQuery({ ok: true })

  // INFO: an alternative
  // await context.answerPreCheckoutQuery({
  //   ok: false,
  //   error_message: `we have no ${context.invoicePayload.product} now!`
  // });
})

telegram.updates.on('successful_payment', async (context) => {
  // INFO: triggered when the payment went OK and money has been sent to you

  await context.reply(`thank you, *${context.eventPayment.orderInfo.name}*, for purchasing *${context.eventPayment.invoicePayload.product}*!`, {
    parse_mode: 'markdown'
  })
})

telegram.updates.startPolling()
  .then(() => console.log('started'))
  .catch(console.error)

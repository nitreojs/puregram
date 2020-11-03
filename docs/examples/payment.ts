import {
  Telegram,
  MessageContext,
  PreCheckoutQueryContext,
  SuccessfulPaymentContext
} from 'puregram';

const PROVIDER_TOKEN: string = process.env.PROVIDER_TOKEN!;
const BOT_TOKEN: string = process.env.BOT_TOKEN!;

const telegram: Telegram = new Telegram({
  token: BOT_TOKEN
});

// @ts-ignore
telegram.updates.on('message', async (context: MessageContext) => {
  if (context.hasText && context.text === '/test') {
    return context.sendInvoice({
      title: 'Test title',
      description: 'Test description',
      payload: 'Some payload',
      provider_token: PROVIDER_TOKEN,

      start_parameter: 'test',
      currency: 'RUB',
      prices: [
        {
          label: 'Cringe',
          amount: 133700
        }
      ]
    });
  }
});

// @ts-ignore
telegram.updates.on('pre_checkout_query', async (context: PreCheckoutQueryContext) => {
  await telegram.api.answerPreCheckoutQuery({
    ok: true,
    error_message: 'what',
    pre_checkout_query_id: context.id
  });
});

// @ts-ignore
telegram.updates.on('successful_payment', async (context: SuccessfulPaymentContext) => {
  await context.send('Спасибо за покупку!');
});

telegram.updates.startPolling().catch(console.error);

import {
  Telegram,
  MessageContext,
  CallbackQueryContext,
  InlineKeyboard
} from 'puregram';

import { SessionManager } from '@puregram/session';

import {
  SceneManager,
  StepScene,
  StepContext
} from '@puregram/scenes';

import { HearManager } from '@puregram/hear';

type HearManagerType = (MessageContext | CallbackQueryContext) & StepContext;
type Sex = 'male' | 'female' | 'android';

const telegram: Telegram = new Telegram({
  token: process.env.TOKEN
});

const sessionManager: SessionManager = new SessionManager();
const sceneManager: SceneManager = new SceneManager();
const hearManager: HearManager<HearManagerType> = new HearManager<HearManagerType>();

// Both message and callback query because we will
// handle messages and inline keyboard button taps
const events: string[] = ['message', 'callback_query'];

telegram.updates.on(
  events,
  sessionManager.middleware
);

telegram.updates.on(
  events,
  sceneManager.middleware
);

telegram.updates.on(
  events,
  sceneManager.middlewareIntercept
);

telegram.updates.on(
  ['message'],
  hearManager.middleware
);

hearManager.hear(
  /^\/hello$/i,
  (context: HearManagerType) => (
    context.scene.enter('hello')
  )
);

// Setting up our steps
sceneManager.addScenes([
  new StepScene('hello', [
    (context: HearManagerType) => {
      if (context.scene.step.firstTime) {
        const keyboard: InlineKeyboard = InlineKeyboard.keyboard([
          [
            InlineKeyboard.textButton({
              text: 'Male',
              payload: { sex: 'male' }
            }),

	          InlineKeyboard.textButton({
              text: 'Female',
              payload: { sex: 'female' }
            })
	        ],

          [
                  InlineKeyboard.textButton({
                    text: 'Prefer not to say',
              payload: { sex: 'android' }
            })
          ]
        ]);

        return context.send(
          'Welcome. Please tell me, ' +
          'are you a man or a woman.',
          { reply_markup: keyboard }
        );
      }

      if (!context.is('callback_query')) {
        return context.deleteMessage();
      }

      const sex: Sex = context.queryPayload.sex;

      context.scene.state.sex = sex;

      return context.scene.step.next();
    },

    async (context: HearManagerType) => {
      const sex: Sex = context.scene.state.sex;

      const phrase: string = {
        male: 'Ayy bro! How ya doin\'?',
        female: 'Hello, mam, you are welcome.',
        android: 'So you are android? 01100100100101.'
      }[sex];

      await context.message!.editMessageText(phrase); 

      // Automatic exit because this is the last step
      return context.scene.step.next();
    }
  ])
]);

telegram.updates.startPolling().catch(console.error);


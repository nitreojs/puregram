let {
  Telegram,
  Keyboard,
  KeyboardBuilder,
  InlineKeyboard,
  InlineKeyboardBuilder
} = require('puregram');

let telegram = new Telegram({
  token: process.env.TOKEN
});

telegram.updates.setHearFallbackHandler(
  context => context.send(
    'Enter either /keyboard, /keyboardbuilder, /inline or /inlinebuilder.'
  )
);

telegram.updates.hear('/keyboard', (context) => context.send('There\'s your keyboard!', {
    reply_markup: Keyboard.keyboard([
      [
        Keyboard.textButton('Button')
      ],

      [
        Keyboard.textButton('Another button'),
        Keyboard.textButton('But there\'s more!')
      ],

      [
        Keyboard.textButton('So'),
        Keyboard.textButton('many'),
        Keyboard.textButton('buttons!')
      ],
    ]).resize()
  }));

telegram.updates.hear('/keyboardbuilder', (context) => context.send('There\'s your keyboard!', {
    reply_markup: new KeyboardBuilder()
      .textButton('Button')
      .row()
      .textButton('Another button')
      .textButton('But there\'s more!')
      .row()
      .textButton('So')
      .textButton('many')
      .textButton('buttons!')
      .resize()
  }));

telegram.updates.hear('/inline', (context) => context.send('There\'s your keyboard!', {
    reply_markup: InlineKeyboard.keyboard([
      [
        InlineKeyboard.textButton({
          text: 'Inline button!',
        })
      ],

      [
        InlineKeyboard.textButton({
          text: 'And there\'s more!',
        }),

        InlineKeyboard.textButton({
          text: 'Payload button',
          payload: { payload: true },
        })
      ],

      [
        InlineKeyboard.textButton({
          text: 'This',
        }),

        InlineKeyboard.textButton({
          text: 'is',
        }),

        InlineKeyboard.textButton({
          text: 'epic!',
        })
      ]
    ])
  }));

telegram.updates.hear('/inlinebuilder', (context) => context.send('There\'s your keyboard!', {
    reply_markup: new InlineKeyboardBuilder()
      .textButton({ text: 'Inline button!' })
      .row()
      .textButton({ text: 'And there\'s more!' })
      .textButton({
        text: 'Payload button',
        payload: { payload: true },
      })
      .row()
      .textButton({ text: 'This' })
      .textButton({ text: 'is' })
      .textButton({ text: 'epic!' })
  }));

telegram.updates.on('callback_query', (context) => context.answerCallbackQuery('You just clicked the inline button!'));

telegram.updates.startPolling().then(
  () => console.log('Started polling')
).catch(console.error);

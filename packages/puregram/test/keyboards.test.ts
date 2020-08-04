import {
  ForceReply,
  InlineKeyboard,
  InlineKeyboardBuilder,
  Keyboard,
  KeyboardBuilder,
  RemoveKeyboard
} from '../src';

import {
  TelegramInlineKeyboardMarkup,
  TelegramForceReply,
  KeyboardJSON
} from '../src/interfaces';

describe('Keyboards', (): void => {
  describe('ForceReply', (): void => {
    describe('#<ForceReply>.toJSON()', (): void => {
      it('should return valid JSON', (): void => {
        const selectiveKeyboard: ForceReply = new ForceReply().selective();
        const nonSelectiveKeyboard: ForceReply = new ForceReply().selective(false);

        expect(selectiveKeyboard.toJSON()).toEqual({
          force_reply: true,
          selective: true
        });

        expect(nonSelectiveKeyboard.toJSON()).toEqual({
          force_reply: true,
          selective: false
        });
      });

      it('should return invalid JSON', (): void => {
        const selectiveKeyboard: ForceReply = new ForceReply().selective();
        const nonSelectiveKeyboard: ForceReply = new ForceReply().selective(false);

        expect(selectiveKeyboard.toJSON()).not.toEqual({
          force_reply: true,
          selective: false
        } as TelegramForceReply);

        expect(nonSelectiveKeyboard.toJSON()).not.toEqual({
          force_reply: true,
          selective: true
        } as TelegramForceReply);
      });
    });
  });

  describe('InlineKeyboard', (): void => {
    describe('#InlineKeyboard.keyboard()', (): void => {
      it('should return valid JSON', (): void => {
        const keyboard: InlineKeyboard = InlineKeyboard.keyboard([
          [
            InlineKeyboard.textButton({
              text: 'This is an inline button',
              payload: 'Some string payload'
            })
          ],

          [
            InlineKeyboard.textButton({
              text: 'One more inline button',
              payload: { foo: 'bar' }
            })
          ]
        ]);

        expect(keyboard.toJSON()).toEqual({
          inline_keyboard: [
            [
              {
                text: 'This%20is%20an%20inline%20button',
                callback_data: 'Some string payload'
              }
            ],

            [
              {
                text: 'One%20more%20inline%20button',
                callback_data: '{"foo":"bar"}'
              }
            ]
          ]
        } as TelegramInlineKeyboardMarkup);
      });
    });
  });

  describe('InlineKeyboardBuilder', (): void => {
    describe('#<InlineKeyboardBuilder>', (): void => {
      it('should return valid JSON', (): void => {
        const keyboard: InlineKeyboardBuilder = new InlineKeyboardBuilder()
          .textButton({
            text: 'This is an inline button',
            payload: 'Some string payload'
          })
          .row()
          .textButton({
            text: 'One more inline button',
            payload: { foo: 'bar' }
          });

        expect(keyboard.toJSON()).toEqual({
          inline_keyboard: [
            [
              {
                text: 'This%20is%20an%20inline%20button',
                callback_data: 'Some string payload'
              }
            ],

            [
              {
                text: 'One%20more%20inline%20button',
                callback_data: '{"foo":"bar"}'
              }
            ]
          ]
        } as TelegramInlineKeyboardMarkup);
      });
    });
  });

  describe('Keyboard', (): void => {
    describe('#Keyboard.keyboard()', (): void => {
      it('should return valid JSON', (): void => {
        const keyboard: Keyboard = Keyboard.keyboard([
          [
            Keyboard.textButton('Some keyboard button'),
            Keyboard.textButton('One more keyboard button')
          ],

          [
            Keyboard.textButton('Button in a different row')
          ]
        ]).resize().selective();

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              { text: 'Some%20keyboard%20button' },
              { text: 'One%20more%20keyboard%20button' }
            ],

            [
              { text: 'Button%20in%20a%20different%20row' }
            ]
          ],
          one_time_keyboard: false,
          resize_keyboard: true,
          selective: true
        } as KeyboardJSON);
      });

      it('should return valid JSON [request contact]', (): void => {
        const keyboard: Keyboard = Keyboard.keyboard([
          [
            Keyboard.requestContactButton('Request contact button')
          ]
        ]).resize().oneTime();

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              {
                text: 'Request%20contact%20button',
                request_contact: true
              }
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
          selective: false
        } as KeyboardJSON);
      });

      it('should return valid JSON [request poll]', (): void => {
        const keyboard: Keyboard = Keyboard.keyboard([
          [
            Keyboard.requestPollButton('Request poll button', 'quiz')
          ]
        ]);

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              {
                text: 'Request%20poll%20button',
                request_poll: { type: 'quiz' }
              }
            ]
          ],
          one_time_keyboard: false,
          resize_keyboard: false,
          selective: false
        } as KeyboardJSON);
      });
    });
  });

  describe('KeyboardBuilder', (): void => {
    describe('#<KeyboardBuilder>', (): void => {
      it('should return valid JSON', (): void => {
        const keyboard: KeyboardBuilder = new KeyboardBuilder()
          .textButton('Some keyboard button')
          .textButton('One more keyboard button')
          .row()
          .textButton('Button in a different row')
          .resize()
          .oneTime()
          .selective();

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              { text: 'Some%20keyboard%20button' },
              { text: 'One%20more%20keyboard%20button' }
            ],

            [
              { text: 'Button%20in%20a%20different%20row' }
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
          selective: true
        } as KeyboardJSON);
      });

      it('should return valid JSON [request contact]', (): void => {
        const keyboard: KeyboardBuilder = new KeyboardBuilder()
          .requestContactButton('Request contact button')
          .resize()
          .oneTime()
          .selective();

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              {
                text: 'Request%20contact%20button',
                request_contact: true
              },
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
          selective: true
        } as KeyboardJSON);
      });

      it('should return valid JSON [request poll]', (): void => {
        const keyboard: KeyboardBuilder = new KeyboardBuilder()
          .requestPollButton('Request poll button', 'regular')
          .resize()
          .oneTime()
          .selective();

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              {
                text: 'Request%20poll%20button',
                request_poll: { type: 'regular' }
              },
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
          selective: true
        } as KeyboardJSON);
      });
    });
  });

  describe('RemoveKeyboard', (): void => {
    describe('#<RemoveKeyboard>', (): void => {
      it('should return valid JSON', (): void => {
        const keyboard: RemoveKeyboard = new RemoveKeyboard()
          .selective();

        expect(keyboard.toJSON()).toEqual({
          remove_keyboard: true,
          selective: true
        });
      });
    });
  });
});

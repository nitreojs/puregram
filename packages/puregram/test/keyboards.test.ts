import {
  ForceReply,
  InlineKeyboard,
  InlineKeyboardBuilder,
  Keyboard,
  KeyboardBuilder,
  RemoveKeyboard
} from '../src/common/keyboards'

describe('Keyboards', () => {
  describe('ForceReply', () => {
    describe('#<ForceReply>.toJSON()', () => {
      it('should return valid JSON', () => {
        const selectiveKeyboard = new ForceReply().selective()
        const nonSelectiveKeyboard = new ForceReply().selective(false)

        expect(selectiveKeyboard.toJSON()).toEqual({
          force_reply: true,
          selective: true
        })

        expect(nonSelectiveKeyboard.toJSON()).toEqual({
          force_reply: true,
          selective: false
        })
      })

      it('should return invalid JSON', () => {
        const selectiveKeyboard = new ForceReply().selective()
        const nonSelectiveKeyboard = new ForceReply().selective(false)

        expect(selectiveKeyboard.toJSON()).not.toEqual({
          force_reply: true,
          selective: false
        })

        expect(nonSelectiveKeyboard.toJSON()).not.toEqual({
          force_reply: true,
          selective: true
        })
      })
    })
  })

  describe('InlineKeyboard', () => {
    describe('#InlineKeyboard.keyboard()', () => {
      it('should return valid JSON', () => {
        const keyboard = InlineKeyboard.keyboard([
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
        ])

        expect(keyboard.toJSON()).toEqual({
          inline_keyboard: [
            [
              {
                text: 'This is an inline button',
                callback_data: 'Some string payload'
              }
            ],

            [
              {
                text: 'One more inline button',
                callback_data: '{"foo":"bar"}'
              }
            ]
          ]
        })
      })
    })
  })

  describe('InlineKeyboardBuilder', () => {
    describe('#<InlineKeyboardBuilder>', () => {
      it('should return valid JSON', () => {
        const keyboard = new InlineKeyboardBuilder()
          .textButton({
            text: 'This is an inline button',
            payload: 'Some string payload'
          })
          .row()
          .textButton({
            text: 'One more inline button',
            payload: { foo: 'bar' }
          })

        expect(keyboard.toJSON()).toEqual({
          inline_keyboard: [
            [
              {
                text: 'This is an inline button',
                callback_data: 'Some string payload'
              }
            ],

            [
              {
                text: 'One more inline button',
                callback_data: '{"foo":"bar"}'
              }
            ]
          ]
        })
      })
    })
  })

  describe('Keyboard', () => {
    describe('#Keyboard.keyboard()', () => {
      it('should return valid JSON', () => {
        const keyboard = Keyboard.keyboard([
          [
            Keyboard.textButton('Some keyboard button'),
            Keyboard.textButton('One more keyboard button')
          ],

          [
            Keyboard.textButton('Button in a different row')
          ]
        ]).resize().selective()

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              { text: 'Some keyboard button' },
              { text: 'One more keyboard button' }
            ],

            [
              { text: 'Button in a different row' }
            ]
          ],
          one_time_keyboard: false,
          resize_keyboard: true,
          selective: true
        })
      })

      it('should return valid JSON [request contact]', () => {
        const keyboard = Keyboard.keyboard([
          [
            Keyboard.requestContactButton('Request contact button')
          ]
        ]).resize().oneTime()

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              {
                text: 'Request contact button',
                request_contact: true
              }
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
          selective: false
        })
      })

      it('should return valid JSON [request poll]', () => {
        const keyboard = Keyboard.keyboard([
          [
            Keyboard.requestPollButton('Request poll button', 'quiz')
          ]
        ])

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              {
                text: 'Request poll button',
                request_poll: { type: 'quiz' }
              }
            ]
          ],
          one_time_keyboard: false,
          resize_keyboard: false,
          selective: false
        })
      })
    })
  })

  describe('KeyboardBuilder', () => {
    describe('#<KeyboardBuilder>', () => {
      it('should return valid JSON', () => {
        const keyboard = new KeyboardBuilder()
          .textButton('Some keyboard button')
          .textButton('One more keyboard button')
          .row()
          .textButton('Button in a different row')
          .resize()
          .oneTime()
          .selective()

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              { text: 'Some keyboard button' },
              { text: 'One more keyboard button' }
            ],

            [
              { text: 'Button in a different row' }
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
          selective: true
        })
      })

      it('should return valid JSON [request contact]', () => {
        const keyboard = new KeyboardBuilder()
          .requestContactButton('Request contact button')
          .resize()
          .oneTime()
          .selective()

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              {
                text: 'Request contact button',
                request_contact: true
              }
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
          selective: true
        })
      })

      it('should return valid JSON [request poll]', () => {
        const keyboard = new KeyboardBuilder()
          .requestPollButton('Request poll button', 'regular')
          .resize()
          .oneTime()
          .selective()

        expect(keyboard.toJSON()).toEqual({
          keyboard: [
            [
              {
                text: 'Request poll button',
                request_poll: { type: 'regular' }
              }
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
          selective: true
        })
      })
    })
  })

  describe('RemoveKeyboard', () => {
    describe('#<RemoveKeyboard>', () => {
      it('should return valid JSON', () => {
        const keyboard = new RemoveKeyboard()
          .selective()

        expect(keyboard.toJSON()).toEqual({
          remove_keyboard: true,
          selective: true
        })
      })
    })
  })
})

import { Context, Telegram } from '../src'

const telegram = new Telegram()

describe('Contexts', () => {
  describe('Context', () => {
    const context = new Context({
      telegram,
      updateType: 'message'
    })

    describe('#<Context>.is', () => {
      it('should return true when the context coincides with the input', () => {
        expect(context.is('message')).toBe(true)
        expect(context.is(['message'])).toBe(true)
        expect(context.is(['message', 'edited_message'])).toBe(true)
      })

      it('should return false when the context does not coincide with the input', () => {
        expect(context.is('callback_query')).toBe(false)
        expect(context.is(['callback_query'])).toBe(false)
        expect(context.is(['callback_query', 'channel_post'])).toBe(false)
      })
    })
  })
})

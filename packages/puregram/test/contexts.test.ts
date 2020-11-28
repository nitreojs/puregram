import {
  Context,
  Telegram
} from '../src';

const telegram: Telegram = new Telegram();

describe('Contexts', (): void => {
  describe('Context', (): void => {
    const context: Context = new Context(telegram, 'message');

    describe('#<Context>.is', (): void => {
      it('should return true when the context coincides with the input', (): void => {
        expect(context.is('message')).toBe(true);
        expect(context.is(['message'])).toBe(true);
        expect(context.is(['message', 'edited_message'])).toBe(true);
      });

      it('should return false when the context does not coincide with the input', (): void => {
        expect(context.is('callback_query')).toBe(false);
        expect(context.is(['callback_query'])).toBe(false);
        expect(context.is(['callback_query', 'channel_post'])).toBe(false);
      });
    });
  });
});

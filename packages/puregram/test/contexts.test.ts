import {
  Context,
  Telegram
} from '../src';

const telegram: Telegram = new Telegram();

describe('Contexts', (): void => {
  describe('Context', (): void => {
    describe('#<Context>.is', (): void => {
      const context: Context = new Context(telegram, 'message');

      it('should return true when the context coincides with the input', (): void => {
        expect(context.is('message')).toEqual(true);
        expect(context.is(['message'])).toEqual(true);
        expect(context.is(['message', 'edited_message'])).toEqual(true);
      });

      it('should return false when the context does not coincide with the input', (): void => {
        expect(context.is('callback_query')).toEqual(false);
        expect(context.is(['callback_query'])).toEqual(false);
        expect(context.is(['callback_query', 'channel_post'])).toEqual(false);
      });
    });
  });
});

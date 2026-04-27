import { Telegram } from 'puregram'

// MockTelegram lives in puregram tests; relative-import until 3+ satellite
// packages need it and we extract @puregram/test-utils
// eslint-disable-next-line import/no-relative-packages -- internal test helper, not part of public api
import { MockTelegram } from '../../../puregram/tests/helpers/mock-telegram'

export { MockTelegram }

export async function makeTg (extras: (t: Telegram) => Telegram = t => t) {
  const mock = new MockTelegram()
  const baseUrl = await mock.start()

  // canned getMe so .startPolling() works
  mock.expect('getMe', {
    ok: true,
    result: { id: 1, is_bot: true, first_name: 'bot', username: 'testbot' }
  })

  const tg = extras(new Telegram({ token: 'TEST', apiBaseUrl: baseUrl }))

  return { tg, mock, baseUrl }
}

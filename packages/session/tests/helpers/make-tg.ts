import { Telegram } from 'puregram'

// MockTelegram lives in puregram tests; relative-import until 3+ satellite
// packages need it and we extract @puregram/test-utils
// eslint-disable-next-line import/no-relative-packages -- internal test helper, not part of public api
import { MockTelegram } from '../../../puregram/tests/helpers/mock-telegram'

export { MockTelegram }

// generic over the extras return so `t => t.extend(session())` keeps the typed
// extension on tg (e.g. tg.session.{get,set,delete})
export async function makeTg<T = Telegram> (extras: (t: Telegram) => T = t => t as unknown as T) {
  const mock = new MockTelegram()
  const baseUrl = await mock.start()

  // canned getMe so .start() / .startPolling() resolve
  mock.expect('getMe', {
    ok: true,
    result: { id: 1, is_bot: true, first_name: 'bot', username: 'testbot' }
  })

  const tg = extras(new Telegram({ token: 'TEST', apiBaseUrl: baseUrl }))

  return { tg, mock, baseUrl }
}

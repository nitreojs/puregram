import { Telegram } from 'puregram'

// eslint-disable-next-line import/no-relative-packages -- internal test helper, not part of public api
import { MockTelegram } from '../../../puregram/tests/helpers/mock-telegram'

export { MockTelegram }

export async function makeTg<T = Telegram> (extras: (t: Telegram) => T = t => t as unknown as T) {
  const mock = new MockTelegram()
  const baseUrl = await mock.start()

  mock.expect('getMe', {
    ok: true,
    result: { id: 1, is_bot: true, first_name: 'bot', username: 'testbot' }
  })

  const tg = extras(new Telegram({ token: 'TEST', apiBaseUrl: baseUrl }))

  return { tg, mock, baseUrl }
}

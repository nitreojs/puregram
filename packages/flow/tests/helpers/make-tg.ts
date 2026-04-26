import { Telegram } from 'puregram'

// the MockTelegram helper from stage 2 isn't published as a package export.
// we import it via a relative path — the workspace ensures the source is on disk.
// TODO: extract to @puregram/test-utils when 3+ satellite packages need this
// (likely after stage 4 session adds the second consumer; stage 7 media-cacher
// would be the third).
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

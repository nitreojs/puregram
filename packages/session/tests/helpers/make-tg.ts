import { Telegram } from 'puregram'

// the MockTelegram helper from stage 2 isn't published as a package export.
// imported via a relative path — the workspace ensures the source is on disk.
// TODO: extract to @puregram/test-utils when 3+ satellite packages need this
// (stage 4 makes session the second consumer; stage 7 media-cacher would be the third)
// eslint-disable-next-line import/no-relative-packages -- internal test helper, not part of public api
import { MockTelegram } from '../../../puregram/tests/helpers/mock-telegram'

export { MockTelegram }

// generic over the extras return so callers like `t => t.extend(session())` keep
// the typed extension on `tg` (e.g. tg.session.{get,set,delete}). flow's helper
// uses `(tg as any).flow.x` instead — both patterns work; this one is type-clean.
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

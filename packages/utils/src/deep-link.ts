/** options for {@link deepLink} — pick at most one of `start` / `startgroup` / `startchannel` / `startapp` */
export interface DeepLinkOpts {
  /** target bot username (without `@`) */
  bot: string
  /** `?start=<payload>` — deep-link a private chat with a start payload */
  start?: string
  /** `?startgroup=<payload>` — deep-link an "add to group" flow */
  startgroup?: string
  /** `?startchannel` — deep-link an "add to channel" flow; pair with `admin` to request rights */
  startchannel?: true
  /** admin rights joined with `+` when using `startchannel` */
  admin?: string[]
  /** `?startapp=<payload>` — deep-link a main mini-app launch with payload */
  startapp?: string
}

const PAYLOAD_KEYS = ['start', 'startgroup', 'startchannel', 'startapp'] as const

/**
 * builds a `https://t.me/<bot>?...` deep-link with proper URL encoding.
 *
 * supported variants: `start`, `startgroup`, `startchannel` (+ optional `admin[]`),
 * and `startapp`. when more than one payload is supplied, the first one in the
 * order `start → startgroup → startchannel → startapp` wins; the others are
 * silently ignored. with no payload at all the result is just `https://t.me/<bot>`
 *
 * @example
 * ```ts
 * deepLink({ bot: 'my_bot', start: 'ref_42' })       // → 'https://t.me/my_bot?start=ref_42'
 * deepLink({ bot: 'my_bot', startchannel: true, admin: ['post_messages', 'edit_messages'] })
 * // → 'https://t.me/my_bot?startchannel&admin=post_messages+edit_messages'
 * ```
 */
export function deepLink (opts: DeepLinkOpts) {
  const base = `https://t.me/${opts.bot}`

  let active: typeof PAYLOAD_KEYS[number] | undefined

  for (const key of PAYLOAD_KEYS) {
    if (opts[key] !== undefined) {
      active = key

      break
    }
  }

  if (active === undefined) {
    return base
  }

  if (active === 'startchannel') {
    const admin = opts.admin

    if (admin !== undefined && admin.length > 0) {
      return `${base}?startchannel&admin=${admin.map(encodeURIComponent).join('+')}`
    }

    return `${base}?startchannel`
  }

  const value = opts[active] as string

  return `${base}?${active}=${encodeURIComponent(value)}`
}

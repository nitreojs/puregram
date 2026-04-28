import crypto from 'node:crypto'

export interface WebAppValidateParams {
  /** `initData` (not `initDataUnsafe`) received from `Telegram.WebApp.initData` */
  initData: string
  /** secret key generated via {@link WebApp.generateSecretKey}. mutually exclusive with `token` */
  key?: Buffer
  /** bot token; used to derive the secret key when `key` is not supplied */
  token?: string
  /** if `true`, throws on invalid initData instead of returning `false` (default `false`) */
  throwError?: boolean
}

/**
 * telegram web app initData validation helpers.
 * see https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 *
 * @example
 * ```ts
 * const key = WebApp.generateSecretKey(BOT_TOKEN)
 * const valid = WebApp.validate({ initData, key })
 * ```
 */
export class WebApp {
  /** derives the HMAC SHA256 secret key from a bot token. cache the result; do not regenerate per request */
  static generateSecretKey (token: string) {
    return crypto.createHmac('sha256', 'WebAppData').update(token).digest()
  }

  static parseInitData (initData: string) {
    return Object.fromEntries(new URLSearchParams(initData).entries())
  }

  /** computes the HMAC SHA256 hex digest of an `initData` against the given secret key */
  static generateInitDataHash (initData: string, key: Buffer) {
    const data = WebApp.parseInitData(initData)
    const dataCheckString = Object.keys(data)
      .filter(k => k !== 'hash')
      .sort()
      .map(k => `${k}=${data[k] ?? ''}`)
      .join('\n')

    return crypto.createHmac('sha256', key as Uint8Array).update(dataCheckString).digest('hex')
  }

  /** validates `initData` against the bot's secret key (or token). returns `true` when the hash matches */
  static validate (params: WebAppValidateParams) {
    const { initData, throwError = false } = params

    if (params.key === undefined && params.token === undefined) {
      throw new TypeError('WebApp.validate: either `key` or `token` must be provided')
    }

    const data = WebApp.parseInitData(initData)
    const hash = data.hash

    if (hash === undefined) {
      throw new TypeError('WebApp.validate: initData has no `hash` field')
    }

    const key = params.key ?? WebApp.generateSecretKey(params.token as string)
    const valid = WebApp.generateInitDataHash(initData, key) === hash

    if (!valid && throwError) {
      throw new Error('WebApp.validate: initData hash mismatch')
    }

    return valid
  }
}

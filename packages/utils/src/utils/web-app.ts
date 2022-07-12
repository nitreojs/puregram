import crypto from 'node:crypto'

interface WebAppValidateInitDataParams {
  /** `initData` (not `initDataUnsafe`!) received from `Telegram.WebApp.initData` */
  initData: string
  /**
   * Secret key generated with HMAC SHA256.
   * Can be generated via `WebApp.generateSecretKey(token: string)`
   */
  key?: Buffer
  /** Bot's token that will be used to get the secret key */
  token?: string
  /**
   * If `true`, throws `Error` if passed `initData` was invalid
   * @default false
   */
  throwError?: boolean
}

interface WebAppGenerateSecretKeyResult {
  key: Buffer
}

interface WebAppGenerateInitDataHashResult {
  hash: string
}

/**
 * Class for `Telegram.WebApp` validation methods
 * @see {@link https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app}
 * @example
 * ```js
 * const initData = Telegram.WebApp.initData
 * const key = WebApp.generateSecretKey(BOT_TOKEN)
 *
 * const isValid = WebApp.validate({ initData, key })
 *
 * if (!isValid) {
 *   console.error('init data is not valid!')
 * }
 * ```
 */
export class WebApp {
  /**
   * Generates HMAC SHA256 (key: `'WebAppData'`) secret key by bot's token.
   * Note that it might be expensive to always regenerate that key so make sure to generate that
   * one time and store it somewhere easy to access
   */
  static async generateSecretKey (token: string): Promise<WebAppGenerateSecretKeyResult> {
    const key = (
      crypto
        .createHmac('sha256', 'WebAppData')
        .update(token)
        .digest()
    )

    return { key }
  }

  /** Parses `Telegram.WebApp.initData` into readable object */
  static parseInitData (initData: string) {
    return Object.fromEntries(
      new URLSearchParams(initData).entries()
    ) as Record<string, string>
  }

  /** Generates HMAC SHA256 (key: encrypted HMAC SHA256 bot's token) init data hash */
  static async generateInitDataHash (initData: string, key: Buffer):
    Promise<WebAppGenerateInitDataHashResult> {
    const data = WebApp.parseInitData(initData)

    const dataCheckString = (
      Object.keys(data) // INFO: getting init data keys
        .filter(key => key !== 'hash') // INFO: removing `hash` from them
        .sort() // INFO: sort them alphabetically
        .map(key => key + '=' + data[key]) // INFO: transform into query-like string
        .join('\n') // INFO: join it
    )

    const hash = (
      crypto
        .createHmac('sha256', key)
        .update(dataCheckString)
        .digest('hex')
    )

    return { hash }
  }

  /** Validates passed `initData` with `hash` in it */
  static async validate (params: WebAppValidateInitDataParams) {
    const { initData, key, token, throwError = false } = params

    // INFO: either [key] or [token] must be provided
    if (key === undefined && token === undefined) {
      throw new TypeError('expected either a `key` or a `token`')
    }

    const data = WebApp.parseInitData(initData)
    const hash = data.hash

    // INFO: I don't know if that's even possible but let's check for that
    if (data.hash === undefined) {
      throw new TypeError('`data.hash` not found')
    }

    let bufferKey = key

    if (bufferKey === undefined && token !== undefined) {
      bufferKey = (await WebApp.generateSecretKey(token)).key
    }

    const initDataHash = (await WebApp.generateInitDataHash(initData, bufferKey as Buffer)).hash

    const valid = initDataHash === hash

    if (!valid && throwError) {
      throw new Error('invalid init data')
    }

    return { valid }
  }
}

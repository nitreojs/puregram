import { debug } from 'debug'
import { FormDataEncoder } from 'form-data-encoder'
import { File, FormData } from 'formdata-node'
import { fileFromPath } from 'formdata-node/file-from-path'
import { inspectable } from 'inspectable'
import { Readable } from 'node:stream'
import { deprecate } from 'node:util'

import { fetch, RequestInit } from 'undici'
import { MediaInput, MediaSourceType } from './common/media-source'
import { User } from './common/structures'
import { APIError } from './errors'

import { ApiMethods } from './generated'
import { ApiResponseUnion, TelegramOptions } from './types/interfaces'
import { ApiMethod, SoftString } from './types/types'
import { Updates } from './updates'

import { DEFAULT_OPTIONS, METHODS_WITH_MEDIA } from './utils/constants'

import { convertStreamToBuffer, decomplexify, generateAttachId, isMediaInput, updateDebugFlags } from './utils/helpers'

const $debugger = debug('puregram:api')

if ($debugger.enabled || debug.enabled('puregram:all')) {
  updateDebugFlags(['puregram:api/*', 'puregram:api/*:*'])
}

interface APICallMethod {
  /** Use this method to invoke Telegram Bot API `method` [with prompted `params`] */
  call: (method: SoftString<ApiMethod>, params?: Record<string, any>) => Promise<any>
}

interface APICreateAttachMediaInput {
  fd: FormData,
  input: Record<string, any>
  key: string
}

type ProxyAPIMethods = ApiMethods & APICallMethod

/**
 * Telegram class. Actually, this class is a set of other classes such as `Updates` and (uh that's it. `api` is not a class, it's a `Proxy` object :P)
 */
export class Telegram {
  options: TelegramOptions = { ...DEFAULT_OPTIONS }

  /**
   * API Proxy object
   *
   * @example
   * ```js
   * telegram.api.getMe()
   * telegram.api.sendMessage({ chat_id, text })
   * telegram.api.call('sendPhoto', { chat_id, photo })
   * ```
   */
  readonly api = new Proxy<ProxyAPIMethods>({} as ProxyAPIMethods, {
    get: (_target, method: string) =>
      (...args: any[]) => {
        // INFO: `telegram.api.call(path: string, params?: Record<string, any>)`
        if (method === 'call') {
          const path: string = args[0]
          const params: Record<string, any> | undefined = args[1]

          return this._callAPI(path, params)
        }

        return this._callAPI(method, args[0] as Record<string, any>)
      }
  })

  /** Updates instance */
  updates: Updates = new Updates(this)

  /** Bot data. You are able to access it only after `updates.startPolling()` succeeded! */
  bot!: User

  constructor (options: Partial<TelegramOptions> = {}) {
    Object.assign(this.options, options)

    this.callApi = deprecate(
      Telegram.prototype.callApi,
      '`callApi` is deprecated and will be removed in puregram@3.0.0, use `api.call` instead',
      'puregram'
    )

    this.setOptions = deprecate(
      Telegram.prototype.setOptions,
      '`setOptions` is deprecated and will be removed in puregram@3.0.0',
      'puregram'
    ) as typeof this.setOptions
  }

  /** Creates `Telegram` instance just from `token` [and `params`] */
  static fromToken (token: string, options: Partial<TelegramOptions> = {}) {
    return new Telegram({
      token,
      ...options
    })
  }

  /** @deprecated */
  setOptions (options: Partial<TelegramOptions>) {
    return this
  }

  /** Resolves `MediaInput` into a `File` or `string` */
  private async createMediaInput (input: MediaInput): Promise<unknown> {
    const filename = input.filename ?? 'file.dat'

    // INFO: returning file ID itself since we can't do anything with it
    if (input.type === MediaSourceType.FileId) {
      return input.value
    }

    // INFO: [File] passed, return it
    if (input.type === MediaSourceType.File) {
      return input.value
    }

    // INFO: creating [fs.ReadStream] from our path, returning that stream
    if (input.type === MediaSourceType.Path) {
      return fileFromPath(input.value, input.filename)
    }

    // INFO: convert stream into buffer and return it
    if (input.type === MediaSourceType.Stream) {
      const buffer = await convertStreamToBuffer(input.value)

      return new File([buffer], filename)
    }

    // INFO: returning buffer converted into a file
    if (input.type === MediaSourceType.Buffer) {
      return new File([input.value], filename)
    }

    // INFO: [ArrayBufferLike] passed, convert into a [File] and return in
    if (input.type === MediaSourceType.ArrayBuffer) {
      return new File([input.value], filename)
    }

    // INFO: fetching that URL and creating an array buffer -> file, returning that file
    // INFO: OR returning that URL right away
    if (input.type === MediaSourceType.Url) {
      // INFO: fetching URL contents and uploading them directly to Bot API
      if (input.forceUpload) {
        const url = input.value

        const isURL = /^https?:\/\//i.test(url)

        if (!isURL) {
          throw new TypeError(`'${url}' is not a valid URL`)
        }

        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()

        return new File([arrayBuffer], filename)
      }

      // INFO: ... or returning that URL right away =)
      return input.value
    }

    // @ts-expect-error user may pass invalid input.type and TypeScript does not know about it :shrug:
    throw new TypeError(`received invalid input type: ${input.type}`)
  }

  /** Uploads media as usual, returning `RequestInit` */
  private async uploadMedia (params: Record<string, any>, entity: [string, string[]]): Promise<RequestInit> {
    const fd = new FormData()

    // INFO: clears [params] object and keeps only media values from it
    const mediaEntries = Object.entries(params).filter(
      ([key]) => entity[1].includes(key)
    )

    for (const [key, input] of mediaEntries) {
      // INFO: we allow only [MediaInput] media values since [puregram@2.5.0]
      if (!isMediaInput(input)) {
        throw new TypeError('expected media to be created via `MediaSource`')
      }

      const fdValue = await this.createMediaInput(input)

      fd.set(key, fdValue)
    }

    const encoder = new FormDataEncoder(fd)

    return {
      method: 'POST',
      headers: encoder.headers,
      body: Readable.from(encoder)
    }
  }

  /** Validates media and creates it under `attach://<attach-id>` ID if necessary */
  private async createAttachMediaInput (params: APICreateAttachMediaInput) {
    const media = params.input[params.key] as MediaInput

    // INFO: we allow only [MediaInput] media values since [puregram@2.5.0]
    if (!isMediaInput(media)) {
      throw new TypeError('expected media to be created via `MediaSource`')
    }

    // INFO: we don't need to generate `attach://` clause if we are working with file IDs
    if (media.type === MediaSourceType.FileId) {
      params.input[params.key] = media.value

      // INFO: we are dealing with URLs and we are not forced to upload them manually,
      // INFO: so we should just put it as is
    } else if (media.type === MediaSourceType.Url && !media.forceUpload) {
      params.input[params.key] = media.value

      // INFO: otherwise...
    } else {
      const attachId = generateAttachId()

      const fdValue = await this.createMediaInput(media)

      params.fd.set(attachId, fdValue)
      params.input[params.key] = `attach://${attachId}`
    }
  }

  /**
   * `uploadWithMedia` shares the same logic under the hood for both `sendMediaGroup` and `editMessageMedia`.
   * This method keeps it separate yet organic at the same time
   */
  private async processUploadWithMedia (fd: FormData, input: Record<string, any>) {
    // INFO: [thumb] property might exist and we need to also handle it
    if (input.thumb !== undefined) {
      await this.createAttachMediaInput({ fd, input, key: 'thumb' })
    }

    await this.createAttachMediaInput({ fd, input, key: 'media' })
  }

  /**
   * Methods like `sendMediaGroup` and `editMessageMedia` has `media: MediaInput` (or `media: MediaInput[]`) properties.
   * This method makes it so this `media` property is handled properly
   */
  private async uploadWithMedia (params: Record<string, any>): Promise<RequestInit> {
    const fd = new FormData()

    const { media } = params

    if (Array.isArray(media)) {
      // INFO: `media: MediaInput[]`, probably `sendMediaGroup`

      for (let i = 0; i < media.length; i++) {
        const input = media[i]

        await this.processUploadWithMedia(fd, input)
      }
    } else {
      // INFO: `media: MediaInput`, probably `editMessageMedia`

      await this.processUploadWithMedia(fd, media)
    }

    fd.set('media', JSON.stringify(media))

    const encoder = new FormDataEncoder(fd)

    return {
      method: 'POST',
      headers: encoder.headers,
      body: Readable.from(encoder)
    }
  }

  /** Invokes Telegram Bot API `path` method [with `params`] */
  private async _callAPI (path: string, params: Record<string, any> = {}) {
    // INFO: convert complex values in [params] into something readable
    // INFO: note it will remove [Buffer] and [Readable] objects
    const decomplexified = decomplexify(params)

    const query = new URLSearchParams(decomplexified).toString()
    const url = `${this.options.apiBaseUrl}${this.options.token}/${this.options.useTestDc ? 'test/' : ''}${path}?${query}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.options.apiTimeout)

    let init: RequestInit = {
      method: 'GET',
      signal: controller.signal,
      duplex: 'half'
    }

    if (this.options.agent !== undefined) {
      init.dispatcher = this.options.agent
    }

    const debug$api = $debugger.extend(path, '/')

    try {
      debug$api('HTTP ›')
      debug$api('url: %s', url.replace(this.options.token as string, '[token]'))
      debug$api('params: %j', decomplexified)

      // INFO: ---- detecting media methods ----

      // INFO: [sendMediaGroup] and [editMessageMedia] requires special logic
      if (['sendMediaGroup', 'editMessageMedia'].includes(path)) {
        const newInit = await this.uploadWithMedia(params)

        init = {
          ...init,
          ...newInit
        }
      } else {
        const mediaEntity = METHODS_WITH_MEDIA.find(entity => entity[0] === path)

        const hasMediaProperties = mediaEntity !== undefined && (
          Object.keys(params).some(value => mediaEntity[1].includes(value))
        )

        // INFO: if current [path] is a method with possible media properties
        // INFO: and we have those media properties in our [params] (not [decomplexified]!) object
        if (hasMediaProperties) {
          const newInit = await this.uploadMedia(params, mediaEntity)

          init = {
            ...init, // INFO: saving [signal] since we don't have access to it in [uploadMedia]
            ...newInit
          }
        }
      }

      const response = await fetch(url, init)
      const json = await response.json() as ApiResponseUnion

      debug$api('‹ HTTP %d', response.status)
      debug$api('response: %j', json)

      if (!json.ok) {
        throw new APIError(json)
      }

      return json.result
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Call API `method` with `params`
   * @deprecated use `telegram.api.call(...)` instead
   */
  callApi (method: string, params?: Record<string, any>) {
    return this.api.call(method, params)
  }
}

inspectable(Telegram, {
  serialize (telegram) {
    return {
      options: {
        token: telegram.options.token ? '[set]' : '[none]',
        apiBaseUrl: telegram.options.apiBaseUrl
      },

      updates: telegram.updates
    }
  }
})

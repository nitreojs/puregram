import { Agent, Dispatcher, ProxyAgent } from 'undici'

import type { TelegramResponseParameters } from '../generated'
import type { SoftString, UpdateName } from './types'

export interface TelegramOptions {
  /** Bots token */
  token?: string

  /** HTTP(s) agent, used in requests */
  agent?: Agent | ProxyAgent | Dispatcher

  /**
   * List of the update types you want your bot to receive
   *
   * @default []
   */
  allowedUpdates?: SoftString<UpdateName>[]

  /**
   * How much will library wait before retrying to get updates? In milliseconds
   *
   * @default 3000
   */
  apiWait?: number

  /**
   * URL which will be used to send requests to
   *
   * @default 'https://api.telegram.org/bot'
   */
  apiBaseUrl?: string

  /**
   * Maximum amount of library's tries to reconnect.
   *
   * Set `0` if you don't want to reconnect
   *
   * Set `-1` if you want to reconnect as many as possible times
   *
   * @default -1
   */
  apiRetryLimit?: number

  /**
   * How much will library wait for API to answer before aborting the request? In milliseconds
   *
   * @default 30000
   */
  apiTimeout?: number

  /** Request headers */
  apiHeaders?: Record<string, string>

  /**
   * Should we use test datacenter?
   * (It adds `/test` after the `/bot<token>` in the API path)
   *
   * @default false
   */
  useTestDc?: boolean

  /**
   * Are we [using a local Bot API server](https://core.telegram.org/bots/api#using-a-local-bot-api-server)?
   *
   * @default false
   */
  useLocal?: boolean

  /**
   * Should we merge events with the same `mediaGroupId` into one context with `mediaGroup` field?
   *
   * @default false
   */
  mergeMediaEvents?: boolean
}

export interface ApiResponseOk {
  ok: true
  result: object
}

export interface ApiResponseError {
  ok: false
  description: string
  error_code: number

  parameters?: TelegramResponseParameters
}

export interface StartPollingOptions {
  /** Identifier of the first update to be returned */
  offset?: number
  /** Timeout in seconds for long polling */
  timeout?: number
  /**
   * Do you want to skip updates that were created when the bot was turned off?
   *
   * If you want to skip specific updates, you need to pass a list of update types you want to skip
   */
  dropPendingUpdates?: boolean | string[]
  /** List of the update types you want your bot to receive */
  allowedUpdates?: SoftString<UpdateName>[]
}

export type ApiResponseUnion = ApiResponseOk | ApiResponseError

export interface Structure {
  toJSON(): Record<string, any>
}

import { Agent } from 'https';

export interface TelegramOptions {
  /** Bot's token */
  token?: string;

  /** HTTP(s) agent, used in requests */
  agent?: Agent;

  /**
   * List of the update types you want your bot to receive
   * 
   * @default []
   */
  allowedUpdates?: string[];

  /**
   * How much will library wait before retrying to get updates? In milliseconds
   * 
   * @default 3000
   */
  apiWait?: number;

  /**
   * URL which will be used to send requests to
   * 
   * @default 'https://api.telegram.org/bot'
   */
  apiBaseUrl?: string;

  /**
   * Maximum amount of library's tries to reconnect.
   * 
   * Set `0` if you don't want to reconnect
   * 
   * Set `-1` if you want to reconnect as many as possible times
   * 
   * @default -1
   */
  apiRetryLimit?: number;

  /**
   * How much will library wait for API to answer before aborting the request? In milliseconds
   * 
   * @default 30000
   */
  apiTimeout?: number;

  /** Request headers */
  apiHeaders?: Record<string, string>;
}

export interface ApiResponseOk {
  ok: true;

  result: object;
}

export interface ApiResponseError {
  ok: false;

  description: string;

  error_code: number;

  parameters?: any;
}

export interface StartPollingOptions {
  /** Identifier of the first update to be returned */
  offset?: number;

  /** Timeout in seconds for long polling */
  timeout?: number;
}

export type ApiResponseUnion = ApiResponseOk | ApiResponseError;

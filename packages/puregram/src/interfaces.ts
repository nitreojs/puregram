import { Agent } from 'https';

export interface TelegramOptions {
  /** Bot's token */
  token?: string;

  /** Agent, used in requests */
  agent?: Agent;

  /** List of the update types you want your bot to receive */
  allowedUpdates?: string[];

  /** URL which will be used to send requests to: `https://api.telegram.org/bot` */
  apiBaseUrl?: string;

  /** Maximum amount of library's retries */
  apiRetryLimit?: number;

  /** How much will library wait for API to answer before aborting the request? */
  apiTimeout?: number;

  /** Headers of requests */
  apiHeaders?: Record<string, string>;

  /** How much will library wait before retrying to get updates? */
  apiWait?: number;
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
  updateOffset?: number;
}

export type ApiResponseUnion = ApiResponseOk | ApiResponseError;

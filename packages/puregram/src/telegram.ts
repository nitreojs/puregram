import { inspectable } from 'inspectable';
import { AbortController } from 'abort-controller';
import { Readable } from 'stream';
import fetch, { Response } from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import createDebug from 'debug';

import { TelegramOptions, ApiResponseUnion } from './interfaces';
import { defaultOptions, mediaMethods } from './utils/constants';

import { Updates } from './updates';
import { User } from './common/structures/user';
import { APIError } from './errors';
import { ApiMethod, ApiMethodKey } from './types';
import { ApiMethods } from './api-methods';
import { isPlainObject } from './utils/helpers';

const debug = createDebug('puregram:api');

interface UploadMediaParams {
  /** URL, path, stream or buffer */
  value: string | Buffer | NodeJS.ReadableStream | Record<string, any>;

  /**
   * API method's key
   *
   * For example, `sendPhoto` method has got `photo` key,
   * `sendVideo` - `video` etc.
   */
  key: ApiMethodKey;

  /** API method */
  method: ApiMethod;

  /** Some more data to pass into form-data */
  contextData?: Record<string, any>;
}

/** Telegram class */
export class Telegram {
  public options: TelegramOptions = { ...defaultOptions };

  /** API */
  public readonly api: ApiMethods = new Proxy<ApiMethods>({} as ApiMethods, {
    get: (_target: ApiMethods, method: ApiMethod) => (
      params: Record<string, any> = {}
    ) => {
      const mediaMethod: [ApiMethod, ApiMethodKey] | undefined = mediaMethods.find(
        ([currentMediaMethod]) => (
          method === currentMediaMethod
        )
      );

      if (mediaMethod !== undefined) {
        return this.uploadMedia({
          method: mediaMethod[0],
          key: mediaMethod[1],
          value: params[mediaMethod[1]],
          contextData: params
        });
      }

      return this.callApi(method, params);
    }
  });

  /** Updates */
  public updates: Updates = new Updates(this);

  /** Bot */
  public bot!: User;

  /** Constructor */
  public constructor(options: Partial<TelegramOptions> = {}) {
    this.setOptions(options);
  }

  /** Set options */
  public setOptions(options: Partial<TelegramOptions>): this {
    Object.assign(this.options, options);

    return this;
  }

  /** Call API `method` with `params` */
  public async callApi(
    method: ApiMethod,
    params: Record<string, any> | FormData
  ): Promise<any> {
    const url: string = `${this.options.apiBaseUrl}${this.options.token}/${method}`;
    let body: string | FormData = JSON.stringify(params);

    // request
    const headers: Record<string, string> = {
      ...this.options.apiHeaders,
      'content-type': 'application/json',
    };

    if (params instanceof FormData) {
      Object.assign(headers, params.getHeaders());

      body = params;
    }

    const controller: AbortController = new AbortController();
    const timeout: NodeJS.Timeout = setTimeout(
      () => controller.abort(),
      this.options.apiTimeout!
    );

    try {
      debug(`[${method}] HTTP ->`);
      debug(`[${method}] Params: ${body}`);

      let response: Response | undefined;

      try {
        response = await fetch(url, {
          agent: this.options.agent,
          compress: false,
          method: 'POST',
          signal: controller.signal,
          headers,
          body
        });
      } catch (e) {
        debug(e);
      }

      debug(`[${method}] <- HTTP ${response?.status ?? '[not set]'}`);

      const json: ApiResponseUnion = await response!.json();

      debug(`[${method}] Request response:`);
      debug(json);

      if (json.ok) return json.result;

      throw new APIError(json);
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Upload any media via URL / Buffer / Stream / path to file */
  public uploadMedia(options: UploadMediaParams): Promise<any> {
    // options. value  is      string |      buffer | stream
    // options.   key  is     'photo' |     'audio' |     'video' | whatever
    // options.method  is 'sendPhoto' | 'sendAudio' | 'sendVideo' | whatever

    const { method, key, value } = options;
    let { contextData = {} } = options;

    let form: FormData | undefined = new FormData();
    const isPath: boolean = fs.existsSync(value.toString());

    if (value instanceof Readable || Buffer.isBuffer(value)) {
      if (value instanceof Readable) debug('value::Readable');
      else debug('value::Buffer');

      form.append(key, value, { filename: key + contextData.chat_id });
    } else if (isPath) {
      debug('value::string [path] => Readable');

      const stream: NodeJS.ReadableStream = fs.createReadStream(value as string);

      form.append(key, stream);
    } else {
      debug('value::string [URL?]');

      form = undefined;
    }

    if (form !== undefined) {
      if (key in contextData) {
        const { [key]: _, ...tempContextData } = contextData;

        contextData = tempContextData;
      }

      for (let [dataKey, dataValue] of Object.entries(contextData)) {
        if (typeof dataValue === 'boolean') dataValue = String(dataValue);
        if (dataValue.toJSON) dataValue = dataValue.toJSON();
        if (isPlainObject(dataValue)) dataValue = JSON.stringify(dataValue);

        form.append(dataKey, dataValue);
      }

      return this.callApi(method, form);
    }

    contextData[key] = value;

    return this.callApi(method, contextData);
  }
}

inspectable(Telegram, {
  serialize(telegram: Telegram) {
    return {
      options: {
        token: telegram.options.token ? '[set]' : '[none]',
        apiBaseUrl: telegram.options.apiBaseUrl
      },

      updates: telegram.updates
    };
  }
});

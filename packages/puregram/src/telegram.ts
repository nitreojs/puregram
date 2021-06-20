import { inspectable } from 'inspectable';
import { AbortController } from 'abort-controller';
import { Readable } from 'stream';
import fetch, { Response } from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import createDebug from 'debug';
import crypto from 'crypto';

import { TelegramOptions, ApiResponseUnion } from './interfaces';
import { defaultOptions, mediaMethods } from './utils/constants';

import { Updates } from './updates';
import { User } from './common/structures/user';
import { APIError } from './errors';
import { ApiMethod, MediaAttachmentType } from './types';
import { ApiMethods } from './api-methods';
import { isPlainObject } from './utils/helpers';

type AllowArray<T> = T | T[];

const debug = createDebug('puregram:api');

const isURL: RegExp = /^https?:\/\//i;

interface MediaValue {
  /** URL, path, stream or buffer */
  value: string | Buffer | NodeJS.ReadableStream | Record<string, any>;

  /**
   * API method's key
   *
   * For example, `sendPhoto` method has got `photo` key,
   * `sendVideo` - `video` etc.
   */
  key: MediaAttachmentType;
}

interface UploadMediaParams {
  /** URL, path, stream or buffer */
  values: AllowArray<MediaValue>;

  /** API method */
  method: ApiMethod;

  /** Some more data to pass into form-data */
  contextData?: Record<string, any>;
}

interface BuildFormDataResponse {
  form: FormData;
  keys: string[];
  values: MediaValue[];
}

/** Telegram class */
export class Telegram {
  public options: TelegramOptions = { ...defaultOptions };

  /** API */
  public readonly api: ApiMethods = new Proxy<ApiMethods>({} as ApiMethods, {
    get: (_target: ApiMethods, method: ApiMethod) => (
      params: Record<string, any> = {}
    ) => {
      const mediaMethod: [ApiMethod, AllowArray<MediaAttachmentType>] | undefined = mediaMethods.find(
        ([currentMediaMethod]) => (
          method === currentMediaMethod
        )
      );

      if (mediaMethod !== undefined) {
        let values: MediaValue[] = [];
        let value: any;

        if (Array.isArray(mediaMethod[1])) {
          value = mediaMethod[1].find((value) => params[value] !== undefined);
          // TODO: handle every value, not just determine which one is in use
        } else {
          value = params[mediaMethod[1]];
        }

        const mediaMethodKey: MediaAttachmentType = (mediaMethod[1] as MediaAttachmentType);

        if (Array.isArray(value)) {
          // [ { type: 'photo', media: './photo.png', ... } ]
          values = value.map(
            (element: { type: MediaValue['key'], media: MediaValue['value'] }) => {
              const { type, media, ...other } = element;

              return { key: type, value: media, ...other };
            }
          );
        } else if (typeof value === 'string') {
          // './photo.png'
          values = [{ key: mediaMethodKey, value, ...params }];
        } else if (value instanceof Readable || Buffer.isBuffer(value)) {
          // Readable | Buffer
          const { [mediaMethodKey]: _, ...other } = params;
          
          values = [{ key: mediaMethodKey, value, ...other }];
        } else if (isPlainObject(value)) {
          // { type: 'photo', media: './photo.png', ... }
          const { type, media, ...other } = value;

          values = [{ key: type, value: media, ...other }];
        }

        return this.uploadMedia({
          method: mediaMethod[0],
          values,
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
    const body: string | FormData = params instanceof FormData ? params : JSON.stringify(params);

    // request
    const headers: Record<string, string> = {
      ...this.options.apiHeaders,
      'content-type': 'application/json',
    };

    if (params instanceof FormData) {
      Object.assign(headers, params.getHeaders());
    }

    const controller: AbortController = new AbortController();
    const timeout: NodeJS.Timeout = setTimeout(
      () => controller.abort(),
      this.options.apiTimeout!
    );

    try {
      debug(`[${method}] HTTP ->`);
      debug(`[${method}] Params: ${body}`);

      const response: Response = await fetch(url, {
        agent: this.options.agent,
        compress: false,
        method: 'POST',
        signal: controller.signal,
        headers,
        body
      });

      debug(`[${method}] <- HTTP ${response?.status ?? '[not set]'}`);

      if (response !== undefined) {
        const json: ApiResponseUnion = await response!.json();

        debug(`[${method}] Request response:`);
        debug(json);
  
        if (json.ok) return json.result;
  
        throw new APIError(json);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  private async buildFormData(options: UploadMediaParams): Promise<BuildFormDataResponse> {
    let { values, contextData = {}, method } = options;

    if (!Array.isArray(values)) {
      values = [values];
    }

    const form: FormData = new FormData();
    const keys: string[] = [];

    const tasks: Promise<void>[] = values.map(
      async (media: MediaValue, index: number) => {
        const { value, key } = media;

        let formValue: any;

        const isPath: boolean = typeof value === 'string' && fs.existsSync(value.toString());
        const attachmentId: string = crypto.randomBytes(8).toString('hex');
        const formKey: string = `${key}:${attachmentId}`;

        if (isPath) {
          // string, path
          formValue = fs.createReadStream(value as string);

          debug(`[${method}] FormData: ${formKey}=${formValue}`);

          form.append(formKey, formValue);
          keys.push(formKey);
        } else if (value instanceof Readable || Buffer.isBuffer(value)) {
          // Readable | Buffer
          formValue = value;

          debug(`[${method}] FormData: ${formKey}=${JSON.stringify(formValue)}`);

          form.append(formKey, formValue, {
            filename: contextData.filename ?? `${key}${index}_${contextData.chat_id}`
          });
          
          keys.push(formKey);
        } else {
          // string, URL | fileId
          formValue = value;

          const isUrl: boolean = isURL.test(value as string);

          debug(`[${method}] FormData: ${key}=${formValue}`);

          form.append(key, formValue);

          if (method === 'sendMediaGroup') {
            keys.push(formKey);
          } else {
            keys.push(`${isUrl ? 'url' : 'fileId'}:${value as string}`);
          }
        }
      }
    );

    await Promise.all(tasks);

    return { form, keys, values };
  }

  /** Upload any media via URL / Buffer / Stream / path to file */
  public async uploadMedia(options: UploadMediaParams): Promise<any> {
    // options. values is     (string |      buffer | stream)[]
    // options.   key  is     'photo' |     'audio' |     'video' | whatever
    // options.method  is 'sendPhoto' | 'sendAudio' | 'sendVideo' | whatever

    const { method } = options;
    let { contextData = {} } = options;

    const { form, keys, values }: BuildFormDataResponse = await this.buildFormData(options);
    const key: string | undefined = keys[0];

    if (values.length === 0 || values === undefined) {
      throw new Error('Expected `uploadMedia` to contain at least one value');
    }

    if (method === 'sendMediaGroup' || method === 'editMessageMedia') {
      let mediaValue: AllowArray<Record<string, any>> = keys.map(
        (key: string, index: number) => {
          const { key: elementKey, value: elementValue, ...valueContext }: MediaValue = values[index];
          const [keyType]: string[] = key.split(':');

          const isUrl: boolean = keyType === 'url';
          const isFileId: boolean = keyType === 'fileId';

          return {
            type: (isUrl || isFileId) ? elementKey : keyType,
            media: (isUrl || isFileId) ? elementValue : `attach://${key}`,
            ...valueContext
          };
        }
      );

      if (method === 'editMessageMedia') mediaValue = (mediaValue as Record<string, any>[])[0];

      form.append('media', JSON.stringify(mediaValue));
    } else if (key !== undefined) {
      form.append(key.split(':')[0], `attach://${key}`);
    }

    // hack: remove 'media' key from `contextData`
    let { media: _, ...tempContextData } = contextData;

    for (const tempValue of values) {
      if (tempValue.key in tempContextData) {
        const { [tempValue.key]: _, ...tempContextData } = contextData;
  
        contextData = tempContextData;
      }
    }

    contextData = tempContextData;

    for (let [dataKey, dataValue] of Object.entries(contextData)) {
      if (Array.isArray(dataValue)) dataValue = dataValue.join(',');             // [1, 2, 3] -> '1,2,3'
      if (typeof dataValue === 'boolean') dataValue = String(dataValue);         // true -> 'true'
      if ('toJSON' in dataValue) dataValue = JSON.stringify(dataValue.toJSON()); // SomeClass { test: true } -> '{"test":true}'
      if (isPlainObject(dataValue)) dataValue = JSON.stringify(dataValue);       // { foo: 'bar' } -> '{"foo":"bar"}'

      form.append(dataKey, dataValue);
    }

    return this.callApi(method, form);
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

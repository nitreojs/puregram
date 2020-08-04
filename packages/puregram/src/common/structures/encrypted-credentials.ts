import { inspectable } from 'inspectable';

import { TelegramEncryptedCredentials } from '../../interfaces';

/**
 * Contains data required for decrypting and authenticatin
 * `EncryptedPassportElement`. See the Telegram Passport Documentation for a
 * complete description of the data decryption and authentication processes.
 */
export class EncryptedCredentials {
  private payload: TelegramEncryptedCredentials;

  constructor(payload: TelegramEncryptedCredentials) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /**
   * Base64-encoded encrypted JSON-serialized data with unique user's payload,
   * data hashes and secrets required for `EncryptedPassportElement` decryption
   * and authentication
   */
  public get data(): string {
    return this.payload.data;
  }

  /** Base64-encoded data hash for data authentication */
  public get hash(): string {
    return this.payload.hash;
  }

  /**
   * Base64-encoded secret, encrypted with the bot's public RSA key, required
   * for data decryption
   */
  public get secret(): string {
    return this.payload.secret;
  }
}

inspectable(EncryptedCredentials, {
  serialize(credentials: EncryptedCredentials) {
    return {
      data: credentials.data,
      hash: credentials.hash,
      secret: credentials.secret
    };
  }
});

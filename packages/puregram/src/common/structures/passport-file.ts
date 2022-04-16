import { inspectable } from 'inspectable'

import { TelegramPassportFile } from '../../telegram-interfaces'

/**
 * This object represents a file uploaded to Telegram Passport.
 * Currently all Telegram Passport files are in JPEG format when decrypted and
 * don't exceed 10MB.
 */
export class PassportFile {
  constructor(private payload: TelegramPassportFile) { }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /**
   * Identifier for this file, which can be used to download or reuse the file
   */
  public get fileId(): string {
    return this.payload.file_id
  }

  /**
   * Unique identifier for this file, which is supposed to be the same over
   * time and for different bots. Can't be used to download or reuse the file.
   */
  public get fileUniqueId(): string {
    return this.payload.file_unique_id
  }

  /** File size */
  public get fileSize(): number {
    return this.payload.file_size
  }

  /** Unix time when the file was uploaded */
  public get fileDate(): number {
    return this.payload.file_date
  }
}

inspectable(PassportFile, {
  serialize(passport: PassportFile) {
    return {
      fileId: passport.fileId,
      fileUniqueId: passport.fileUniqueId,
      fileSize: passport.fileSize,
      fileDate: passport.fileDate
    }
  }
})

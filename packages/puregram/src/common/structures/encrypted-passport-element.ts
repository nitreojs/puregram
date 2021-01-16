import { inspectable } from 'inspectable';

import { PassportFile } from './passport-file';

import {
  TelegramEncryptedPassportElementUnion,
  TelegramEncryptedPassportElementPersonalDetails,
  TelegramEncryptedPassportElementPassport,
  TelegramEncryptedPassportElementDriverLicense,
  TelegramEncryptedPassportElementIdentityCard,
  TelegramEncryptedPassportElementInternalPassport,
  TelegramEncryptedPassportElementAddress,
  TelegramEncryptedPassportElementPhoneNumber,
  TelegramEncryptedPassportElementEmail,
  TelegramEncryptedPassportElementUtilityBill,
  TelegramEncryptedPassportElementBankStatement,
  TelegramEncryptedPassportElementRentalAgreement,
  TelegramEncryptedPassportElementPassportRegistration,
  TelegramEncryptedPassportElementTemporaryRegistration,
  TelegramPassportFile
} from '../../interfaces';

import { EncryptedPassportElementType } from '../../types';
import { filterPayload } from '../../utils/helpers';

/**
 * Contains information about documents or other Telegram Passport elements
 * shared with the bot by the user.
 */
export class EncryptedPassportElement {
  private payload: TelegramEncryptedPassportElementUnion;

  constructor(payload: TelegramEncryptedPassportElementUnion) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /**
   * Element type. One of `personal_details`, `passport`, `driver_license`,
   * `identity_card`, `internal_passport`, `address`, `utility_bill`,
   * `bank_statement`, `rental_agreement`, `passport_registration`,
   * `temporary_registration`, `phone_number`, `email`.
   */
  public get type(): EncryptedPassportElementType {
    return this.payload.type;
  }

  /**
   * Base64-encoded encrypted Telegram Passport element data provided by th
   * user, available for `personal_details`, `passport`, `driver_license`,
   * `identity_card`, `internal_passport` and `address` types.
   * Can be decrypted and verified using the accompanying
   * `EncryptedCredentials`.
   */
  public get data(): string | undefined {
    return (this.payload as (
      TelegramEncryptedPassportElementPersonalDetails
      | TelegramEncryptedPassportElementPassport
      | TelegramEncryptedPassportElementDriverLicense
      | TelegramEncryptedPassportElementIdentityCard
      | TelegramEncryptedPassportElementInternalPassport
      | TelegramEncryptedPassportElementAddress
    )).data;
  }

  /** User's verified phone number, available only for `phone_number` type */
  public get phoneNumber(): string | undefined {
    return (this.payload as TelegramEncryptedPassportElementPhoneNumber).phone_number;
  }

  /** User's verified email address, available only for `email` type */
  public get email(): string | undefined {
    return (this.payload as TelegramEncryptedPassportElementEmail).email;
  }

  /**
   * Array of encrypted files with documents provided by the user, available
   * for `utility_bill`, `bank_statement`, `rental_agreement`,
   * `passport_registration` and `temporary_registration` types. Files can be
   * decrypted and verified using the accompanying `EncryptedCredentials`.
   */
  public get files(): PassportFile[] {
    const { files } = this.payload as (
      TelegramEncryptedPassportElementUtilityBill
      | TelegramEncryptedPassportElementBankStatement
      | TelegramEncryptedPassportElementRentalAgreement
      | TelegramEncryptedPassportElementPassportRegistration
      | TelegramEncryptedPassportElementTemporaryRegistration
    );

    if (!files) return [];

    return files.map(
      (file: TelegramPassportFile) => new PassportFile(file)
    );
  }

  /**
   * Encrypted file with the front side of the document, provided by the user.
   * Available for `passport`, `driver_license`, `identity_card` and
   * `internal_passport`. The file can be decrypted and verified using the
   * accompanying `EncryptedCredentials`.
   */
  public get frontSide(): PassportFile | undefined {
    const { front_side } = this.payload as (
      TelegramEncryptedPassportElementPassport
      | TelegramEncryptedPassportElementDriverLicense
      | TelegramEncryptedPassportElementIdentityCard
      | TelegramEncryptedPassportElementInternalPassport
    );

    if (!front_side) return undefined;

    return new PassportFile(front_side);
  }

  /**
   * Encrypted file with the reverse side of the document, provided by the
   * user. Available for `driver_license` and `identity_card`. The file can be
   * decrypted and verified using the accompanying `EncryptedCredentials`.
   */
  public get reverseSide(): PassportFile | undefined {
    const { reverse_side } = this.payload as (
      TelegramEncryptedPassportElementDriverLicense
      | TelegramEncryptedPassportElementIdentityCard
    );

    if (!reverse_side) return undefined;

    return new PassportFile(reverse_side);
  }

  /**
   * Encrypted file with the selfie of the user holding a document, provided by
   * the user; available for `passport`, `driver_license`, `identity_card` and
   * `internal_passport`. The file can be decrypted and verified using the
   * accompanying `EncryptedCredentials`.
   */
  public get selfie(): PassportFile | undefined {
    const { selfie } = this.payload as (
      TelegramEncryptedPassportElementPassport
      | TelegramEncryptedPassportElementDriverLicense
      | TelegramEncryptedPassportElementIdentityCard
      | TelegramEncryptedPassportElementInternalPassport
    );

    if (!selfie) return undefined;

    return new PassportFile(selfie);
  }

  /**
   * Array of encrypted files with translated versions of documents provided by
   * the user. Available if requested for `passport`, `driver_license`,
   * `identity_card`, `internal_passport`, `utility_bill`, `bank_statement`,
   * `rental_agreement`, `passport_registration` and `temporary_registration`
   * types. Files can be decrypted and verified using the accompanying
   * `EncryptedCredentials`.
   */
  public get translation(): PassportFile[] {
    const { translation } = this.payload as (
      TelegramEncryptedPassportElementPassport
      | TelegramEncryptedPassportElementDriverLicense
      | TelegramEncryptedPassportElementIdentityCard
      | TelegramEncryptedPassportElementInternalPassport
      | TelegramEncryptedPassportElementUtilityBill
      | TelegramEncryptedPassportElementBankStatement
      | TelegramEncryptedPassportElementRentalAgreement
      | TelegramEncryptedPassportElementPassportRegistration
      | TelegramEncryptedPassportElementTemporaryRegistration
    );

    if (!translation) return [];

    return translation.map(
      (element: TelegramPassportFile) => new PassportFile(element)
    );
  }

  /**
   * Base64-encoded element hash for using in `PassportElementErrorUnspecified`
   */
  public get hash(): string {
    return this.payload.hash;
  }
}

inspectable(EncryptedPassportElement, {
  serialize(element: EncryptedPassportElement) {
    const payload = {
      type: element.type,
      data: element.data,
      phoneNumber: element.phoneNumber,
      email: element.email,
      files: element.files,
      frontSide: element.frontSide,
      reverseSide: element.reverseSide,
      selfie: element.selfie,
      translation: element.translation,
      hash: element.hash
    };

    return filterPayload(payload);
  }
});

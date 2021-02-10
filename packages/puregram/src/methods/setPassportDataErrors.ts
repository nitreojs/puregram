import { PassportElementErrorUnion } from '../interfaces';

export interface SetPassportDataErrorsParams {
  /**
   * User identifier
   */
  user_id: number;

  /**
   * A JSON-serialized array describing the errors
   */
  errors: PassportElementErrorUnion[];

  [key: string]: any;
}

/**
 * Informs a user that some of the Telegram Passport elements they provided
 * contains errors. The user will not be able to re-submit their Passport
 * to you until the errors are fixed (the contents of the field for which
 * you returned the error must change).
 *
 * Returns `true` on success.
 */
export type setPassportDataErrors = (params: SetPassportDataErrorsParams) => Promise<true>;

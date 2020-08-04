import { ErrorOptions, TelegramError } from './telegram';

export class APIError extends TelegramError {
  public constructor(params: ErrorOptions) {
    super(params);
  }
}

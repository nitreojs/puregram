import { TelegramError } from './telegram'

import type { ApiResponseError } from '../types/interfaces'

export class APIError extends TelegramError {
  parameters: ApiResponseError['parameters']

  constructor (params: ApiResponseError) {
    super({
      error_code: params.error_code,
      description: params.description
    })

    if (params.parameters) {
      this.parameters = params.parameters
    }
  }
}

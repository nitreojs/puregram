import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

export class WriteAccessAllowed implements Structure {
  constructor (private payload: Interfaces.TelegramWriteAccessAllowed) { }

  toJSON(): Interfaces.TelegramWriteAccessAllowed {
    return { }
  }
}

inspectable(WriteAccessAllowed, {
  serialize (struct) {
    return { }
  }
})

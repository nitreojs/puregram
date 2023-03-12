import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

export class WriteAccessAllowed implements Structure {
  constructor (public payload: Interfaces.TelegramWriteAccessAllowed) { }

  toJSON () {
    return this.payload
  }
}

inspectable(WriteAccessAllowed, {
  serialize (struct) {
    return { }
  }
})

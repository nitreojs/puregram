import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

export class GeneralForumTopicUnhidden implements Structure {
  constructor (public payload: Interfaces.TelegramGeneralForumTopicUnhidden) { }

  toJSON (): Interfaces.TelegramGeneralForumTopicUnhidden {
    return { }
  }
}

inspectable(GeneralForumTopicUnhidden, {
  serialize (struct) {
    return { }
  }
})

import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about General forum topic hidden in the chat. Currently holds no information. */
export class GeneralForumTopicHidden implements Structure {
  constructor (public payload: Interfaces.TelegramGeneralForumTopicHidden) { }

  toJSON (): Interfaces.TelegramGeneralForumTopicHidden {
    return { }
  }
}

inspectable(GeneralForumTopicHidden, {
  serialize (struct) {
    return { }
  }
})

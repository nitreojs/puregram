import { Inspectable, inspectable } from 'inspectable'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { applyMixins } from '../utils/helpers'
import { Context } from './context'
import { CloneMixin } from './mixins'
import { GiveawayCreated } from '../common/structures/giveaway-created'

interface GiveawayCreatedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramGiveawayCreated
  updateId: number
}

/** This object represents a service message about the creation of a scheduled giveaway. Currently holds no information. */
@Inspectable()
class GiveawayCreatedContext extends Context {
  payload: Interfaces.TelegramGiveawayCreated

  constructor (options: GiveawayCreatedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'giveaway_created',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

interface GiveawayCreatedContext extends Constructor<GiveawayCreatedContext>, GiveawayCreated, CloneMixin<GiveawayCreatedContext, GiveawayCreatedContextOptions> {}
applyMixins(GiveawayCreatedContext, [GiveawayCreated, CloneMixin])

export { GiveawayCreatedContext }

inspectable(GiveawayCreatedContext, {
  serialize (context: GiveawayCreatedContext) {
    return {}
  }
})

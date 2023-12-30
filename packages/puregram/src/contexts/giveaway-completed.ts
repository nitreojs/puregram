import { Inspectable } from 'inspectable'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor, Require } from '../types/types'
import { applyMixins } from '../utils/helpers'
import { Context } from './context'
import { CloneMixin } from './mixins'
import { GiveawayCompleted } from '../common'

interface GiveawayCompletedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramGiveawayCompleted
  updateId: number
}

/** This object represents a service message about the creation of a scheduled giveaway. Currently holds no information. */
@Inspectable()
class GiveawayCompletedContext extends Context {
  payload: Interfaces.TelegramGiveawayCompleted

  constructor (options: GiveawayCompletedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'giveaway_completed',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Checks if context has `unclaimedPrizeCount` property */
  hasUnclaimedPrizeCount (): this is Require<this, 'unclaimedPrizeCount'> {
    return this.payload.unclaimed_prize_count !== undefined
  }

  /** Checks if context has `message` property */
  hasMessage (): this is Require<this, 'message'> {
    return this.payload.giveaway_message !== undefined
  }
}

interface GiveawayCompletedContext extends Constructor<GiveawayCompletedContext>, GiveawayCompleted, CloneMixin<GiveawayCompletedContext, GiveawayCompletedContextOptions> {}
applyMixins(GiveawayCompletedContext, [GiveawayCompleted, CloneMixin])

export { GiveawayCompletedContext }

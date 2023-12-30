import { Inspectable } from 'inspectable'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor, Require } from '../types/types'
import { applyMixins } from '../utils/helpers'
import { Context } from './context'
import { CloneMixin } from './mixins'
import { GiveawayWinners } from '../common/structures/giveaway-winners'

interface GiveawayWinnersContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramGiveawayWinners
  updateId: number
}

/** This object represents a message about the completion of a giveaway with public winners. */
@Inspectable()
class GiveawayWinnersContext extends Context {
  payload: Interfaces.TelegramGiveawayWinners

  constructor (options: GiveawayWinnersContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'giveaway_winners',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Checks if context has `additionalChatCount` property */
  hasAdditionalChatCount (): this is Require<this, 'additionalChatCount'> {
    return this.payload.additional_chat_count !== undefined
  }

  /** Checks if context has `premiumSubscriptionMonthCount` property */
  hasPremiumSubscriptionMonthCount (): this is Require<this, 'premiumSubscriptionMonthCount'> {
    return this.payload.premium_subscription_month_count !== undefined
  }

  /** Checks if context has `unclaimedPrizeCount` property */
  hasUnclaimedPrizeCount (): this is Require<this, 'unclaimedPrizeCount'> {
    return this.payload.unclaimed_prize_count !== undefined
  }

  /** Checks if context has `prizeDescription` property */
  hasPrizeDescription (): this is Require<this, 'prizeDescription'> {
    return this.payload.prize_description !== undefined
  }
}

interface GiveawayWinnersContext extends Constructor<GiveawayWinnersContext>, GiveawayWinners, CloneMixin<GiveawayWinnersContext, GiveawayWinnersContextOptions> {}
applyMixins(GiveawayWinnersContext, [GiveawayWinners, CloneMixin])

export { GiveawayWinnersContext }

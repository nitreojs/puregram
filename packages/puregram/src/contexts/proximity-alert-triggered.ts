import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { ProximityAlertTriggered } from '../common/structures'

import { Telegram } from '../telegram'
import { Message } from '../updates/'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface ProximityAlertTriggeredContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class ProximityAlertTriggeredContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: ProximityAlertTriggeredContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'proximity_alert_triggered',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /**
   * Service message.
   * A user in the chat triggered another user's proximity alert
   * while sharing Live Location.
   */
  get proximityAlert() {
    return new ProximityAlertTriggered(this.payload.proximity_alert_triggered!)
  }
}

interface ProximityAlertTriggeredContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(ProximityAlertTriggeredContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(ProximityAlertTriggeredContext, {
  serialize(context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      proximityAlert: context.proximityAlert
    }
  }
})

export { ProximityAlertTriggeredContext }

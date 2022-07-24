import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { Location } from '../common/structures'

import { Telegram } from '../telegram'
import { Message } from '../updates/'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin } from './mixins'

interface LocationContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class LocationContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: LocationContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'left_chat_member',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Location */
  get eventLocation () {
    return new Location(this.payload.location as Interfaces.TelegramLocation)
  }
}

interface LocationContext extends Constructor<LocationContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<LocationContext, LocationContextOptions> { }
applyMixins(LocationContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(LocationContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventLocation: context.eventLocation
    }
  }
})

export { LocationContext }

import { inspectable } from 'inspectable'
import { PassportData, Message } from '../common/structures'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { applyMixins, memoizeGetters } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, ChatActionMixin, TargetMixin, CloneMixin, PinsMixin } from './mixins'

interface PassportDataContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class PassportDataContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: PassportDataContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'passport_data',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Telegram Passport data */
  get passportData () {
    return new PassportData(this.payload.passport_data as Interfaces.TelegramPassportData)
  }
}

interface PassportDataContext extends Constructor<PassportDataContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin<PassportDataContext, PassportDataContextOptions> { }
applyMixins(PassportDataContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin])
memoizeGetters(PassportDataContext, ['passportData'])

inspectable(PassportDataContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      passportData: context.passportData
    }
  }
})

export { PassportDataContext }

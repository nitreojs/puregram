import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Message } from '../updates/'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface WebAppDataContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class WebAppDataContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: WebAppDataContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'web_app_data',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** The data. Be aware that a bad client can send arbitrary data in this field. */
  get data() {
    return this.payload.web_app_data!.data
  }

  /**
   * Text of the `web_app` keyboard button, from which the Web App was opened.
   * Be aware that a bad client can send arbitrary data in this field.
   */
  get buttonText() {
    return this.payload.web_app_data!.button_text
  }
}

interface WebAppDataContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(WebAppDataContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(WebAppDataContext, {
  serialize(context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      data: context.data,
      buttonText: context.buttonText
    }
  }
})

export { WebAppDataContext }

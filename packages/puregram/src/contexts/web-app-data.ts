import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'
import { Message } from '../common/structures'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin } from './mixins'

interface WebAppDataContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class WebAppDataContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: WebAppDataContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'web_app_data',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** The data. Be aware that a bad client can send arbitrary data in this field. */
  get data () {
    const webAppData = this.payload.web_app_data as Interfaces.TelegramWebAppData

    return webAppData.data
  }

  /**
   * Text of the `web_app` keyboard button, from which the Web App was opened.
   * Be aware that a bad client can send arbitrary data in this field.
   */
  get buttonText () {
    const webAppData = this.payload.web_app_data as Interfaces.TelegramWebAppData

    return webAppData.button_text
  }
}

interface WebAppDataContext extends Constructor<WebAppDataContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<WebAppDataContext, WebAppDataContextOptions> { }
applyMixins(WebAppDataContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(WebAppDataContext, {
  serialize (context) {
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

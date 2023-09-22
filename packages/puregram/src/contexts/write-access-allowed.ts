import { Message, WriteAccessAllowed } from '../common/structures'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { inspectable } from 'inspectable'
import { CloneMixin, NodeMixin, SendMixin, TargetMixin } from './mixins'

interface WriteAccessAllowedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class WriteAccessAllowedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: WriteAccessAllowedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'write_access_allowed',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Service message: user allows a bot to write messages after adding it to the attachment menu */
  get eventAllowance () {
    return new WriteAccessAllowed(this.payload.write_access_allowed as Interfaces.TelegramWriteAccessAllowed)
  }
}

interface WriteAccessAllowedContext extends Constructor<WriteAccessAllowedContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<WriteAccessAllowedContext, WriteAccessAllowedContextOptions> { }
applyMixins(WriteAccessAllowedContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(WriteAccessAllowedContext, {
  serialize (context) {
    return {
      fromRequest: context.eventAllowance.fromRequest,
      webAppName: context.eventAllowance.webAppName,
      fromAttachmentMenu: context.eventAllowance.fromAttachmentMenu
    }
  }
})

export { WriteAccessAllowedContext }

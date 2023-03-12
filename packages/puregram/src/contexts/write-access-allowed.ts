import { Message } from '../common/structures'
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
}

interface WriteAccessAllowedContext extends Constructor<WriteAccessAllowedContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<WriteAccessAllowedContext, WriteAccessAllowedContextOptions> { }
applyMixins(WriteAccessAllowedContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(WriteAccessAllowedContext, {
  serialize (context) {
    return {}
  }
})

export { WriteAccessAllowedContext }

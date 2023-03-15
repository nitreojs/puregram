import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** Force reply keyboard */
@Inspectable()
export class ForceReply {
  @Inspect({ as: 'selective', nullable: false })
  private isSelective = false

  @Inspect({ as: 'input_field_placeholder', nullable: false })
  private placeholder?: string

  /** Use this parameter if you want to show the keyboard to specific users only */
  selective (selective = true) {
    this.isSelective = selective

    return this
  }

  /** The placeholder to be shown in the input field when the keyboard is active */
  setPlaceholder (placeholder: string) {
    this.placeholder = placeholder

    return this
  }

  /** Returns JSON which is compatible with Telegram's `ForceReply` interface */
  toJSON (): Interfaces.TelegramForceReply {
    return {
      force_reply: true,
      input_field_placeholder: this.placeholder,
      selective: this.isSelective
    }
  }

  toString () {
    return JSON.stringify(this)
  }
}

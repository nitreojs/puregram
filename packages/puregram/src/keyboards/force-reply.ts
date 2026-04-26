import type * as Interfaces from '@puregram/api'

/** Force reply keyboard */
export class ForceReply {
  private isSelective = false
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
  toJSON () {
    const json: Interfaces.TelegramForceReply = {
      force_reply: true,
      selective: this.isSelective
    }

    if (this.placeholder !== undefined) {
      json.input_field_placeholder = this.placeholder
    }

    return json
  }

  toString () {
    return JSON.stringify(this)
  }
}

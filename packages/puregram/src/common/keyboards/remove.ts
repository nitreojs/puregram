import { Inspect, Inspectable } from 'inspectable'

interface RemoveKeyboardJSON {
  remove_keyboard: true
  selective: boolean
}

/** Remove keyboard */
@Inspectable()
export class RemoveKeyboard {
  // TODO: remove_keyboard: true
  @Inspect({ as: 'selective' })
  private isSelective = false

  /** Use this parameter if you want to show the keyboard to specific users only */
  selective (selective = true) {
    this.isSelective = selective

    return this
  }

  /** Returns JSON which is compatible with Telegram's `RemoveKeyboard` interface */
  toJSON (): RemoveKeyboardJSON {
    return {
      remove_keyboard: true,
      selective: this.isSelective
    }
  }

  toString () {
    return JSON.stringify(this)
  }
}

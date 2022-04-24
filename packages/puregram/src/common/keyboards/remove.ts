import { inspectable } from 'inspectable'

interface RemoveKeyboardJSON {
  remove_keyboard: true
  selective: boolean
}

/** Remove keyboard */
export class RemoveKeyboard {
  private isSelective: boolean = false

  /** Use this parameter if you want to show the keyboard to specific users only */
  selective(selective: boolean = true) {
    this.isSelective = selective

    return this
  }

  toJSON(): RemoveKeyboardJSON {
    return {
      remove_keyboard: true,
      selective: this.isSelective
    }
  }

  toString() {
    return JSON.stringify(this)
  }
}

inspectable(RemoveKeyboard, {
  serialize(keyboard: RemoveKeyboard) {
    return keyboard.toJSON()
  }
})

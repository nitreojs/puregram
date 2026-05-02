/** remove keyboard */
export class RemoveKeyboard {
  private isSelective = false

  /** use this parameter if you want to show the keyboard to specific users only */
  selective (selective = true) {
    this.isSelective = selective

    return this
  }

  /** returns JSON which is compatible with Telegram's `RemoveKeyboard` interface */
  toJSON () {
    return {
      remove_keyboard: true as const,
      selective: this.isSelective
    }
  }

  toString () {
    return JSON.stringify(this)
  }
}

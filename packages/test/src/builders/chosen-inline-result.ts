import type { TestUser } from '../actors/user'

export class ChosenInlineResultBuilder {
  private _from: TestUser | undefined
  private _resultId = ''
  private _query = ''
  private _inlineMessageId: string | undefined

  from (user: TestUser) {
    this._from = user

    return this
  }

  resultId (id: string) {
    this._resultId = id

    return this
  }

  query (q: string) {
    this._query = q

    return this
  }

  inlineMessageId (id: string) {
    this._inlineMessageId = id

    return this
  }

  toUpdate () {
    if (this._from === undefined) {
      throw new Error('ChosenInlineResultBuilder: from is required')
    }

    const inner: Record<string, unknown> = {
      result_id: this._resultId,
      from: this._from.toRaw(),
      query: this._query
    }

    if (this._inlineMessageId !== undefined) {
      inner.inline_message_id = this._inlineMessageId
    }

    return { chosen_inline_result: inner }
  }
}

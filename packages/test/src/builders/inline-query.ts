import type { TestUser } from '../actors/user'

let nextId = 0

function allocateId () {
  nextId += 1

  return 'iq_' + nextId
}

export class InlineQueryBuilder {
  private _id: string | undefined
  private _from: TestUser | undefined
  private _query = ''
  private _offset = ''

  id (id: string) {
    this._id = id

    return this
  }

  from (user: TestUser) {
    this._from = user

    return this
  }

  query (q: string) {
    this._query = q

    return this
  }

  offset (off: string) {
    this._offset = off

    return this
  }

  toUpdate () {
    if (this._from === undefined) {
      throw new Error('InlineQueryBuilder: from is required')
    }

    return {
      inline_query: {
        id: this._id ?? allocateId(),
        from: this._from.toRaw(),
        query: this._query,
        offset: this._offset
      }
    }
  }
}

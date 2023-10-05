import ts from 'typescript'

import { getText } from './utils'

import { Type } from './type'

export class Field {
  constructor (public signature: ts.PropertySignature) {}

  get name () {
    return getText(this.signature.name)
  }

  get type () {
    return new Type(this.signature.type!)
  }

  isOptional () {
    return this.signature.questionToken !== undefined
  }

  hasComment () {
    return this.comment !== ''
  }

  get comment () {
    // @ts-expect-error where the fuck are `jsDoc`s located at?!
    let comment: string = this.signature.jsDoc.map(d => d.comment).join('\n')

    if (this.isOptional() || comment.startsWith('*Optional*')) {
      comment = comment.slice('*Optional*. '.length)
    }

    return comment
  }

  hasVerb () {
    return /^(?:can|has|is)/.test(this.name)
  }
}

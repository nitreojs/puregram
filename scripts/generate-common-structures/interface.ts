import ts from 'typescript'

import { getText } from './utils'

import { Field } from './field'

export class Interface {
  constructor (public declaration: ts.InterfaceDeclaration) {}

  get name () {
    return getText(this.declaration.name)
  }

  get fields () {
    return this.declaration.members
      .filter(ts.isPropertySignature)
      .map(s => new Field(s))
  }

  get (field: string) {
    return this.declaration.members
      .find(m => getText(m.name!) === field)!
  }

  hasComment () {
    return this.comment !== ''
  }

  get comment () {
    // @ts-expect-error where the fuck are `jsDoc`s located at?!
    const comment: string = this.declaration.jsDoc.map(d => d.comment).join('\n')

    return comment
  }
}

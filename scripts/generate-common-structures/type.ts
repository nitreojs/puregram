import ts from 'typescript'

import { typeNodeToString } from './utils'

export class Type {
  constructor (public node: ts.TypeNode) {}

  get value () {
    return this.node
  }

  isArray () {
    return this.node.kind === ts.SyntaxKind.ArrayType
  }

  isTuple () {
    return this.node.kind === ts.SyntaxKind.TupleType
  }

  isTypeReference () {
    return this.node.kind === ts.SyntaxKind.TypeReference
  }

  toString () {
    return typeNodeToString(this.value)
  }
}

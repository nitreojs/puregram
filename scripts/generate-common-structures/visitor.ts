import ts from 'typescript'

import { getText, syntaxToKind } from './utils'

import { Interface } from './interface'
import { Variables } from './variables'

import { IGNORED_TYPES } from './constants'

// let me be clear: i've never written a visitor-based pattern code so i dont even know if this is a correct way to do it
// at least it looks funny
export class Visitor {
  static visit (node: ts.Node) {
    if (ts.isTypeAliasDeclaration(node)) {
      return Visitor.visitTypeAliasDeclaration(node)
    }

    if (ts.isInterfaceDeclaration(node)) {
      return Visitor.visitInterfaceDeclaration(node)
    }

    // INFO: visiting is over
    if (node.kind === ts.SyntaxKind.EndOfFileToken) {
      // INFO: filtering from type-only interfaces
      for (const name of Variables.innerReferenceNames) {
        Variables.interfaces.splice(Variables.interfaces.findIndex(i => i.name === name), 1)
      }

      // console.log(Variables.interfaces[0].comment)
    }
  }

  // INFO: after thinking for about two hours about whether there should be some logic behind it
  //       i said "fuck it" and just pushed to `Variables.interfaces`
  static visitInterfaceDeclaration (node: ts.InterfaceDeclaration) {
    Variables.interfaces.push(new Interface(node))
  }

  static visitTypeAliasDeclaration (node: ts.TypeAliasDeclaration) {
    const name = getText(node.name)

    if (IGNORED_TYPES.includes(name)) {
      return
    }

    if (ts.isUnionTypeNode(node.type)) {
      const union = node.type
      const valueKinds = union.types.map(t => syntaxToKind(t.kind))

      // INFO: ignoring simple string unions
      if (valueKinds.every(k => k === 'LiteralType')) {
        return
      }

      for (const type of union.types) {
        if (ts.isTypeReferenceNode(type)) {
          const typeName = getText(type.typeName)

          Variables.innerReferenceNames.push(typeName)
        }
      }
    }
  }
}

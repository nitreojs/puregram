'use strict'

// custom local eslint rules. plugged in via eslint-plugin-local-rules.
// see .eslintrc.json -> plugins: ['local-rules'] and rules: { 'local-rules/<name>': ... }

const noRedundantReturnType = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'forbid explicit return types on functions/methods when typescript can infer them'
    },
    fixable: 'code',
    schema: [],
    messages: {
      redundant: 'redundant explicit return type — let typescript infer it'
    }
  },
  create (context) {
    const sourceCode = context.getSourceCode()

    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const bodyReferencesName = (body, name) => {
      if (!name || !body) {
        return false
      }

      const text = sourceCode.getText(body)
      const re = new RegExp(`\\b${escapeRe(name)}\\b`)

      return re.test(text)
    }

    const isOverloadImplementation = (node) => {
      // function-declaration overloads: previous siblings without body sharing the same name
      if (node.type !== 'FunctionDeclaration' || !node.id) {
        return false
      }

      const parent = node.parent
      if (!parent || !Array.isArray(parent.body)) {
        return false
      }

      const idx = parent.body.indexOf(node)
      if (idx <= 0) {
        return false
      }

      const prev = parent.body[idx - 1]

      return (
        prev &&
        (prev.type === 'TSDeclareFunction' || (prev.type === 'FunctionDeclaration' && !prev.body)) &&
        prev.id &&
        prev.id.name === node.id.name
      )
    }

    const isMethodOverloadImplementation = (node) => {
      // class/interface method overloads
      const parent = node.parent
      if (!parent || (parent.type !== 'MethodDefinition' && parent.type !== 'TSAbstractMethodDefinition')) {
        return false
      }

      const classBody = parent.parent
      if (!classBody || !Array.isArray(classBody.body)) {
        return false
      }

      const idx = classBody.body.indexOf(parent)
      if (idx <= 0) {
        return false
      }

      const prev = classBody.body[idx - 1]
      const sameKey = prev && prev.key && parent.key && prev.key.name === parent.key.name

      return Boolean(prev && (prev.type === 'TSAbstractMethodDefinition' || (prev.type === 'MethodDefinition' && prev.value && !prev.value.body)) && sameKey)
    }

    const report = (node) => {
      context.report({
        node: node.returnType,
        messageId: 'redundant',
        fix (fixer) {
          return fixer.removeRange(node.returnType.range)
        }
      })
    }

    const check = (node, name) => {
      if (!node.returnType || !node.body) {
        return
      }

      if (node.generator) {
        return
      }

      if (isOverloadImplementation(node) || isMethodOverloadImplementation(node)) {
        return
      }

      if (bodyReferencesName(node.body, name)) {
        return
      }

      report(node)
    }

    const nameForFunctionExpression = (node) => {
      const parent = node.parent

      if (!parent) {
        return node.id && node.id.name
      }

      if (parent.type === 'MethodDefinition' || parent.type === 'TSAbstractMethodDefinition') {
        return parent.key && parent.key.name
      }

      if (parent.type === 'Property' || parent.type === 'PropertyDefinition') {
        return parent.key && parent.key.name
      }

      if (parent.type === 'VariableDeclarator') {
        return parent.id && parent.id.name
      }

      return node.id && node.id.name
    }

    const nameForArrow = (node) => {
      const parent = node.parent

      if (!parent) {
        return null
      }

      if (parent.type === 'VariableDeclarator') {
        return parent.id && parent.id.name
      }

      if (parent.type === 'Property' || parent.type === 'PropertyDefinition') {
        return parent.key && parent.key.name
      }

      return null
    }

    return {
      FunctionDeclaration (node) {
        check(node, node.id && node.id.name)
      },
      FunctionExpression (node) {
        const parent = node.parent
        if (parent && (parent.type === 'MethodDefinition' || parent.type === 'TSAbstractMethodDefinition') && !node.body) {
          return
        }

        check(node, nameForFunctionExpression(node))
      },
      ArrowFunctionExpression (node) {
        check(node, nameForArrow(node))
      }
    }
  }
}

module.exports = {
  'no-redundant-return-type': noRedundantReturnType
}

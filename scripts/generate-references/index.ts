import fs from 'node:fs/promises'
import path from 'node:path'

import ts from 'typescript'

const getFile = async (srcPath: string) => {
  const abspath = path.resolve(__dirname, '..', '..', 'packages', 'puregram', 'src', srcPath)
  const contents = await fs.readFile(abspath, 'utf-8')

  return contents
}

const syntaxToKind = (kind: ts.Node['kind']) => ts.SyntaxKind[kind]

const main = async (src: string) => {
  const pathParts = src.split('/')
  const filename = pathParts[pathParts.length - 1]

  const contents = await getFile(src)

  const file = ts.createSourceFile(filename, contents, ts.ScriptTarget.ES2019)
  // const printer = ts.createPrinter()

  // const program = ts.createProgram([src], {
  //   target: ts.ScriptTarget.ES2019,
  //   strict: true,
  //   module: ts.ModuleKind.CommonJS
  // })

  // const checker = program.getTypeChecker()

  const getText = (node: ts.Identifier | ts.PropertyName | ts.BindingName | ts.EntityName) => (
    (node as ts.Identifier).text
  )

  const typeNodeToString = (node: ts.TypeNode): string => {
    const simpleKinds: Partial<Record<ts.SyntaxKind, string>> = {
      [ts.SyntaxKind.StringKeyword]: 'string',
      [ts.SyntaxKind.NumberKeyword]: 'number',
      [ts.SyntaxKind.BooleanKeyword]: 'boolean',
      [ts.SyntaxKind.TrueKeyword]: 'true',
      [ts.SyntaxKind.FalseKeyword]: 'false',
      [ts.SyntaxKind.NullKeyword]: 'null',
      [ts.SyntaxKind.UndefinedKeyword]: 'undefined',
      [ts.SyntaxKind.AnyKeyword]: 'any',
      [ts.SyntaxKind.UnknownKeyword]: 'unknown'
    }

    if (node.kind in simpleKinds) {
      return simpleKinds[node.kind] as string
    }

    if (node.kind === ts.SyntaxKind.ArrayType) {
      const aNode = node as ts.ArrayTypeNode

      return `${typeNodeToString(aNode.elementType)}[]`
    }

    if (node.kind === ts.SyntaxKind.TupleType) {
      const tNode = node as ts.TupleTypeNode

      return `[${tNode.elements.map(e => typeNodeToString(e)).join(', ')}]`
    }

    if (node.kind === ts.SyntaxKind.TypeReference) {
      const rNode = node as ts.TypeReferenceNode

      const name = getText(rNode.typeName)

      return name + (rNode.typeArguments ? `<${(rNode.typeArguments ?? []).map(ta => typeNodeToString(ta)).join(', ')}>` : '')
    }

    throw new Error(`unexpected node ${syntaxToKind(node.kind)}[kind=${node.kind}]`)
  }

  const iterateThroughModifiers = (modifiers: ts.ModifiersArray, data: Record<string, any>) => {
    for (const modifier of modifiers) {
      const kind = modifier.kind

      if (kind === ts.SyntaxKind.StaticKeyword) {
        data.static = true
      } else if (kind === ts.SyntaxKind.PrivateKeyword) {
        data.private = true
      } else if (kind === ts.SyntaxKind.AsyncKeyword) {
        data.async = true
      } else if (kind === ts.SyntaxKind.ProtectedKeyword) {
        data.protected = true
      } else if (kind === ts.SyntaxKind.ReadonlyKeyword) {
        data.readonly = true
      }
    }
  }

  const buildParameter = (parameter: ts.ParameterDeclaration) => {
    const data: Record<string, any> = {
      name: getText(parameter.name)
    }

    if (parameter.questionToken !== undefined) {
      data.optional = true
    }

    if (parameter.type !== undefined) {
      const type = typeNodeToString(parameter.type)

      data.type = type
    }

    if (parameter.modifiers !== undefined) {
      iterateThroughModifiers(parameter.modifiers, data)
    }

    return data
  }

  const visitClass = (node: ts.Node, data: Record<string, any>) => {
    if (node.kind === ts.SyntaxKind.ExportKeyword) {
      data.exported = true
    }

    // INFO: class name
    if (ts.isIdentifier(node)) {
      data.name = getText(node)
    }

    // INFO: property
    if (ts.isPropertyDeclaration(node)) {
      const property: Record<string, any> = {
        name: getText(node.name)
      }

      if (node.modifiers !== undefined) {
        iterateThroughModifiers(node.modifiers, property)
      }

      if (node.questionToken !== undefined) {
        property.optional = true
      }

      if (node.exclamationToken !== undefined) {
        property.required = true
      }

      if (node.type !== undefined) {
        const type = typeNodeToString(node.type)

        property.type = type
      }

      data.properties.push(property)
    }

    // INFO: constructor
    if (ts.isConstructorDeclaration(node)) {
      const cData: Record<string, any> = {
        parameters: []
      }

      for (const parameter of node.parameters) {
        const pData = buildParameter(parameter)

        cData.parameters.push(pData)
      }

      data.ctor = cData
    }

    // INFO: method
    if (ts.isMethodDeclaration(node)) {
      const method: Record<string, any> = {
        name: getText(node.name),
        parameters: []
      }

      // INFO: method return-type is explicitly set
      if (node.type !== undefined) {
        const type = typeNodeToString(node.type)

        method.returns = type
      }

      // INFO: method's modifier (e.g. public/private/async)
      if (node.modifiers !== undefined) {
        iterateThroughModifiers(node.modifiers, method)
      }

      // INFO: method's parameters
      for (const parameter of node.parameters) {
        const data = buildParameter(parameter)

        method.parameters.push(data)
      }

      data.methods.push(method)
    }

    // console.log('  [class] %s', syntaxToKind(node.kind))
  }

  const visit = (node: ts.Node) => {
    // INFO: skipping useless declarations/statements
    if (ts.isImportDeclaration(node)) {
      return
    }

    if (ts.isClassDeclaration(node)) {
      const data: Record<string, any> = {
        methods: [],
        properties: []
      }

      node.forEachChild(cn => visitClass(cn, data))

      console.log('done!', data)
    }
  }

  ts.forEachChild(file, visit)
}

main('telegram.ts').catch(console.error)

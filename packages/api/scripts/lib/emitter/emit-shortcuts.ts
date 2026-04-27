import ts from 'typescript'

import type { Schema, SchemaMethod, SchemaTypeRef } from '../schema-types'

import { formatModule } from './format'
import { versionString } from './load-schema'
import { SHORTCUTS, type ShortcutSpec } from './shortcuts-config'
import { typeRefToTs, jsDoc, importTypeNamed } from './ts-factory'

export function emitShortcuts (schema: Schema) {
  const methodsByName = new Map<string, SchemaMethod>(schema.methods.map(m => [m.name, m]))
  const referencedTypes = new Set<string>()

  const memberSigs: ts.TypeElement[] = []

  for (const sc of SHORTCUTS) {
    const method = methodsByName.get(sc.method)

    if (!method) {
      continue
    }

    memberSigs.push(buildShortcutSignature(sc, method, referencedTypes))
  }

  const iface = ts.factory.createInterfaceDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier('TelegramShortcuts'),
    undefined,
    undefined,
    memberSigs
  )

  const paramsImports = SHORTCUTS
    .filter(s => methodsByName.has(s.method))
    .map(s => `${pascal(s.method)}Params`)

  const imports = [
    ...(referencedTypes.size > 0 ? [importTypeNamed([...referencedTypes].sort(), './types')] : []),
    ...(paramsImports.length > 0 ? [importTypeNamed([...new Set(paramsImports)].sort(), './methods')] : [])
  ]

  return formatModule({
    nodes: [iface],
    imports,
    botApiVersion: versionString(schema),
    sourceUrl: schema.source.corefork,
    generatedAt: schema.source.fetchedAt
  })
}

function buildShortcutSignature (
  sc: ShortcutSpec,
  method: SchemaMethod,
  referencedTypes: Set<string>
) {
  const positionalParams: ts.ParameterDeclaration[] = sc.positional.map((p) => {
    const schemaArg = method.arguments.find(a => a.name === p.schemaArg)

    if (!schemaArg) {
      throw new Error(`shortcut ${sc.verb}: schema arg ${p.schemaArg} not found on ${method.name}`)
    }

    collectRefs(schemaArg.type, referencedTypes)

    return ts.factory.createParameterDeclaration(
      undefined, undefined,
      ts.factory.createIdentifier(p.name),
      undefined,
      typeRefToTs(schemaArg.type),
      undefined
    )
  })

  const filledNames = sc.positional.map(p => p.schemaArg)
  const omitType = ts.factory.createTypeReferenceNode('Omit', [
    ts.factory.createTypeReferenceNode(`${pascal(sc.method)}Params`),
    ts.factory.createUnionTypeNode(
      filledNames.map(n => ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(n)))
    )
  ])

  const optionalParam = ts.factory.createParameterDeclaration(
    undefined, undefined,
    ts.factory.createIdentifier('params'),
    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    omitType,
    undefined
  )

  collectRefs(method.returnType, referencedTypes)
  const returnType = ts.factory.createTypeReferenceNode('Promise', [typeRefToTs(method.returnType)])

  return jsDoc(
    `Shortcut for \`tg.api.${method.name}\`. ${method.description}`,
    ts.factory.createMethodSignature(
      undefined,
      ts.factory.createIdentifier(sc.verb),
      undefined,
      undefined,
      [...positionalParams, optionalParam],
      returnType
    )
  )
}

function pascal (s: string) {
  return s[0].toUpperCase() + s.slice(1)
}

function collectRefs (ref: SchemaTypeRef, into: Set<string>): void {
  if (ref.kind === 'reference') {
    into.add(`Telegram${ref.name}`)
  } else if (ref.kind === 'array') {
    collectRefs(ref.of, into)
  } else if (ref.kind === 'union') {
    ref.of.forEach(t => collectRefs(t, into))
  }
}

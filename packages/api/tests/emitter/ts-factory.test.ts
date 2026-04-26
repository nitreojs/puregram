import { describe, it, expect } from 'vitest'
import ts from 'typescript'
import { typeRefToTs, jsDoc, tsExportInterface } from '../../scripts/lib/emitter/ts-factory'
import type { SchemaTypeRef } from '../../scripts/lib/schema-types'

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
const file = ts.createSourceFile('x.ts', '', ts.ScriptTarget.ES2022, false, ts.ScriptKind.TS)

const print = (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, file)

describe('typeRefToTs', () => {
  it('handles primitives', () => {
    const cases: [SchemaTypeRef, string][] = [
      [{ kind: 'integer' }, 'number'],
      [{ kind: 'string' }, 'string'],
      [{ kind: 'bool' }, 'boolean'],
      [{ kind: 'float' }, 'number'],
      [{ kind: 'true' }, 'true']
    ]
    for (const [input, expected] of cases) {
      expect(print(typeRefToTs(input))).toBe(expected)
    }
  })

  it('handles references with Telegram prefix', () => {
    expect(print(typeRefToTs({ kind: 'reference', name: 'User' }))).toBe('TelegramUser')
  })

  it('handles arrays', () => {
    expect(print(typeRefToTs({ kind: 'array', of: { kind: 'integer' } }))).toBe('number[]')
  })

  it('handles unions', () => {
    expect(print(typeRefToTs({
      kind: 'union',
      of: [{ kind: 'integer' }, { kind: 'string' }]
    }))).toBe('number | string')
  })

  it('handles enumerations as string literals', () => {
    expect(print(typeRefToTs({
      kind: 'string',
      enumeration: ['private', 'group']
    }))).toBe('"private" | "group"')
  })
})

describe('jsDoc', () => {
  it('produces a leading jsdoc block as synthetic trivia', () => {
    const decl = ts.factory.createTypeAliasDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier('Foo'),
      undefined,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
    )
    const withDoc = jsDoc('hello\nworld', decl)
    const out = print(withDoc)
    expect(out).toContain('/**')
    expect(out).toContain('* hello')
    expect(out).toContain('* world')
  })
})

describe('tsExportInterface', () => {
  it('emits an exported interface declaration', () => {
    const decl = tsExportInterface('Foo', [
      { name: 'x', type: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword), optional: false }
    ])
    const out = print(decl)
    expect(out).toContain('export interface Foo')
    expect(out).toContain('x: number')
  })
})

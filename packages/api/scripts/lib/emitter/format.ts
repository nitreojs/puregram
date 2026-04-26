import ts from 'typescript'

export interface FormatModuleInput {
  nodes: ts.Node[]
  botApiVersion: string
  sourceUrl: string
  generatedAt: string
  imports?: ts.ImportDeclaration[]
}

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

export function formatModule (input: FormatModuleInput): string {
  const file = ts.createSourceFile('out.ts', '', ts.ScriptTarget.ES2022, false, ts.ScriptKind.TS)

  const banner = [
    '/// AUTO-GENERATED FILE — do not edit by hand',
    `/// Bot API ${input.botApiVersion}`,
    `/// source: ${input.sourceUrl}`,
    `/// generated at: ${input.generatedAt}`,
    '/// see scripts/emit.ts in @puregram/api',
    ''
  ].join('\n')

  const importsBlock = (input.imports ?? [])
    .map(node => printer.printNode(ts.EmitHint.Unspecified, node, file))
    .join('\n')

  const body = input.nodes
    .map(node => printer.printNode(ts.EmitHint.Unspecified, node, file))
    .join('\n\n')

  return [banner, importsBlock, '', body, ''].filter(Boolean).join('\n')
}

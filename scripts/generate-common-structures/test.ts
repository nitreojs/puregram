import ts from 'typescript'

import { CodeGenerator } from './code-generator'

const file = ts.createSourceFile('test.ts', '', ts.ScriptTarget.ES2019)
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

const print = (node: ts.Node) => console.log(printer.printNode(ts.EmitHint.Unspecified, node, file))

// print(CodeGenerator.get(''))

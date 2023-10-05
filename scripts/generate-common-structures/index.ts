import fs from 'node:fs/promises'
import path from 'node:path'

import ts from 'typescript'

import { Visitor } from './visitor'
import { Variables } from './variables'

import { PUREGRAM_GENERATED_INTERFACES_PATH } from './constants'
import { CodeGenerator } from './code-generator'

const getFile = async (srcPath: string) => {
  const abspath = path.resolve(__dirname, '..', '..', 'packages', 'puregram', 'src', srcPath)
  const contents = await fs.readFile(abspath, 'utf-8')

  return contents
}

const main = async () => {
  const pathParts = PUREGRAM_GENERATED_INTERFACES_PATH.split('/')
  const filename = pathParts[pathParts.length - 1]

  const contents = await getFile(PUREGRAM_GENERATED_INTERFACES_PATH)

  const file = ts.createSourceFile(filename, contents, ts.ScriptTarget.ES2019)
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

  ts.forEachChild(file, Visitor.visit)

  const printNode = (node: ts.Node) => console.log(printer.printNode(ts.EmitHint.Unspecified, node, file))
  const print = (nodes: ts.Node | ts.Node[]) => Array.isArray(nodes) ? nodes.forEach(printNode) : printNode(nodes)

  // console.log(Variables.interfaces.length)

  const klass = Variables.interfaces[4]

  print(CodeGenerator.class(klass))
}

main().catch(console.error)

import { writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { fetch } from 'undici'
import { stripIndent, stripIndents } from 'common-tags'

import * as Types from './types'

// const SCHEMA_URL: string = `${__dirname}/custom.min.json`
const SCHEMA_URL: string = 'https://ark0f.github.io/tg-bot-api/custom.min.json'


///           SERVICES           ///

interface ServiceResult {
  content: string
  name: string
}

interface ServiceResultInterface extends ServiceResult {
  fields: number
}

interface ServiceResultMethod extends ServiceResult {
  hasParams: boolean
}

class InterfaceService {
  static generate(kInterface: Types.SchemaInterface): ServiceResultInterface {
    if (kInterface.type === 'any_of') {
      console.log(kInterface)

      throw new TypeError('SchemaInterfaceAnyOf should be generated via TypeService.generate')
    }

    const name: string = `Telegram${kInterface.name}`

    let content = `export interface ${name} { }`

    if (kInterface.properties) {
      const fields: string[] = InterfaceService.generateFields(kInterface.properties)
        .map(tab)

      // just some little hacks over there, nothing special, scroll away
      fields.push('')
      fields.push(tab('[key: string]: any'))

      content = `export interface ${name} {\n${fields.join('\n')}\n}`
    }

    const description: string = InterfaceService.generateDescription(kInterface.description)

    content = `${description}\n${content}`

    return {
      content,
      name,
      fields: kInterface.properties?.length ?? 0
    }
  }

  static generateDescription(
    description: string,
    padSize: number = 0,
    documentationLink?: string
  ) {
    const parts = description.split(/\n/)
    const spaces = ' '.repeat(padSize)

    if (documentationLink) {
      parts.push('')
      parts.push('---')
      parts.push('')
      parts.push(`[**Documentation**](${documentationLink})`)
    }

    return `/**\n${parts.map(part => `${spaces} * ${part}`).join('\n')}\n${spaces} */`
  }

  static generateFields(properties: Types.SchemaObject[]): string[] {
    const fields: string[] = []

    for (const field of properties) {
      let type = TypeResolver.resolve(field)

      if (type === 'TelegramInputFile | string') {
        type = 'MediaInput'
      }

      const description: string = InterfaceService.generateDescription(field.description, 2)
      const property: string = `${description}\n${tab(field.name)}${field.required ? '' : '?'}: ${type}`

      fields.push(property)
    }

    return fields
  }
}

class MethodService {
  static generate(kMethod: Types.SchemaMethod): ServiceResultMethod {
    // TODO: simplify

    const mTypeDescription: string = InterfaceService.generateDescription(kMethod.description, 0, kMethod.documentation_link)
    const mReturnType: string = TypeResolver.resolve(kMethod.return_type as Types.SchemaObject, 'Interfaces')
    let content = `${mTypeDescription}\nexport type ${kMethod.name} = () => Promise<${mReturnType}>`

    if (kMethod.arguments) {
      const mInterfaceName: string = kMethod.name[0].toUpperCase() + kMethod.name.slice(1) + 'Params'

      const fields: string[] = MethodService.generateFields(kMethod.arguments, 'Interfaces')
        .map(tab)

      /// just some little hacks over there, nothing special, scroll away
      fields.push('')
      fields.push(tab('[key: string]: any'))

      const mInterface: string = `export interface ${mInterfaceName} {\n${fields.join('\n')}\n}`
      const mParamsNotRequired: string = kMethod.arguments.every(argument => !argument.required) ? '?' : ''
      const mType: string = `export type ${kMethod.name} = (params${mParamsNotRequired}: ${mInterfaceName}) => Promise<${mReturnType}>`

      content = `${mInterface}\n\n${mTypeDescription}\n${mType}`
    }

    return {
      content,
      name: kMethod.name,
      hasParams: kMethod.arguments !== undefined
    }
  }

  static generateFields(properties: Types.SchemaObject[], addition?: string): string[] {
    const fields: string[] = []

    for (const field of properties) {
      const description: string = InterfaceService.generateDescription(field.description, 2)

      let returnType: string = TypeResolver.resolve(field, addition)

      if (field.name === 'reply_markup') {
        const object = {
          type: 'reference',
          reference: 'ReplyMarkupUnion',
          is_internal: true
        } as Types.SchemaObjectReference

        returnType = TypeResolver.resolve(object, addition)
      }

      if (field.name === 'entities' || field.name === 'caption_entities') {
        const union = {
          type: 'any_of',
          any_of: [
            {
              type: 'array',
              array: {
                type: 'reference',
                reference: 'MessageEntity',
                is_internal: true
              }
            },
            {
              type: 'array',
              array: {
                type: 'reference',
                reference: 'Interfaces.TelegramMessageEntity',
                is_internal: true
              }
            }
          ]
        } as Types.SchemaObjectAnyOf

        returnType = TypeResolver.resolve(union)
      }

      if (returnType.includes('Interfaces.TelegramInputFile')) {
        returnType = TypeResolver.resolve(
          { type: 'reference', reference: 'MediaInput', is_internal: true } as Types.SchemaObjectReference
        )
      }

      const property: string = `${description}\n${tab(field.name)}${field.required ? '' : '?'}: ${returnType}`

      fields.push(property)
    }

    return fields
  }
}

class TypeService {
  static generate(kType: Types.SchemaInterfaceAnyOf): ServiceResult {
    const name: string = `Telegram${kType.name}`
    const types: string[] = kType.any_of.map(TypeResolver.resolve)

    const description: string = InterfaceService.generateDescription(kType.description)
    let content = `${description}\nexport type ${name} =\n  | ` + types.join('\n  | ')

    return {
      content,
      name
    }
  }
}

class TypeResolver {
  static resolve(
    object: Types.SchemaObject,
    additionToReference?: string | number // allowing to do [].map(TypeResolver.resolve)
  ) {
    // TODO: add `addition` check for every SchemaObject

    if (object.type === 'string') {
      if (object.enumeration) {
        return object.enumeration.map(value => `'${value}'`).join(' | ')
      }

      if (object.default) {
        return `'${object.default!}'`
      }

      return 'string'
    }

    if (object.type === 'float' || object.type === 'integer') {
      return 'number'
    }

    if (object.type === 'array') {
      const value: string = TypeResolver.resolve(object.array, additionToReference)

      if (object.array.type === 'any_of') {
        return `(${value})[]`
      }

      return `${value}[]`
    }

    if (object.type === 'bool') {
      return 'boolean'
    }

    if (object.type === 'any_of') {
      const types: string[] = object.any_of.map(
        (value) => TypeResolver.resolve(value, additionToReference)
      )

      return types.join(' | ')
    }

    if (object.type === 'reference') {
      const addition: string = typeof additionToReference === 'string' // allowing to do [].map(TypeResolver.resolve)
        ? `${additionToReference}.`
        : ''

      const internalCheck: string = object.is_internal
        ? ''
        : 'Telegram'

      return addition + internalCheck + object.reference
    }

    throw new Error(`Unresolved type: ${object}`)
  }
}

class SchemaService {
  static isType(schema: Types.SchemaInterface): schema is Types.SchemaInterfaceAnyOf {
    return schema.type === 'any_of'
  }
}

class GenerationService {
  static loadString(header: string) {
    return header + '\n\n'
  }

  static generate(results: ServiceResult[], header?: string) {
    let content: string = header
      ? GenerationService.loadString(header)
      : ''

    for (const element of results) {
      content += GenerationService.loadString(element.content)
    }

    return content.trimEnd()
  }

  static generateInterfacesImports() {
    return stripIndent`
      import { Readable } from 'stream' // INFO: for Interfaces.InputFile

      import { MediaInput } from '../media-source'

      import {
        Keyboard,
        KeyboardBuilder,
        InlineKeyboardBuilder,
        InlineKeyboard,
        ForceReply,
        RemoveKeyboard
      } from '../common/keyboards'
    `
  }

  static generateMethodsImports() {
    return stripIndent`
      import * as Interfaces from './telegram-interfaces'

      import { MediaInput } from '../media-source'
      import { MessageEntity } from '../common/structures'
    `
  }

  static generateAdditionalTypes() {
    return stripIndent`
      export type ReplyMarkupUnion =
        | TelegramInlineKeyboardMarkup
        | TelegramReplyKeyboardMarkup
        | TelegramReplyKeyboardRemove
        | TelegramForceReply
        | Keyboard
        | KeyboardBuilder
        | InlineKeyboard
        | InlineKeyboardBuilder
        | ForceReply
        | RemoveKeyboard
      
      export type InputFile =
        | string
        | Record<string, any>
        | Buffer
        | Readable
    `
  }

  static generateApiMethods(methods: Types.SchemaMethod[]) {
    const fields: string[] = methods.map(
      (method) => {
        const description: string = InterfaceService.generateDescription(method.description, 2, method.documentation_link)

        return `${description}\n${tab(method.name)}: api.${method.name}`
      }
    ).map(tab)

    const content: string = `import * as api from './methods'\n\nexport interface ApiMethods {\n${fields.join('\n')}\n\n  [key: string]: (...args: any[]) => Promise<any>\n}`

    return content
  }
}


///           GENERATION           ///

export interface InterfacesData {
  interfaces: ServiceResultInterface[]
  types: ServiceResult[]
  methods: ServiceResultMethod[]
}

export type GenerateDataType = InterfacesData & { time: number }

export const pad = (number: number): string => String(number).padStart(2, '0')
export const tab = (source: string): string => `  ${source}`

export async function getJson(fromFile: boolean = false) {
  let json: Types.SchemaResponse

  if (fromFile) {
    const response = (await readFile(SCHEMA_URL)).toString()
    json = JSON.parse(response)
  } else {
    const response = await fetch(SCHEMA_URL)
    json = await response.json() as Types.SchemaResponse
  }

  return json
}

export async function generate() {
  const { objects: interfaces, methods } = await getJson()

  const _generation_start = Date.now()

  const items: InterfacesData = {
    interfaces: [],
    types: [],
    methods: []
  }

  for (const kInterface of interfaces) {
    if (SchemaService.isType(kInterface)) {
      const result: ServiceResult = TypeService.generate(kInterface)

      items.types.push(result)

      continue
    }

    const result: ServiceResultInterface = InterfaceService.generate(kInterface)

    items.interfaces.push(result)
  }

  for (const kMethod of methods) {
    const result: ServiceResultMethod = MethodService.generate(kMethod)

    items.methods.push(result)
  }

  const _generation_end = Date.now()

  const data: GenerateDataType = {
    ...items,
    time: _generation_end - _generation_start
  }

  return data
}

export function generateHeader(version: Types.SchemaVersion, recentChanges: Types.SchemaRecentChanges) {
  const date = new Date()

  const apiVersion: string = `v${version.major}.${version.minor}.${version.patch}`
  const apiUpdateDate: string = `${pad(recentChanges.day)}.${pad(recentChanges.month)}.${recentChanges.year}`
  const generationDate: string = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} MSK`

  const header = stripIndents`
    /// AUTO-GENERATED FILE
    /// DO NOT EDIT MANUALLY
    ///
    /// This file was auto-generated using https://github.com/ark0f/tg-bot-api
    /// Based on Bot API ${apiVersion}, ${apiUpdateDate}
    /// Generation date: ${generationDate}
  `

  return header
}

async function _generate(generateFiles: boolean = true) {
  const { version, recent_changes, methods } = await getJson()

  const _generation_start = Date.now()

  const items = await generate()
  const header = generateHeader(version, recent_changes)

  console.log('[Header]')
  console.log(header)
  console.log()


  /// INTERFACES ----------

  console.log(`[Interfaces (${items.interfaces.length})]`)

  for (const kInterface of items.interfaces) {
    console.log(`- ${kInterface.name} (${kInterface.fields} fields)`)
  }

  console.log()

  /// TYPES ----------

  console.log(`[Types (${items.types.length})]`)

  for (const kType of items.types) {
    console.log(`- ${kType.name}`)
  }

  console.log()

  /// METHODS ----------

  console.log(`[Methods (${items.methods.length})]`)

  for (const kMethod of items.methods) {
    console.log(`- ${kMethod.name}(${kMethod.hasParams ? 'params' : ''})`)
  }

  console.log()

  console.log('[Results]')


  /// FILES GENERATION ----------

  if (generateFiles) {
    const mainPath: string = resolve(`${__dirname}/../../packages/puregram/src/generated/`)

    /// telegram-interfaces.ts
    let iHeader: string = GenerationService.loadString(header) +
      GenerationService.generateInterfacesImports()

    let iContent: string = GenerationService.loadString(
      GenerationService.generate(items.interfaces, iHeader)
    )

    iContent += GenerationService.loadString(
      GenerationService.generateAdditionalTypes()
    )

    iContent += GenerationService.generate(items.types)

    await writeFile(`${mainPath}/telegram-interfaces.ts`, iContent)

    console.log(`- telegram-interfaces.ts: ${items.interfaces.length} interfaces, ${items.types.length} types, ${iContent.split('\n').length} lines`)

    /// methods.ts
    let mHeader: string = GenerationService.loadString(header) +
      GenerationService.generateMethodsImports()

    let mContent: string = GenerationService.generate(items.methods, mHeader)

    await writeFile(`${mainPath}/methods.ts`, mContent)

    console.log(`- methods.ts: ${items.methods.length} methods, ${mContent.split('\n').length} lines`)

    /// api-methods.ts
    let amContent: string = GenerationService.generate([], header)
    amContent += '\n\n' + GenerationService.generateApiMethods(methods)

    await writeFile(`${mainPath}/api-methods.ts`, amContent)

    console.log(`- api-methods.ts: ${amContent.split('\n').length} lines`)
  }

  const _generation_end = Date.now()

  console.log(`Time: ${_generation_end - _generation_start}ms`)
  console.log(`Generation time: ${items.time}ms`)

  return 0
}

_generate().catch(console.error)

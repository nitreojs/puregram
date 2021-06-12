import fetch, { Response } from 'node-fetch';
import { stripIndent, stripIndents } from 'common-tags';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

const SCHEMA_URL: string = 'https://ark0f.github.io/tg-bot-api/custom.min.json';

///           TYPES           ///

type SchemaType = 'integer' | 'string' | 'bool' | 'reference' | 'array' | 'float' | 'any_of';
type SchemaInterfaceType = 'any_of' | 'properties';

interface SchemaResponse {
  version: SchemaVersion;
  recent_changes: SchemaRecentChanges;
  methods: SchemaMethod[];
  objects: SchemaInterface[];
}

interface SchemaVersion {
  major: number;
  minor: number;
  patch: number;
}

interface SchemaRecentChanges {
  year: number;
  month: number;
  day: number;
}

interface SchemaMethod {
  name: string;
  description: string;
  arguments?: SchemaObject[];
  multipart_only: boolean;
  return_type: SchemaReturnType;
  documentation_link: string;
}

type SchemaObject =
  | SchemaObjectReference
  | SchemaObjectInteger
  | SchemaObjectBool
  | SchemaObjectFloat
  | SchemaObjectAnyOf
  | SchemaObjectString
  | SchemaObjectArray;

interface SchemaObjectBase {
  name: string;
  description: string;
  required: boolean;
  type: SchemaType;
}

interface SchemaObjectReference extends SchemaObjectBase {
  type: 'reference';
  reference: string;

  // Is this reference internal (manually created)
  // so we don't need to add 'Telegram' before it?
  is_internal?: true;
}

interface SchemaObjectInteger extends SchemaObjectBase {
  type: 'integer';
  default?: number;
  min?: number;
  max?: number;
}

interface SchemaObjectBool extends SchemaObjectBase {
  type: 'bool';
  default?: boolean;
}

interface SchemaObjectFloat extends SchemaObjectBase {
  type: 'float';
}

interface SchemaObjectAnyOf extends SchemaObjectBase {
  type: 'any_of';
  any_of: SchemaReturnType[];
}

interface SchemaObjectString extends SchemaObjectBase {
  type: 'string';
  default?: string;
  enumeration?: string[];
}

interface SchemaObjectArray extends SchemaObjectBase {
  type: 'array';
  array: SchemaReturnType;
}

type SchemaReturnType =
  | ReturnTypeReference
  | ReturnTypeArray
  | ReturnTypeAnyOf
  | ReturnTypeBool
  | ReturnTypeInteger
  | ReturnTypeString;

interface ReturnTypeReference {
  type: 'reference';
  reference: string;
}
  
interface ReturnTypeArray {
  type: 'array';
  array: SchemaReturnType;
}

interface ReturnTypeAnyOf {
  type: 'any_of';
  any_of: SchemaReturnType[];
}

interface ReturnTypeBool {
  type: 'bool';
  default: boolean;
}

interface ReturnTypeInteger {
  type: 'integer';
}

interface ReturnTypeString {
  type: 'string';
}

type SchemaInterface =
  | SchemaInterfaceAnyOf
  | SchemaInterfaceProperties;

interface SchemaInterfaceBase {
  name: string;
  description: string;
  documentation_link: string;
  type?: SchemaInterfaceType;
}

interface SchemaInterfaceAnyOf extends SchemaInterfaceBase {
  type: 'any_of';
  any_of: SchemaObject[];
}

interface SchemaInterfaceProperties extends SchemaInterfaceBase {
  type: 'properties';
  properties: SchemaObject[];
}


///           SERVICES           ///

interface ServiceResult {
  content: string;
  name: string;
}

interface ServiceResultInterface extends ServiceResult {
  fields: number;
}

interface ServiceResultMethod extends ServiceResult {
  hasParams: boolean;
}

class InterfaceService {
  public static generate(kInterface: SchemaInterface): ServiceResultInterface {
    if (kInterface.type === 'any_of') {
      console.log(kInterface);

      throw new TypeError('SchemaInterfaceAnyOf should be generated via TypeService.generate');
    }

    const name: string = `Telegram${kInterface.name}`;

    let content = `export interface ${name} { }`;

    if (kInterface.properties) {
      const fields: string[] = InterfaceService.generateFields(kInterface.properties)
        .map(tab);
      
      // just some little hacks over there, nothing special, scroll away
      fields.push('');
      fields.push(tab('[key: string]: any;'));
      
      content = `export interface ${name} {\n${fields.join('\n')}\n}`;
    }

    const description: string = InterfaceService.generateDescription(kInterface.description);

    content = `${description}\n${content}`;

    return {
      content,
      name,
      fields: kInterface.properties?.length ?? 0
    };
  }

  public static generateDescription(
    description: string,
    padSize: number = 0,
    documentationLink?: string
  ): string {
    const parts = description.split(/\n/);
    const spaces = ' '.repeat(padSize);
    
    if (documentationLink) {
      parts.push('');
      parts.push('---');
      parts.push('');
      parts.push(`[**Documentation**](${documentationLink})`);
    }

    return `/**\n${parts.map(part => `${spaces} * ${part}`).join('\n')}\n${spaces} */`;
  }

  public static generateFields(properties: SchemaObject[]): string[] {
    const fields: string[] = [];

    for (const field of properties) {
      const description: string = InterfaceService.generateDescription(field.description, 2);
      const property: string = `${description}\n${tab(field.name)}${field.required ? '' : '?'}: ${TypeResolver.resolve(field)};`;

      fields.push(property);
    }

    return fields;
  }
}

class MethodService {
  public static generate(kMethod: SchemaMethod): ServiceResultMethod {
    /// TODO: simplify

    const mTypeDescription: string = InterfaceService.generateDescription(kMethod.description, 0, kMethod.documentation_link);
    const mReturnType: string = TypeResolver.resolve(kMethod.return_type as SchemaObject, 'Interfaces');
    let content = `${mTypeDescription}\nexport type ${kMethod.name} = () => Promise<${mReturnType}>;`;

    if (kMethod.arguments) {
      const mInterfaceName: string = kMethod.name[0].toUpperCase() + kMethod.name.slice(1) + 'Params';

      if (kMethod.name === 'sendDocument') {
        kMethod.arguments.push({
          type: 'string',
          name: 'filename',
          description: 'Name that will be used as a file name in the sent message',
          required: false
        });
      }

      const fields: string[] = MethodService.generateFields(kMethod.arguments, 'Interfaces')
        .map(tab);
      
      /// just some little hacks over there, nothing special, scroll away
      fields.push('');
      fields.push(tab('[key: string]: any;'));

      const mInterface: string = `export interface ${mInterfaceName} {\n${fields.join('\n')}\n}`;
      const mType: string = `export type ${kMethod.name} = (params: ${mInterfaceName}) => Promise<${mReturnType}>;`;

      content = `${mInterface}\n\n${mTypeDescription}\n${mType}`;
    }

    return {
      content,
      name: kMethod.name,
      hasParams: kMethod.arguments !== undefined
    };
  }

  public static generateFields(properties: SchemaObject[], addition?: string): string[] {
    const fields: string[] = [];

    for (const field of properties) {
      const description: string = InterfaceService.generateDescription(field.description, 2);

      let returnType: string = TypeResolver.resolve(field, addition);

      if (field.name === 'reply_markup') {
        returnType = TypeResolver.resolve(
          { type: 'reference', reference: 'ReplyMarkupUnion', is_internal: true } as SchemaObjectReference,
          addition
        );
      }

      if (returnType.includes('Interfaces.TelegramInputFile')) { // kinda hacky btw but you didnt see it 👀
        returnType = TypeResolver.resolve(
          { type: 'reference', reference: 'InputFile', is_internal: true } as SchemaObjectReference,
          addition
        );
      }

      const property: string = `${description}\n${tab(field.name)}${field.required ? '' : '?'}: ${returnType};`;

      fields.push(property);
    }

    return fields;
  }
}

class TypeService {
  public static generate(kType: SchemaInterfaceAnyOf): ServiceResult {
    const name: string = `Telegram${kType.name}`;
    const types: string[] = kType.any_of.map(TypeResolver.resolve);

    const description: string = InterfaceService.generateDescription(kType.description);
    let content = `${description}\nexport type ${name} =\n  | ` + types.join('\n  | ') + ';';

    return {
      content,
      name
    };
  }
}

class TypeResolver {
  public static resolve(
    object: SchemaObject,
    additionToReference?: string | number // allowing to do [].map(TypeResolver.resolve)
  ): string {
    if (object.type === 'string') {
      if (object.enumeration) {
        return object.enumeration.map(value => `'${value}'`).join(' | ');
      }

      if (object.default) {
        return `'${object.default!}'`;
      }

      return 'string';
    }

    if (object.type === 'float' || object.type === 'integer') {
      return 'number';
    }

    if (object.type === 'array') {
      // @ts-expect-error
      return TypeResolver.resolve(object.array, additionToReference) + '[]';
    }

    if (object.type === 'bool') {
      if (object.default) {
        return String(object.default);
      }

      return 'boolean';
    }

    if (object.type === 'any_of') {
      const types: string[] = object.any_of.map(
        // @ts-expect-error
        (value) => TypeResolver.resolve(value, additionToReference)
      );

      return types.join(' | ');
    }

    if (object.type === 'reference') {
      const addition: string = typeof additionToReference === 'string' // allowing to do [].map(TypeResolver.resolve)
        ? `${additionToReference}.`
        : '';
      
      const internalCheck: string = object.is_internal
        ? ''
        : 'Telegram';

      return addition + internalCheck + object.reference;
    }

    throw new Error(`Unresolved type: ${object}`);
  }
}

class SchemaService {
  public static isType(schema: SchemaInterface): schema is SchemaInterfaceAnyOf {
    return schema.type === 'any_of';
  }
}

class GenerationService {
  public static loadString(header: string): string {
    return header + '\n\n';
  }

  public static generate(results: ServiceResult[], header?: string): string {
    let content: string = header
      ? GenerationService.loadString(header)
      : '';

    for (const element of results) {
      content += GenerationService.loadString(element.content);
    }

    return content.trimEnd();
  }

  public static generateInterfacesImports(): string {
    return stripIndent`
      import { Readable } from 'stream'; // for Interfaces.InputFile

      import {
        Keyboard,
        KeyboardBuilder,
        InlineKeyboardBuilder,
        InlineKeyboard,
        ForceReply,
        RemoveKeyboard
      } from './common/keyboards';
    `;
  }

  public static generateMethodsImports(): string {
    return stripIndent`
      import * as Interfaces from './telegram-interfaces';
    `;
  }

  public static generateAdditionalTypes(): string {
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
        | RemoveKeyboard;
      
      export type InputFile =
        | string
        | Record<string, any>
        | Buffer
        | Readable;
    `;
  }

  public static generateApiMethods(methods: SchemaMethod[]): string {
    const fields: string[] = methods.map(
      (method) => {
        const description: string = InterfaceService.generateDescription(method.description, 2, method.documentation_link);

        return `${description}\n${tab(method.name)}: api.${method.name};`;
      }
    ).map(tab);

    const content: string = `import * as api from './methods';\n\nexport interface ApiMethods {\n${fields.join('\n')}\n}`;

    return content;
  }
}


///           GENERATION           ///

const pad = (number: number): string => String(number).padStart(2, '0');
const tab = (source: string): string => `  ${source}`;

async function generate() {
  const response: Response = await fetch(SCHEMA_URL);
  const json: SchemaResponse = await response.json();

  const { version, objects: interfaces, methods, recent_changes } = json;

  const date = new Date();

  const apiVersion: string = `v${version.major}.${version.minor}.${version.patch}`;
  const apiUpdateDate: string = `${pad(recent_changes.day)}.${pad(recent_changes.month)}.${recent_changes.year}`;
  const generationDate: string = `${pad(date.getDate())}.${pad(date.getMonth())}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} MSK`;

  const _generation_start = Date.now();

  const items = {
    interfaces: [] as ServiceResultInterface[],
    types: [] as ServiceResult[],
    methods: [] as ServiceResultMethod[]
  } as const;

  const header = stripIndents`
    /// AUTO-GENERATED FILE
    /// DO NOT EDIT MANUALLY
    ///
    /// This file was auto-generated using https://github.com/ark0f/tg-bot-api
    /// Based on Bot API ${apiVersion}, ${apiUpdateDate}
    /// Generation date: ${generationDate}
  `;

  console.log('[Header]');
  console.log(header);
  console.log();


  /// INTERFACES & TYPES ----------

  console.log(`[Interfaces & types (${interfaces.length})]`);

  for (const kInterface of interfaces) {
    if (SchemaService.isType(kInterface)) {
      const result: ServiceResult = TypeService.generate(kInterface);

      items.types.push(result);

      console.log(`- ${result.name}`);

      continue;
    }

    const result: ServiceResultInterface = InterfaceService.generate(kInterface);

    items.interfaces.push(result);

    console.log(`- ${result.name} (${result.fields} fields)`);
  }

  console.log();

  /// METHODS ----------

  console.log(`[Methods (${methods.length})]`);

  for (const kMethod of methods) {
    const result: ServiceResultMethod = MethodService.generate(kMethod);

    items.methods.push(result);

    console.log(`- ${result.name}(${result.hasParams ? 'params' : ''})`);
  }

  console.log();

  console.log('[Results]');


  /// FILES GENERATION ----------

  const mainPath: string = resolve(`${__dirname}/../../packages/puregram/src/`);

  /// interfaces.ts
  let iHeader: string = GenerationService.loadString(header) +
    GenerationService.generateInterfacesImports();

  let iContent: string = GenerationService.loadString(
    GenerationService.generate(items.interfaces, iHeader)
  );

  iContent += GenerationService.loadString(
    GenerationService.generateAdditionalTypes()
  );

  iContent += GenerationService.generate(items.types);

  await writeFile(`${mainPath}/telegram-interfaces.ts`, iContent);

  console.log(`- telegram-interfaces.ts: ${items.interfaces.length} interfaces, ${items.types.length} types, ${iContent.split('\n').length} lines`);

  /// methods.ts
  let mHeader: string = GenerationService.loadString(header) +
    GenerationService.generateMethodsImports();
  
  let mContent: string = GenerationService.generate(items.methods, mHeader);

  await writeFile(`${mainPath}/methods.ts`, mContent);

  console.log(`- methods.ts: ${items.methods.length} methods, ${mContent.split('\n').length} lines`);

  /// api-methods.ts
  let amContent: string = GenerationService.generate([], header);
  amContent += '\n\n' + GenerationService.generateApiMethods(methods);

  await writeFile(`${mainPath}/api-methods.ts`, amContent);

  console.log(`- api-methods.ts: ${amContent.split('\n').length} lines`);

  const _generation_end = Date.now();

  console.log(`Time: ${_generation_end - _generation_start}ms`);

  return 0;
}

generate().catch(console.error);

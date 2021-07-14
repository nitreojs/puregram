import { stripIndent } from 'common-tags';

import * as Types from './types';

import GETTERS, { Getters } from './getters';
import METHODS from './methods';

export class TextService {
  public static pascalize(source: string): string {
    return source[0].toUpperCase() + source.slice(1);
  }

  public static kebabize(source: string): string {
    const parts: string[] = source.match(/([A-Z][a-z]+)/g)!;

    return parts.map(part => part.toLowerCase()).join('-');
  }

  public static optional(condition: boolean): string {
    return condition ? '?' : '';
  }

  public static comment(source?: string): string {
    if (!source) {
      return '';
    }

    const parts: string[] = TextService.getLines(source);

    if (parts.length === 1) {
      return `/** ${parts[0]} */\n`;
    }

    return `/**\n${parts.map(part => ` * ${part}`).join('\n')}\n */\n`;
  }

  public static tab(source: string, tabs: number = 1): string {
    return '  '.repeat(tabs) + source;
  }

  public static insertLines(rawLines: string | string[], tabs: number = 1): string {
    const lines: string[] = Array.isArray(rawLines)
      ? rawLines
      : TextService.getLines(rawLines);
    
    if (lines.length === 1) {
      return lines[0];
    }

    return lines[0] + '\n' + lines.slice(1)
      .map(line => TextService.tab(line.trimEnd(), tabs))
      .join('\n');
  }

  public static getLines(source: string): string[] {
    return source.split(/\n/);
  }
}

export class ContextService {
  public static generateImports(): string {
    return stripIndent`
      import { inspectable } from 'inspectable';

      import { Context } from './context';
      import { Telegram } from '../telegram';

      import * as Interfaces from '../telegram-interfaces';
      import * as Types from '../types';
      import * as Attachments from '../common/attachments';
      import * as Structures from '../common/structures';
      import * as Updates from '../updates/';
    `;
  }

  public static generateOptions(data: Types.ContextData): string {
    const customType: string = data.hasCustomType
      ? `\n${TextService.tab(`type${data.isCustomTypeRequired ? '' : '?'}: Types.UpdateName;`, 4)}`
      : '';

    return stripIndent`
      interface ${data.name}Options {
        telegram: Telegram;
        update?: Interfaces.TelegramUpdate;
        payload: Interfaces.${data.payload};
        updateId${TextService.optional(!data.isUpdateIdRequired ?? true)}: number;${customType}
      }
    `;
  }

  public static generateConstructor(data: Types.ContextData): string {
    return stripIndent`
      constructor(options: ${data.name}Options) {
        super({
          telegram: options.telegram,
          updateType: ${data.hasCustomType ? 'options.type ?? ' : ''}'${data.updateType}',
          updateId: options.updateId,
          update: options.update
        });
    
        this.payload = options.payload;
      }
    `;
  }

  public static generateClassDefinition(data: Types.ContextData): string {
    const description = TextService.comment(data.description);
    
    const lines: string[] = [
      `public payload: Interfaces.${data.payload};`,
      '',
      ...ContextService.generateConstructor(data).split(/\n/)
    ];

    if (data.getters?.length) {
      lines.push('');
      lines.push('/// GETTERS');
      lines.push('');

      for (let i = 0; i < data.getters.length; i++) {
        const getterName: string = data.getters[i];

        const getter: Types.Getter | undefined = GettersService.get(getterName);

        if (!getter) {
          console.log(`[!] Getter \`${getterName}\` not found in getters list`);

          continue;
        }

        const getterCode: string = ContextService.generateGetter(getter);

        lines.push(...TextService.getLines(getterCode));

        if (i !== data.getters.length - 1) {
          lines.push('');
        }
      }
    }

    if (data.methods?.length) {
      lines.push('');
      lines.push('/// METHODS');
      lines.push('');

      for (let i = 0; i < data.methods.length; i++) {
        // const methodName: string = data.methods[i];

        // const method: Types.Method | undefined = GettersService.get(methodName);

        // if (!method) {
        //   console.log(`[!] Method \`${methodName}\` not found in methods list`);

        //   continue;
        // }

        // const methodCode: string = ContextBuilderService.generateGetter(method);

        // lines.push(...TextService.getLines(methodCode));

        // if (i !== data.methods.length - 1) {
        //   lines.push('');
        // }
      }
    }

    return description + stripIndent`
      class ${data.name} extends Context {
        ${TextService.insertLines(lines, 4)}
      }
    `.trimStart();
  }

  public static generateGetter(getter: Types.Getter): string {
    const description = TextService.comment(getter.description);
    const returnType: string = getter.returnType ?? 'any';
    let definition: string = `public get ${getter.name}(): ${returnType}`;

    if (getter.isFunctionGetter) {
      definition = `public ${getter.name}(${(getter.arguments ?? []).join(', ')}): ${returnType}`;
    }

    if (getter.code) {
      return description + stripIndent`
        ${definition} {
          ${TextService.insertLines(getter.code, 5)}
        }
      `;
    }

    if (getter.isOverload) {
      return description + `${definition};`;
    }

    return description + `${definition} { }`;
  }

  public static generateFileName(data: Types.ContextData): string {
    return TextService.kebabize(data.name.replace('Context', '')) + '.ts';
  }

  public static generateInspectableCall(data: Types.ContextData): string {
    let returnClause: string = 'return { };';

    if (data.fields) {
      const lines: string[] = data.fields.map(
        (field, index) => `${field}: payload.${field}${index === data.fields!.length - 1 ? '' : ','}`
      );

      returnClause = stripIndent`
        return {
          ${TextService.insertLines(lines, 5)}
        };
      `;
    }

    const description: string = TextService.comment('Object that will be shown in console when printing');

    return description + stripIndent`
      inspectable(${data.name}, {
        serialize(payload: ${data.name}) {
          ${TextService.insertLines(returnClause, 5)}
        }
      });
    `;
  }
}

export class GettersService {
  public static get(name: string): Types.Getter | undefined {
    return GETTERS.find(getter => getter.name === name);
  }

  public static load(...getters: Types.Getter[][]): string[] {
    return getters.map(getter => getter.map(element => element.name)).flat();
  }
}

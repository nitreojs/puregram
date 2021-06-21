import ts from 'typescript';
import fs from 'fs';

import { stripIndents } from 'common-tags';
import { resolve } from 'path';

import { generateClassInfo, ClassInfo } from './parse-ast';
import { table, generateAnchor, camelizeSmall } from '../doc-methods';

const generateStructureReference = (rawPath: string, fileName: string) => {
  const path: string = resolve(rawPath);

  console.log(`[I] Path resolved: ${path}`);

  const classInfo: ClassInfo | undefined = generateClassInfo([path], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
  });

  if (classInfo === undefined) {
    console.log('[!] No class info found; exiting.');

    return;
  }

  let result: string = stripIndents`
    # \`${classInfo.name}\`

    **${classInfo.comment || '...'}**

    \`\`\`ts
    import { ${classInfo.name} } from 'puregram';
    \`\`\`
  `;

  const className: string = camelizeSmall(classInfo.name!);

  if (classInfo.constructorArguments !== undefined) {
    result += '\n\n' + stripIndents`
      ## Constructor

      \`\`\`ts
      const ${className} = new ${classInfo.name}(${classInfo.constructorArguments.map((argument) => argument.name!).join(', ')});
      \`\`\`

      ${
        table([
          ['Параметр', 'Тип'],
          ...classInfo.constructorArguments.map(
            (argument) => [`\`${argument.name!}\``, `\`${argument.type!}\``]
          )
        ])
      }
    `;
  }

  // getters must be in structures, so

  result += '\n\n' + stripIndents`
    ## Геттеры структуры

    ### Содержание

    ${
      classInfo.getters!.map(
        (getter) => `* [\`${getter.name!}\`](${generateAnchor(getter.name!)})`
      ).join('\n')
    }

    ---

    ${
      classInfo.getters!.map(
        (getter) => {
          const header: string = `### \`${getter.name!}\``;
          const description: string = `**${getter.comment ?? '...'}**`;
          const code: string = stripIndents`
            \`\`\`ts
            ${className}.${getter.name!} // => ${getter.type!}
            \`\`\`
          `;

          return `${header}\n\n${description}\n\n${code}`;
        }
      ).join('\n\n')
    }
  `;
  
  const savePath: string = resolve(`${__dirname}/../../docs/ru/common/structures/${fileName}.md`);

  fs.writeFileSync(savePath, result);

  console.log(`[V] Saved generated reference in ${savePath}`);

  return;
}

const processArgs: string[] = process.argv.slice(2); // e.g. ['chat.ts']

for (const file of processArgs) {
  const [fileName, extension]: string[] = file.split('.');

  generateStructureReference(`${__dirname}/../../packages/puregram/src/common/structures/${fileName}.ts`, fileName);
}

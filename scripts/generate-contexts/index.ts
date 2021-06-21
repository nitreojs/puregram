import { ContextService } from './services';

import data from './data';

for (const context of data) {
  const filename: string = ContextService.generateFileName(context);
  const imports: string = ContextService.generateImports();
  const options: string = ContextService.generateOptions(context);
  const definition: string = ContextService.generateClassDefinition(context);
  const inspectable: string = ContextService.generateInspectableCall(context);

  console.log('/// contexts/' + filename);
  console.log();
  console.log(imports);
  console.log();
  console.log(options);
  console.log();
  console.log(definition);
  console.log();
  console.log(inspectable);
}

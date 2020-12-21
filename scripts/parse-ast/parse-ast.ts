import * as ts from 'typescript';

import { getIdentifierName, getType, parseModifiers } from './utils';

export interface ClassInfo {
  name?: string;
  comment?: string;
  heritage?: string[];
  properties?: PropertyInfo[];
  constructorArguments?: ConstructorArgument[];
  getters?: GetAccessorInfo[];
  setters?: SetAccessorInfo[];
  methods?: PropertyInfo[];
}

interface HasModifiers {
  modifiers?: Set<string>;
}

interface ParameterInfo {
  name?: string;
  type?: string;
  comment?: string;
  isOptional?: boolean;
  isSpread?: boolean;
}

interface ConstructorArgument extends ParameterInfo, HasModifiers {}

interface GetAccessorInfo extends HasModifiers {
  name?: string;
  type?: string;
  comment?: string;
  isOptional?: boolean;
  isNonNull?: boolean;
}

interface SetAccessorInfo extends HasModifiers {
  name?: string;
  comment?: string;
  parameters?: ParameterInfo[];
}

interface PropertyInfo {
  name?: string;
  type?: string;
  comment?: string;
  parameters?: ParameterInfo[];
  isOptional?: boolean;
  isNonNull?: boolean;
  defaultValue?: any;
  modifiers?: Set<string>;
}

let checker: ts.TypeChecker;

export function generateDocumentation(
  fileNames: string[],
  options: ts.CompilerOptions
): ClassInfo | undefined {
  const program: ts.Program = ts.createProgram(fileNames, options);
  checker = program.getTypeChecker();

  let classInfo: ClassInfo | undefined;

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      let tempClassInfo = parseSourceFileStatements(sourceFile.statements);
      
      if (tempClassInfo !== undefined) classInfo = tempClassInfo;
    }
  }

  return classInfo;
}

function parseSourceFileStatements(
  statements: ts.NodeArray<ts.Statement>
): ClassInfo | undefined {
  for (const statement of statements) {
    if (ts.isClassDeclaration(statement)) {
      const classInfo: ClassInfo = {
        constructorArguments: [],
        getters: [],
        setters: [],
        properties: [],
        methods: []
      };

      parseClassDeclaration(<ts.ClassDeclaration>statement, classInfo);

      return classInfo;
    }
  }
}

function parseClassDeclaration(
  declaration: ts.ClassDeclaration,
  classInfo: ClassInfo
): void {
  const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(declaration.name!);
  const className: string = getIdentifierName(declaration.name!);
  const heritageClauses: string[] = [];

  classInfo.name = className;

  if (declaration.heritageClauses) {
    for (const clause of declaration.heritageClauses) {
      for (const type of clause.types) {
        heritageClauses.push((<ts.Identifier>type.expression).text);
      }
    }

    classInfo.heritage = heritageClauses;
  }

  let comment: string | undefined = '';

  if (symbol !== undefined) {
    comment = ts.displayPartsToString(symbol.getDocumentationComment(checker));
  }

  classInfo.comment = comment;

  parseClassMembers(declaration.members, classInfo);
}

function parseClassMembers(
  members: ts.NodeArray<ts.ClassElement>,
  classInfo: ClassInfo
): void {
  for (const member of members) {
    parseClassMember(member, classInfo);
  }
}

function parseClassMember(
  member: ts.ClassElement,
  classInfo: ClassInfo
): void {
  if (member.kind === ts.SyntaxKind.Constructor) {
    return parseConstructor(<ts.ConstructorDeclaration>member, classInfo);
  }

  if (member.kind === ts.SyntaxKind.GetAccessor) {
    return parseGetAccessor(<ts.GetAccessorDeclaration>member, classInfo);
  }

  if (member.kind === ts.SyntaxKind.SetAccessor) {
    return parseSetAccessor(<ts.SetAccessorDeclaration>member, classInfo);
  }

  if (member.kind === ts.SyntaxKind.PropertyDeclaration) {
    return parsePropertyDeclaration(<ts.PropertyDeclaration>member, classInfo);
  }

  if (member.kind === ts.SyntaxKind.MethodDeclaration) {
    return parseMethodDeclaration(<ts.MethodDeclaration>member, classInfo);
  }
}

function parseParameter(parameter: ts.ParameterDeclaration): ParameterInfo {
  const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(parameter.name);
  const symbolObject = (<any>parameter).symbol;

  let parameterInfo: ParameterInfo = {};
  const expression: ts.ParameterDeclaration = <ts.ParameterDeclaration>parameter;

  let name: string = getIdentifierName(<ts.Identifier>expression.name);

  if (symbolObject.escapedName.startsWith('__')) { // that's some destructurized thing here (must be)
    const declarationName = symbolObject.valueDeclaration.name;

    name = getType(declarationName)!;
  }

  const type: string | undefined = getType(expression.type!);
  const isOptional: boolean = expression.questionToken !== undefined;
  const isSpread: boolean = expression.dotDotDotToken !== undefined;

  let comment: string | undefined;

  if (symbol !== undefined) {
    comment = ts.displayPartsToString(symbol.getDocumentationComment(checker));
  }

  parameterInfo = {
    name,
    type,
    comment,
    isOptional,
    isSpread
  };

  return parameterInfo;
}

function parseConstructor(
  declaration: ts.ConstructorDeclaration,
  classInfo: ClassInfo
): void {
  for (const parameter of declaration.parameters) {
    const parameterInfo: ConstructorArgument = parseParameter(parameter);
    const modifiers = parseModifiers(parameter.modifiers!);

    parameterInfo.modifiers = modifiers;

    classInfo.constructorArguments!.push(parameterInfo);
  }
}

function parseGetAccessor(
  declaration: ts.GetAccessorDeclaration,
  classInfo: ClassInfo
): void {
  const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(declaration.name);

  const name: string = getIdentifierName(<ts.Identifier>declaration.name);
  const type: string = getType(declaration.type!)!;
  const modifiers: Set<string> = parseModifiers(declaration.modifiers!);

  let comment: string | undefined;

  if (symbol !== undefined) {
    comment = ts.displayPartsToString(symbol.getDocumentationComment(checker));
  }

  if (name !== undefined) {
    classInfo.getters!.push({
      name,
      comment,
      type,
      modifiers
    });
  }
}

function parseSetAccessor(
  declaration: ts.SetAccessorDeclaration,
  classInfo: ClassInfo
): void {
  const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(declaration.name);
  
  const name: string = getIdentifierName(<ts.Identifier>declaration.name);
  const modifiers: Set<string> = parseModifiers(declaration.modifiers!);
  const parameters: ParameterInfo[] = [];

  let comment: string | undefined;

  if (symbol !== undefined) {
    comment = ts.displayPartsToString(symbol.getDocumentationComment(checker));
  }

  for (const parameter of declaration.parameters) {
    const parameterInfo: ParameterInfo = parseParameter(parameter);

    parameters.push(parameterInfo);
  }

  classInfo.setters!.push({
    name,
    comment,
    modifiers,
    parameters
  });
}

function parsePropertyDeclaration(
  declaration: ts.PropertyDeclaration,
  classInfo: ClassInfo
): void {
  const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(declaration.name);

  const name: string = getIdentifierName(<ts.Identifier>declaration.name);
  const type: string = getType(declaration.type!)!;
  const modifiers: Set<string> = parseModifiers(declaration.modifiers!);
  const isOptional: boolean = declaration.questionToken !== undefined;
  const isNonNull: boolean = declaration.exclamationToken !== undefined;

  let comment: string | undefined;

  if (symbol !== undefined) {
    comment = ts.displayPartsToString(symbol.getDocumentationComment(checker));
  }

  let defaultValue: any;

  if (declaration.initializer !== undefined) {
    // @ts-expect-error
    defaultValue = declaration.initializer.text;
  }

  classInfo.properties!.push({
    name,
    type,
    comment,
    modifiers,
    isOptional,
    isNonNull,
    defaultValue
  });
}

function parseMethodDeclaration(
  declaration: ts.MethodDeclaration,
  classInfo: ClassInfo
): void {
  const symbol: ts.Symbol | undefined = checker.getSymbolAtLocation(declaration.name);

  const name: string = getIdentifierName(<ts.Identifier>declaration.name);
  const type: string = getType(declaration.type!)!;
  const modifiers: Set<string> = parseModifiers(declaration.modifiers!);
  const parameters: ParameterInfo[] = [];
  
  let comment: string | undefined;

  if (symbol !== undefined) {
    comment = ts.displayPartsToString(symbol.getDocumentationComment(checker));
  }

  for (const parameter of declaration.parameters) {
    const parameterInfo: ParameterInfo = parseParameter(parameter);

    parameters.push(parameterInfo);
  }

  classInfo.methods!.push({
    name,
    type,
    comment,
    modifiers,
    parameters
  });
}

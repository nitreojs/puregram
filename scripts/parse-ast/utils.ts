import ts from 'typescript';

const keywordsAndKinds: Record<number, string> = {
  [ts.SyntaxKind.StringKeyword]: 'string',
  [ts.SyntaxKind.NumberKeyword]: 'number',
  [ts.SyntaxKind.NullKeyword]: 'null',
  [ts.SyntaxKind.AnyKeyword]: 'any',
  [ts.SyntaxKind.BooleanKeyword]: 'boolean',
  [ts.SyntaxKind.ObjectKeyword]: 'object',
  [ts.SyntaxKind.TrueKeyword]: 'true',
  [ts.SyntaxKind.FalseKeyword]: 'false',
  [ts.SyntaxKind.UndefinedKeyword]: 'undefined',
  [ts.SyntaxKind.ThisKeyword]: 'this',
  [ts.SyntaxKind.UnknownKeyword]: 'unknown',
  [ts.SyntaxKind.VoidKeyword]: 'void'
};

export const getIdentifierName = (identifier: ts.Identifier): string => (
  identifier.text
);

export const getType = (node: ts.TypeNode): string | undefined => {
  if (node === undefined) return undefined;

  const kind: string = ts.SyntaxKind[node.kind];

  if (kind.includes('Keyword')) {
    return keywordsAndKinds[node.kind];
  }

  if (ts.isIdentifier(node)) {
    return getIdentifierName(<ts.Identifier>node);
  }

  if (ts.isTypeReferenceNode(node)) {
    return resolveTypeReference(<ts.TypeReferenceNode>node);
  }

  if (ts.isUnionTypeNode(node)) {
    return resolveUnionType(<ts.UnionTypeNode>node);
  }

  if (ts.isIntersectionTypeNode(node)) {
    return resolveIntersectionType(<ts.IntersectionTypeNode>node);
  }

  if (ts.isArrayTypeNode(node)) {
    return resolveArrayType(<ts.ArrayTypeNode>node);
  }

  if (ts.isParenthesizedTypeNode(node)) {
    return resolveParenthesizedType(<ts.ParenthesizedTypeNode>node);
  }

  if (ts.isTupleTypeNode(node)) {
    return resolveTupleType(<ts.TupleTypeNode>node);
  }

  if (ts.isLiteralTypeNode(node)) {
    return resolveLiteralType(<ts.LiteralTypeNode>node);
  }

  if (ts.isTypeLiteralNode(node)) {
    return resolveTypeLiteral(<ts.TypeLiteralNode>node);
  }

  if (ts.isIndexedAccessTypeNode(node)) {
    return resolveIndexedAccessTypeNode(<ts.IndexedAccessTypeNode>node);
  }

  if (ts.isArrayBindingPattern(node)) {
    return resolveArrayBindingPattern(<ts.ArrayBindingPattern>node);
  }

  if (ts.isObjectBindingPattern(node)) {
    return resolveObjectBindingPattern(<ts.ObjectBindingPattern>node);
  }

  console.log(`[!] Unresolved syntax kind: ${ts.SyntaxKind[node.kind]}`);
};

export const resolveTypeReference = (node: ts.TypeReferenceNode): string => {
  if ((<any>node).objectType !== undefined) {
    return resolveTypeReference(<ts.TypeReferenceNode>(<any>node).objectType);
  }

  const typeName: ts.Identifier = <ts.Identifier>node.typeName;
  const { text } = typeName;

  if (node.typeArguments === undefined) return text;

  const typeArguments: (string | undefined)[] = [];

  for (const argument of node.typeArguments) {
    typeArguments.push(getType(argument));
  }

  return `${text}<${typeArguments.filter(Boolean).join(', ')}>`;
};

export const resolveUnionType = (node: ts.UnionTypeNode): string => (
  node.types.map(getType).join(' | ')
);

export const resolveIntersectionType = (node: ts.IntersectionTypeNode): string => (
  node.types.map(getType).join(' & ')
);

export const resolveArrayType = (node: ts.ArrayTypeNode): string => {
  const type: string = getType(node.elementType)!;

  return `${type}[]`;
};

export const resolveParenthesizedType = (node: ts.ParenthesizedTypeNode): string => {
  const type: string = getType(node.type)!;

  return `(${type})`;
};

export const resolveTupleType = (node: ts.TupleTypeNode): string => {
  const elements: string[] = <string[]>node.elements.map(getType);

  return `[${elements.join(', ')}]`;
};

export const resolveLiteralType = (node: ts.LiteralTypeNode): string => {
  const { kind } = node.literal;

  if (kind === ts.SyntaxKind.FirstLiteralToken ||
      kind === ts.SyntaxKind.LastLiteralToken ||
      kind === ts.SyntaxKind.BigIntLiteral) {
    // @ts-expect-error
    return node.literal.text;
  }

  if (kind === ts.SyntaxKind.StringLiteral) {
    // @ts-expect-error
    return `'${node.literal.text}'`;
  }

  const literal: string = keywordsAndKinds[kind];

  return literal;
};

export const resolveTypeLiteral = (node: ts.TypeLiteralNode): string => {
  const members: string[] = [];

  for (const member of node.members) {
    members.push(resolvePropertySignature(<ts.PropertySignature>member));
  }

  return `{ ${members.join(', ')} }`;
};

export const resolvePropertySignature = (member: ts.PropertySignature): string => {
  const name: string = getIdentifierName(<ts.Identifier>member.name);
  const type: string = getType(member.type!)!;
  const isOptional: boolean = member.questionToken !== undefined;

  return `${name}${isOptional ? '?' : ''}: ${type}`;
};

export const resolveIndexedAccessTypeNode = (node: ts.IndexedAccessTypeNode): string => {
  // probably a type reference:
  // IMessageContextPayload['message']['geo']
  // :shrug:

  const name: string = resolveTypeReference(<ts.TypeReferenceNode>node.objectType);
  const accessor: string = (<any>(<ts.LiteralTypeNode>node.indexType).literal).text;

  return `${name}['${accessor}']`;
};

export const resolveArrayBindingPattern = (node: ts.ArrayBindingPattern): string => {
  const elements: string[] = [];

  for (const element of node.elements) {
    const name = <any>(<ts.BindingElement>element).name;

    elements.push(getType(name)!);
  }

  return `[${elements.join(', ')}]`;
}

export const resolveObjectBindingPattern = (node: ts.ObjectBindingPattern): string => {
  const elements: string[] = [];

  for (const element of node.elements) {
    const name = <any>(<ts.BindingElement>element).name;

    elements.push(getType(name)!);
  }

  return `{ ${elements.join(', ')} }`;
};

export const parseModifiers = (modifiers: ts.ModifiersArray): Set<string> => {
  const set: Set<string> = new Set<string>();

  if (modifiers === undefined) return set;

  for (const modifier of modifiers) {
    if (modifier.kind === ts.SyntaxKind.ReadonlyKeyword) set.add('readonly');
    
    if (modifier.kind === ts.SyntaxKind.PublicKeyword) set.add('public');
    if (modifier.kind === ts.SyntaxKind.PrivateKeyword) set.add('private');
    if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) set.add('protected');

    if (modifier.kind === ts.SyntaxKind.StaticKeyword) set.add('static');

    if (modifier.kind === ts.SyntaxKind.AsyncKeyword) set.add('async');
  }

  return set;
};

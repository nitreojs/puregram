import ts, { factory } from 'typescript'

import { camelize, camelizeSmall } from '../doc-methods'

import { Field } from './field'
import { Interface } from './interface'

import { getOriginalClassname } from './utils'

export class DecoratorsCodeGenerator {
  static nullable = ts.factory.createPropertyAssignment(
    ts.factory.createIdentifier('nullable'),
    ts.factory.createFalse()
  )

  static compute = ts.factory.createPropertyAssignment(
    ts.factory.createIdentifier('compute'),
    ts.factory.createTrue()
  )

  static inspect (field: Field) {
    return DecoratorsCodeGenerator.create('Inspect', field)
  }

  static getArgs (field: Field) {
    const decoratorArguments: ts.Expression[] = []
    const propertyAssignments: ts.PropertyAssignment[] = []

    if (field.hasVerb()) {
      propertyAssignments.push(DecoratorsCodeGenerator.compute)
    }

    if (field.isOptional()) {
      propertyAssignments.push(DecoratorsCodeGenerator.nullable)
    }

    decoratorArguments.push(
      ts.factory.createObjectLiteralExpression(propertyAssignments)
    )

    return decoratorArguments
  }

  static create (name: string, field?: Field) {
    return ts.factory.createDecorator(
      ts.factory.createCallExpression(
        ts.factory.createIdentifier(name),
        undefined,
        field !== undefined ? DecoratorsCodeGenerator.getArgs(field) : []
      )
    )
  }
}

// INFO: what a sophisticated name behind this class huh?
export class CodeGenerator {
  static imports () {
    return [
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier('Inspect')
            ),
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier('Inspectable')
            )
          ])
        ),
        ts.factory.createStringLiteral('inspectable'),
        undefined
      ),

      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamespaceImport(
            ts.factory.createIdentifier('Interfaces')
          )
        ),
        ts.factory.createStringLiteral('../../generated/telegram-interfaces'),
        undefined
      ),

      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier('Structure')
            )
          ])
        ),
        ts.factory.createStringLiteral('../../types/interfaces'),
        undefined
      )
    ]
  }

  static ctor (classname: string) {
    return ts.factory.createConstructorDeclaration(
      undefined,
      [
        ts.factory.createParameterDeclaration(
          [
            ts.factory.createToken(
              ts.SyntaxKind.PublicKeyword
            )
          ],
          undefined,
          ts.factory.createIdentifier('payload'),
          undefined,
          ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
              ts.factory.createIdentifier('Interfaces'),
              ts.factory.createIdentifier(`Telegram${classname}`)
            ),
            undefined
          ),
          undefined
        )
      ],
      ts.factory.createBlock(
        [],
        false
      )
    )
  }

  static toStringTag () {
    return ts.factory.createGetAccessorDeclaration(
      undefined,
      ts.factory.createComputedPropertyName(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier('Symbol'),
          ts.factory.createIdentifier('toStringTag')
        )
      ),
      [],
      undefined,
      ts.factory.createBlock(
        [
          ts.factory.createReturnStatement(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createThis(),
                ts.factory.createIdentifier('constructor')
              ),
              ts.factory.createIdentifier('name')
            )
          )
        ],
        true
      )
    )
  }

  static comment (comment: string) {
    // TODO: *True* -> `true`, *False* -> `false` etc.
    return ts.factory.createJSDocComment(comment)
  }

  // TODO: additional getters/methods...
  static get (classname: string, field: Field) {
    const originalClassname = getOriginalClassname(classname)

    // INFO: classname -> field.startsWith(classname.toLowerCase()) ? slice((classname+_).length) : ...
    //       untested
    const name = field.name.startsWith(originalClassname.toLowerCase() + '_')
      ? field.name.slice(originalClassname.length + 1)
      : field.name

    // INFO: Field -> hasVerb() ? { compute: true } + transform into method()
    if (field.hasVerb()) {
      return CodeGenerator.getMethod(field)
    }

    let block: ts.Block = ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createThis(),
              ts.factory.createIdentifier('payload')
            ),
            ts.factory.createIdentifier(field.name)
          )
        )
      ],
      true
    )

    // INFO: isTypeReference() ? return new [return-type](field.name)
    // INFO: isTypeReference() + isOptional()
    //         ? [ const { v } = this.payload ; if (!v) { return } ; return new V(v) ]
    if (field.type.isTypeReference()) {
      const returnNewExpressionValue = !field.isOptional()
        ? ts.factory.createPropertyAccessExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            ts.factory.createIdentifier('payload')
          ),
          ts.factory.createIdentifier(field.name)
        )
        : ts.factory.createIdentifier(field.name)

      const returnNewExpression = ts.factory.createReturnStatement(
        ts.factory.createNewExpression(
          ts.factory.createIdentifier(camelize(getOriginalClassname(field.type.toString()))),
          undefined,
          [returnNewExpressionValue]
        )
      )

      if (field.isOptional()) {
        block = ts.factory.createBlock(
          [
            ts.factory.createVariableStatement(
              undefined,
              ts.factory.createVariableDeclarationList(
                [
                  ts.factory.createVariableDeclaration(
                    ts.factory.createObjectBindingPattern(
                      [
                        ts.factory.createBindingElement(
                          undefined,
                          undefined,
                          ts.factory.createIdentifier(field.name)
                        )
                      ]
                    ),
                    undefined,
                    undefined,
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createThis(),
                      ts.factory.createIdentifier('payload')
                    )
                  )
                ],
                ts.NodeFlags.Const
              )
            ),
            ts.factory.createIfStatement(
              ts.factory.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                ts.factory.createIdentifier(field.name)
              ),
              ts.factory.createBlock(
                [
                  ts.factory.createReturnStatement(undefined)
                ],
                true
              )
            ),
            returnNewExpression
          ],
          true
        )
      } else {
        block = ts.factory.createBlock([returnNewExpression], true)
      }
    } else if (field.type.isArray()) {
      const mappedValue = !field.isOptional()
        ? ts.factory.createPropertyAccessExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            ts.factory.createIdentifier('payload')
          ),
          ts.factory.createIdentifier(field.name)
        )
        : ts.factory.createIdentifier(field.name)

      const newExpression = ts.factory.createNewExpression(
        ts.factory.createIdentifier(camelize(getOriginalClassname(field.type.toString()))),
        undefined,
        [mappedValue]
      )

      const mapExpression = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          mappedValue,
          ts.factory.createIdentifier('map')
        ),
        undefined,
        [
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                ts.factory.createIdentifier('v'),
                undefined,
                undefined,
                undefined
              )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            newExpression
          )
        ]
      )

      // TODO

      // console.log(mapExpression)
    }

    return [
      CodeGenerator.comment(field.comment),
      ts.factory.createGetAccessorDeclaration(
        [DecoratorsCodeGenerator.inspect(field)],
        ts.factory.createIdentifier(camelizeSmall(name)),
        [],
        undefined,
        block
      )
    ]
  }

  static getMethod (field: Field) {
    return [
      CodeGenerator.comment(field.comment),
      ts.factory.createMethodDeclaration(
        [DecoratorsCodeGenerator.inspect(field)],
        undefined,
        ts.factory.createIdentifier(camelizeSmall(field.name)),
        undefined,
        undefined,
        [],
        undefined,
        ts.factory.createBlock(
          [
            ts.factory.createReturnStatement(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createThis(),
                  ts.factory.createIdentifier('payload')
                ),
                ts.factory.createIdentifier(field.name)
              )
            )
          ],
          true
        )
      )
    ]
  }

  static toJSON () {
    return ts.factory.createMethodDeclaration(
      undefined,
      undefined,
      ts.factory.createIdentifier('toJSON'),
      undefined,
      undefined,
      [],
      undefined,
      ts.factory.createBlock(
        [
          ts.factory.createReturnStatement(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createThis(),
              ts.factory.createIdentifier('payload')
            )
          )
        ],
        true
      )
    )
  }

  // TODO: holy shit there needs to be some work done
  static class (iface: Interface) {
    // const methods = iface.fields.map(f => CodeGenerator.get(iface.name, f)).flat()

    return ts.factory.createClassDeclaration(
      [DecoratorsCodeGenerator.create('Inspectable')],
      ts.factory.createIdentifier(iface.name),
      undefined,
      [
        ts.factory.createHeritageClause(
          ts.SyntaxKind.ImplementsKeyword,
          [
            ts.factory.createExpressionWithTypeArguments(
              ts.factory.createIdentifier('Structure'),
              undefined
            )
          ]
        )
      ],
      [
        CodeGenerator.ctor(getOriginalClassname(iface.name)),
        CodeGenerator.toStringTag(),
        // ...methods,
        CodeGenerator.toJSON()
      ]
    )
  }
}

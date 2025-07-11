import path from 'path'

import micromatch from 'micromatch'

import {isComponentName, isHookName} from '../../utils'

import type {TSESTree} from '@typescript-eslint/utils'
import type {Rule} from 'eslint'

export const getUseClientHookMessage = (causes: string) =>
    `This file contains client-side React Hooks "${causes}", but it lacks the required 'use client' directive`

function getFunctionName(callee: TSESTree.Expression | TSESTree.Super): string | null {
    if (callee.type === 'Super') {
        return 'super'
    }

    switch (callee.type) {
        case 'Identifier':
            return callee.name

        case 'MemberExpression': {
            const object = callee.object
            const property = callee.property

            const objectName = getFunctionName(object)
            const propertyName = property.type === 'Identifier' ? property.name : null

            if (objectName && propertyName) {
                return `${objectName}.${propertyName}`
            }
            return null
        }

        case 'ChainExpression':
            return getFunctionName(callee.expression)

        case 'CallExpression':
            return getFunctionName(callee.callee)

        case 'ThisExpression':
            return 'this'

        default:
            return null
    }
}

const rules: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        fixable: 'code',
        docs: {
            description: "Add 'use client' directive if client side hooks are used in a React file",
        },
        schema: [
            {
                type: 'object',
                properties: {
                    ignorePath: {
                        anyOf: [
                            {type: 'string'},
                            {
                                type: 'array',
                                items: {type: 'string'},
                            },
                        ],
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    create(context) {
        const {ignorePath = []} = context.options[0] || {}
        const filePath = path.relative(context.cwd, context.filename)
        const isIgnore = micromatch.isMatch(filePath, ignorePath)

        if (isIgnore) {
            return {}
        }

        let hasUseClientDirective = false
        let hasUseServerDirective = false
        let hasHooks = false

        const cause = new Set<string>()

        return {
            Program(node) {
                // use client, use strict 지시자 유무 확인
                for (const child of node.body) {
                    if (child.type === 'ExpressionStatement' && child.expression.type === 'Literal') {
                        if (child.expression.value === 'use client') {
                            hasUseClientDirective = true
                        }

                        if (child.expression.value === 'use server') {
                            hasUseServerDirective = true
                        }

                        if (hasUseClientDirective || hasUseServerDirective) {
                            break
                        }
                    }
                }
            },
            CallExpression(node) {
                // 이미 'use client' 지시자가 존재하거나 hook 확인 완료 시, early return
                if (hasUseClientDirective || hasUseServerDirective) {
                    return
                }

                // 함수 호출 내역 중 hook이 아닌 경우 early return
                const isIdentifierTypeHook = node.callee.type === 'Identifier' && isHookName(node.callee.name)
                const isMemberExpressionTypeHook =
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    (node.callee.object.name === 'React' || node.callee.object.name === 'react') &&
                    node.callee.property.type === 'Identifier' &&
                    isHookName(node.callee.property.name)

                if (!(isIdentifierTypeHook || isMemberExpressionTypeHook)) {
                    return
                }

                // hook 호출 위치 체크 : function MyComponent() {} || const MyComponent = () => {} 여부 확인
                const ancestors = context.sourceCode.getAncestors(node)

                for (const ancestorNode of ancestors) {
                    // function MyComponent() {} 형태 컴포넌트
                    const isFunctionComponent =
                        ancestorNode.type === 'FunctionDeclaration' &&
                        ancestorNode.id &&
                        ancestorNode.id.name &&
                        isComponentName(ancestorNode.id.name)

                    // const MyComponent = () => {} 형태 컴포넌트
                    const isArrowFunctionComponent =
                        ancestorNode.type === 'VariableDeclarator' &&
                        ancestorNode.id.type === 'Identifier' &&
                        isComponentName(ancestorNode.id.name) &&
                        ancestorNode.init &&
                        ancestorNode.init.type === 'ArrowFunctionExpression'

                    if (isArrowFunctionComponent || isFunctionComponent) {
                        cause.add(getFunctionName(node.callee as TSESTree.Expression | TSESTree.Super) || '')
                        hasHooks = true
                        return
                    }
                }
            },
            'Program:exit'(node) {
                if (hasHooks && !hasUseClientDirective && cause.size > 0) {
                    context.report({
                        node,
                        message: getUseClientHookMessage(Array.from(cause).join(', ')),
                        fix(fixer) {
                            return fixer.insertTextBefore(node, `'use client'\n`)
                        },
                    })
                }
            },
        }
    },
}

export default rules

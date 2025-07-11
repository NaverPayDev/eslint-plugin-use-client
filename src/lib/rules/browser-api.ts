import path from 'path'

import micromatch from 'micromatch'

import browserApiList from './browser-globals'

import type {TSESTree} from '@typescript-eslint/utils'
import type {Rule} from 'eslint'

export const getBrowserApiHookMessage = (causes: string) =>
    `This file contains browser api "${causes}", but it lacks the required 'use client' directive`

function isReadReference(node: TSESTree.Identifier) {
    const parent = node.parent

    if (!parent) return false

    // 변수 참조 또는 함수 호출
    if (
        (parent.type === 'MemberExpression' && parent.object === node) ||
        (parent.type === 'CallExpression' && parent.callee === node) ||
        parent.type === 'Identifier' || // 단독 식별자 (ex. console;)
        (parent.type === 'VariableDeclarator' && parent.init === node)
    ) {
        return true
    }

    return false
}

const rules: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        fixable: 'code',
        docs: {
            description: "Add 'use client' directive if browser api is used in a React file",
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
        let hasBrowserAPI = false

        const cause = new Set<string>()

        const browserGlobals = new Set(browserApiList)

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
            Identifier(node) {
                if (hasUseClientDirective || hasUseServerDirective) {
                    return
                }

                if (browserGlobals.has(node.name)) {
                    // 글로벌 브라우저 객체인지 확인
                    const scope = context.sourceCode.getScope(node)
                    const variable = scope.set.get(node.name)

                    const isGlobal = !variable || variable.defs.length === 0
                    const isRelevantUse = isReadReference(node as TSESTree.Identifier)

                    if (isGlobal && isRelevantUse) {
                        hasBrowserAPI = true
                        cause.add(node.name || '')
                    }
                }
            },

            'Program:exit'(node) {
                // use client 지시자 없음 && 브라우저 api 있음
                if (!hasUseClientDirective && hasBrowserAPI && cause.size > 0) {
                    context.report({
                        node,
                        message: getBrowserApiHookMessage(Array.from(cause).join(', ')),
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

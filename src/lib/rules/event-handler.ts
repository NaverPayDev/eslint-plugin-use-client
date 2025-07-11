import path from 'path'

import micromatch from 'micromatch'

import type {TSESTree} from '@typescript-eslint/utils'
import type {Rule} from 'eslint'

export const getEventHandlerHookMessage = (causes: string) =>
    `This file contains HTML elements with event handler "${causes}", but it lacks the required 'use client' directive`

const rules: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        fixable: 'code',
        docs: {
            description: "Add 'use client' directive if event handlers are used in a React file",
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
        let hasEventHandler = false

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
            JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
                if (hasUseClientDirective || hasUseServerDirective) {
                    return
                }

                const tagName = node.name.type === 'JSXIdentifier' ? node.name.name : null

                // HTML 태그인지 확인 (소문자로 시작하는 태그)
                if (typeof tagName === 'string' && /^[a-z]/.test(tagName)) {
                    const currentStatus = node.attributes.some((attr) => {
                        const hasOnEventHandler =
                            attr.type === 'JSXAttribute' &&
                            attr.name.type === 'JSXIdentifier' &&
                            /^on[A-Z]/.test(attr.name.name)

                        if (hasOnEventHandler) {
                            cause.add((attr.name.name || '') as string)
                        }

                        return hasOnEventHandler
                    })

                    // 한번 hasEventHandler가 true면 덮어쓰지 않도록
                    hasEventHandler = hasEventHandler || currentStatus
                }
            },
            'Program:exit'(node) {
                // html tag의 이벤트 핸들러 있음 && use client 지시자 없음
                if (hasEventHandler && !hasUseClientDirective && cause.size > 0) {
                    context.report({
                        node,
                        message: getEventHandlerHookMessage(Array.from(cause).join(', ')),
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

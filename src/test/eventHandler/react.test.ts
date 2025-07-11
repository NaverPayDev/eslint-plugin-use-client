import {RuleTester} from 'eslint'
import {describe} from 'vitest'
import {it} from 'vitest'

import rule, {getEventHandlerHookMessage} from '../../lib/rules/event-handler'
import {readFileAsString} from '../utils'

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
})

describe('if there is an event handler, add use client directive', () => {
    it('1. When adding an event handler to an HTML tag, make sure to include the "use client" directive', () => {
        const valid = readFileAsString(__dirname, './cases/case1.valid.tsx')
        const invalid = readFileAsString(__dirname, './cases/case1.invalid.tsx')

        ruleTester.run(
            'When adding an event handler to an HTML tag, make sure to include the "use client" directive',
            rule,
            {
                valid: [
                    {
                        code: valid,
                    },
                ],
                invalid: [
                    {
                        code: invalid,
                        output: valid,
                        errors: [{message: getEventHandlerHookMessage(['onClick'].join(','))}],
                    },
                ],
            },
        )
    })
    it('2. ignore check react component event handler', () => {
        const valid = readFileAsString(__dirname, './cases/case2.valid.tsx')

        ruleTester.run('ignore check react component event handler', rule, {
            valid: [
                {
                    code: valid,
                },
            ],
            invalid: [],
        })
    })
})

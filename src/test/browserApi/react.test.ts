import {RuleTester} from 'eslint'
import {describe} from 'vitest'
import {it} from 'vitest'

import rule, {getBrowserApiHookMessage} from '../../lib/rules/browser-api'
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

describe('if there is an browser api, add use client directive', () => {
    it('1. ', () => {
        const valid = readFileAsString(__dirname, './cases/case1.valid.tsx')
        const invalid = readFileAsString(__dirname, './cases/case1.invalid.tsx')

        ruleTester.run('When using browser api, make sure to include the "use client" directive', rule, {
            valid: [
                {
                    code: valid,
                },
            ],
            invalid: [
                {
                    code: invalid,
                    output: valid,
                    errors: [{message: getBrowserApiHookMessage(['window'].join(','))}],
                },
            ],
        })
    })
})

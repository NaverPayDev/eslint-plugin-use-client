import {RuleTester} from 'eslint'
import {describe, it} from 'vitest'

import rule, {getUseClientHookMessage} from '../../lib/rules/use-client-hook'
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

const createTestCallback = (caseNo: number, message: string, isInvalidCheck: boolean, causes: string[]) => {
    return () => {
        const valid = readFileAsString(__dirname, `./cases/case${caseNo}.valid.tsx`)
        const invalid = isInvalidCheck ? readFileAsString(__dirname, `./cases/case${caseNo}.invalid.tsx`) : ''

        ruleTester.run(message, rule, {
            valid: [
                {
                    code: valid,
                },
            ],
            invalid: isInvalidCheck
                ? [
                      {
                          code: invalid,
                          output: valid,
                          errors: [{message: getUseClientHookMessage(causes.join(','))}],
                      },
                  ]
                : [],
        })
    }
}

const TEST_DATA = [
    {
        message: `1. add 'use client' when react hooks exist in Function Component`,
        caseNo: 1,
        isInvalidCheck: true,
        causes: ['useState'],
    },
    {
        message: `2. add 'use client' when react hooks exist in Arrow Function Component`,
        caseNo: 2,
        isInvalidCheck: true,
        causes: ['useState'],
    },
    {
        message: `3. ignore rule when 'use + [a-z]' named function`,
        caseNo: 3,
        isInvalidCheck: false,
        causes: ['useState'],
    },
    {
        message: `4. ignore check when hooks are called outside React Component`,
        caseNo: 4,
        isInvalidCheck: false,
        causes: ['useState'],
    },
    {
        message: `5. distinguish annotation 'use client' form real directive`,
        caseNo: 5,
        isInvalidCheck: true,
        causes: ['useState'],
    },
    {
        message: `6. add 'use client' when it comes with 'use strict' directive`,
        caseNo: 6,
        isInvalidCheck: true,
        causes: ['useState'],
    },
    {
        message: `7. ignore 'use client' when 'use strict' directive already exists`,
        caseNo: 7,
        isInvalidCheck: false,
        causes: ['useState'],
    },
    {
        message: `8. add 'use client' when React.{hook} exists`,
        caseNo: 8,
        isInvalidCheck: true,
        causes: ['React.useState'],
    },
    {message: `9. add 'use client' when react.{hook} exists`, caseNo: 9, isInvalidCheck: false, causes: ['useState']},
]

describe('use client hook', () => {
    for (const data of TEST_DATA) {
        it(data.message, createTestCallback(data.caseNo, data.message, data.isInvalidCheck, data.causes))
    }
})

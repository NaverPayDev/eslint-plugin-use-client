/* eslint-disable no-console */

import {readFileSync, writeFileSync} from 'fs'
import {createRequire} from 'module'

import ts from 'typescript'

function getDomSet() {
    const require = createRequire(import.meta.url)
    const libDomPath = require.resolve(`typescript/lib/lib.dom.d.ts`)
    const source = readFileSync(libDomPath, 'utf-8')
    const sourceFile = ts.createSourceFile('lib.dom.d.ts', source, ts.ScriptTarget.Latest, true)
    const set = new Set()

    let currentNamespace = null

    const visit = (node) => {
        if (ts.isModuleDeclaration(node)) {
            if (ts.isIdentifier(node.name)) {
                currentNamespace = node.name.text
            }

            if (node.body && ts.isModuleBlock(node.body)) {
                node.body.statements.forEach(visit)
            }

            currentNamespace = null
            return
        }

        // CSS 네임스페이스 내부는 제외
        if (currentNamespace === 'CSS') {
            return
        }

        if (ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) {
            if ('name' in node && node.name && ts.isIdentifier(node.name)) {
                set.add(node.name.text)
            }

            if (ts.isVariableStatement(node)) {
                node.declarationList.declarations.forEach((decl) => {
                    if (ts.isIdentifier(decl.name)) {
                        set.add(decl.name.text)
                    }
                })
            }
        }

        ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    console.log(`${Array.from(set).length}개 브라우저 전역 객체를 추출했습니다.\n`)

    return set
}

function getNodeSet(fileName) {
    const require = createRequire(import.meta.url)
    const libPath = require.resolve(`@types/node/${fileName}`)
    const source = readFileSync(libPath, 'utf8')
    const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest)

    const set = new Set()

    function visitGlobalScope(node) {
        // interface URL, type XXX, var XXX 등 처리
        if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
            if (node.name) {
                set.add(String(node.name.text).toLowerCase())
            }
        }

        if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach((decl) => {
                if (ts.isIdentifier(decl.name)) {
                    set.add(String(decl.name.text).toLowerCase())
                }
            })
        }
    }

    function visit(node) {
        // 글로벌 선언 블록 처리
        if (ts.isModuleDeclaration(node) && node.name.text === 'global') {
            if (node.body && ts.isModuleBlock(node.body)) {
                ts.forEachChild(node.body, visitGlobalScope)
            }
            return
        }

        const isExported = (node.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword)

        if (
            isExported &&
            (ts.isInterfaceDeclaration(node) ||
                ts.isTypeAliasDeclaration(node) ||
                ts.isClassDeclaration(node) ||
                ts.isFunctionDeclaration(node) ||
                ts.isVariableStatement(node)) &&
            ('name' in node ? node.name !== undefined : true)
        ) {
            if ('name' in node && node.name && ts.isIdentifier(node.name)) {
                set.add(String(node.name.text).toLowerCase())
            }
            if (ts.isVariableStatement(node)) {
                node.declarationList.declarations.forEach((decl) => {
                    if (ts.isIdentifier(decl.name)) {
                        set.add(String(decl.name.text).toLowerCase())
                    }
                })
            }
        }

        ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    console.log(`${Array.from(set).length}개 node 객체를 ${fileName}에서 추출했습니다.`)

    return set
}

// dom에서 사용하는 api set형태로 반환
const domSet = getDomSet()

// node에서 사용하는 api set형태로 반환
const nodeModuleFiles = [
    'globals.d.ts',
    'assert.d.ts',
    'assert/strict.d.ts',
    'async_hooks.d.ts',
    'buffer.d.ts',
    'child_process.d.ts',
    'cluster.d.ts',
    'console.d.ts',
    'constants.d.ts',
    'crypto.d.ts',
    'dgram.d.ts',
    'diagnostics_channel.d.ts',
    'dns.d.ts',
    'dns/promises.d.ts',
    'dns/promises.d.ts',
    'domain.d.ts',
    'dom-events.d.ts',
    'events.d.ts',
    'fs.d.ts',
    'fs/promises.d.ts',
    'http.d.ts',
    'http2.d.ts',
    'https.d.ts',
    'inspector.d.ts',
    'module.d.ts',
    'net.d.ts',
    'os.d.ts',
    'path.d.ts',
    'perf_hooks.d.ts',
    'process.d.ts',
    'punycode.d.ts',
    'querystring.d.ts',
    'readline.d.ts',
    'readline/promises.d.ts',
    'repl.d.ts',
    'sea.d.ts',
    'stream.d.ts',
    'stream/promises.d.ts',
    'stream/consumers.d.ts',
    'stream/web.d.ts',
    'string_decoder.d.ts',
    'test.d.ts',
    'timers.d.ts',
    'timers/promises.d.ts',
    'tls.d.ts',
    'trace_events.d.ts',
    'tty.d.ts',
    'url.d.ts',
    'util.d.ts',
    'v8.d.ts',
    'vm.d.ts',
    'wasi.d.ts',
    'worker_threads.d.ts',
    'zlib.d.ts',
    'buffer.buffer.d.ts',
]

const ignoreNameList = [
    'setInterval',
    'setTimeout',
    'clearTimeout',
    'clearInterval',
    'queueMicrotask',
    'structuredClone',
    'atob',
    'btoa',
    'fetch',
].map((name) => name.toLowerCase())

const nodeSetFromFiles = nodeModuleFiles.reduce(
    (acc, fileName) => new Set([...acc, ...getNodeSet(fileName)]),
    new Set(),
)

const nodeSet = new Set([...nodeSetFromFiles, ...ignoreNameList])

const duplicatedApiList = []

const pureDomApiList = Array.from(domSet)
    .filter((api) => {
        const isDuplicated = nodeSet.has(String(api).toLowerCase())

        if (isDuplicated) {
            duplicatedApiList.push(api)
        }

        return !isDuplicated
    })
    .sort()
const contents = `export default ${JSON.stringify(pureDomApiList, null, 4)}\n`

writeFileSync('./src/lib/rules/browser-globals.ts', contents)

console.log(`\n✅ ${pureDomApiList.length}개 필터링된 브라우저 객체를 추출했습니다.`)
console.log(`양쪽에서 사용가능하다고 판단된 api 목록 : ${duplicatedApiList.join(', ')}`)

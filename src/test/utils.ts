import fs from 'fs'
import path from 'path'

export function readFileAsString(dirname: string, relativePath: string) {
    const fullPath = path.resolve(dirname, relativePath)
    return fs.readFileSync(fullPath, 'utf8')
}

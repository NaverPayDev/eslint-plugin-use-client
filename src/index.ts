import pkg from '../package.json'
import browserApi from './lib/rules/browser-api'
import eventHandler from './lib/rules/event-handler'
import useClientHook from './lib/rules/use-client-hook'

export default {
    meta: {
        name: pkg.name,
        version: pkg.version,
    },
    rules: {
        'event-handler': eventHandler,
        'use-client-hook': useClientHook,
        'browser-api': browserApi,
    },
}

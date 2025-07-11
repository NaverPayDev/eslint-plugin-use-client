export const isComponentName = (s: string): boolean => {
    return /^[A-Z][a-zA-Z0-9]*$/.test(s)
}

export const isHookName = (s: string): boolean => {
    return s === 'use' || /^use[A-Z0-9]/.test(s)
}

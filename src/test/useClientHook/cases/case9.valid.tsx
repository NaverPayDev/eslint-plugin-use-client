'use client'
import react from 'react'

export function Test1() {
    const [sample] = react.useState('hello world')
    return <div>{sample}</div>
}

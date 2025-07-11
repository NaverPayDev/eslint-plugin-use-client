'use client'
import {useState} from 'react'

export function Test() {
    const [sample] = useState('hello world')
    return <div>{sample}</div>
}

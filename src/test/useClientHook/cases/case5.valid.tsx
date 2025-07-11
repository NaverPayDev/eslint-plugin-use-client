// 'use client'

'use client'
import {useState} from 'react'

export function Test1() {
    const [sample] = useState('hello world')
    return <div>{sample}</div>
}

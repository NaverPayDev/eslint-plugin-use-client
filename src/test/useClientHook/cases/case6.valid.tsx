'use client'
'use strict'

import {useState} from 'react'

export function Test1() {
    const [sample] = useState('hello world')
    return <div>{sample}</div>
}

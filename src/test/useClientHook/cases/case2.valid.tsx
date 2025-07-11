'use client'
import {useState} from 'react'

const SampleComponent = () => {
    const [sample] = useState('hello world')
    return <div>{sample}</div>
}

export default SampleComponent

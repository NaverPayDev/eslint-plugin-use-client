import React from 'react'

export function Test1() {
    const [sample] = React.useState('hello world')
    return <div>{sample}</div>
}

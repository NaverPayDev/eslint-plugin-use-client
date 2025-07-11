'use client'
import {useCallback} from 'react'

export function Test1() {
    const handleClickButton = useCallback(() => {
        // something to do
    }, [])

    return <button onClick={handleClickButton} />
}

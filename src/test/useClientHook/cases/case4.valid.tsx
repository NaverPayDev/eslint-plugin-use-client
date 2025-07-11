import {useEffect, useState} from 'react'

const useCustomHook = () => {
    const [sample, setSample] = useState('hello')

    useEffect(() => {
        setSample('world')
    }, [])

    return sample
}

export default useCustomHook

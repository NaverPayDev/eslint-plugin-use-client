import {useCallback} from 'react'

export function Test1() {
    const handleClickButton = useCallback(() => {
        window.location.href = 'https://naver.com'
    }, [])

    return <button onClick={handleClickButton} />
}

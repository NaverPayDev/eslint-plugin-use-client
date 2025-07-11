import {MyButton} from './common'

export function Test2() {
    const handleClickButton = () => {
        // something to do
    }

    /**
     * 리액트 컴포넌트의 이벤트 핸들러는 use client 지시자를 붙이지 않는다.
     * 서버 컴포넌트에서 클라이언트 컴포넌트의 props로 이벤트 핸들러를 넘기는 등의 예외 케이스가 있기에 보수적으로 접근한다.
     */
    return <MyButton onClick={handleClickButton} />
}

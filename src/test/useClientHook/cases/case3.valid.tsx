const userNameFunction = () => {
    return '이건 훅이 아니예요! 그냥 함수입니다~'
}

const TestComponent = () => {
    userNameFunction()
    return <div>hello world</div>
}

export default TestComponent

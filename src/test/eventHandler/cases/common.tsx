// 테스트를 위한 export 컴포넌트 정의를 위해 사용

export function MyButton({onClick}: {onClick: () => void}) {
    return <button onClick={onClick} />
}

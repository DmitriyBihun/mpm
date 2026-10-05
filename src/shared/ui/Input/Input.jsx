import { forwardRef } from 'react'
import style from './Input.module.css'

const Input = forwardRef(({ className = '', error, ...props }, ref) => {
    return (
        <div className={style.inputWrapper}>
            <input
                ref={ref}
                className={`${style.input} ${error ? style.inputError : ''} ${className}`}
                {...props}
            />
            {error && <span className={style.errorMessage}>{error}</span>}
        </div>
    )
})

Input.displayName = 'Input'

export default Input

//register прокидає ref, і іноді кастомні компоненти можуть його "втрачати" тому вик. forwardRef
import style from './Button.module.css'

function Button({ variant = 'primary', children, className = '', ...props }) {

    const classes = [style.button, style[variant] || style.primary, className]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}

export default Button;
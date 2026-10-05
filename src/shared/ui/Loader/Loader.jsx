import style from './Loader.module.css';

function Loader({ text = 'Завантаження...' }) {
    return (
        <div className={style.container}>
            <div className={style.spinner}></div>
            <p>{text}</p>
        </div>
    );
}

export default Loader;
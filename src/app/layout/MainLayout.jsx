import { Outlet } from "react-router-dom";
import Header from "../../widgets/Header/Header";
import style from './MainLayout.module.css'

function MainLayout() {
    return (
        <>
            <header className={style.header}>
                <Header />
            </header>
            <main className={style.main}>
                <Outlet />
            </main>
        </>
    );
}

export default MainLayout;
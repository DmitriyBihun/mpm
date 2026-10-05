import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../shared/api/firebase';
import { signOut } from 'firebase/auth';
import { ROUTES } from '../../shared/config/routes';
import Button from '../../shared/ui/Button/Button';
import style from './Header.module.css'

function Header() {

    const [user] = useAuthState(auth)
    const navigate = useNavigate()

    async function handleLogout() {
        try {
            await signOut(auth)
            navigate(ROUTES.HOME)
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    return (
        <nav className={style.nav}>
            <div className={style.leftSide}>
                <NavLink
                    to={ROUTES.HOME}
                    className={({ isActive }) => `${style.navLink} ${isActive ? style.active : ''}`}
                >
                    Головна
                </NavLink>

                {user && (
                    <>
                        <NavLink
                            to={ROUTES.APP.MUSIC}
                            className={({ isActive }) => `${style.navLink} ${isActive ? style.active : ''}`}
                        >
                            Музика
                        </NavLink>
                        <NavLink
                            to={ROUTES.APP.PLAYLISTS}
                            className={({ isActive }) => `${style.navLink} ${isActive ? style.active : ''}`}
                        >
                            Мої плейлисти
                        </NavLink>
                    </>
                )}
            </div>
            
            <div className={style.rightSide}>
                {user ? (
                    <Button
                        onClick={handleLogout}
                        className={style.logoutButton}
                        variant='white'
                    >
                        Вийти
                    </Button>
                ) : (
                    <>
                        <NavLink
                            to={ROUTES.LOGIN}
                            className={({ isActive }) => `${style.navLink} ${isActive ? style.active : ''}`}
                        >
                            Логін
                        </NavLink>
                        <NavLink
                            to={ROUTES.REGISTER}
                            className={({ isActive }) => `${style.navLink} ${isActive ? style.active : ''}`}
                        >
                            Реєстрація
                        </NavLink>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Header;
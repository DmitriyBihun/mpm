import { createUserWithEmailAndPassword, getAdditionalUserInfo, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../../shared/api/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ROUTES } from "../../shared/config/routes";
import Input from "../../shared/ui/Input/Input";
import Button from "../../shared/ui/Button/Button";
import googleIcon from '../../assets/google-icon.svg'
import style from './AuthPage.module.css'


const AUTH_ERRORS = {
    'auth/user-not-found': 'Користувача з таким email не знайдено',
    'auth/wrong-password': 'Неправильний пароль',
    'auth/invalid-credential': 'Неправильний email або пароль',
    'auth/invalid-email': 'Неправильний формат email',
    'auth/email-already-in-use': 'Користувач з таким email вже існує',
    'auth/weak-password': 'Пароль має бути не менше 6 символів',
};

const DEFAULT_ERROR = {
    login: 'Помилка входу. Спробуйте пізніше',
    register: 'Помилка реєстрації. Спробуйте пізніше',
};

async function createUserDoc(uid, email) {
    await setDoc(doc(db, 'users', uid), {
        email,
        createdAt: serverTimestamp(),
    }, { merge: true });
}

function AuthPage() {

    const navigate = useNavigate();
    const location = useLocation();
    const isLogin = location.pathname === ROUTES.LOGIN;

    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
    const password = watch('password');

    useEffect(() => {
        reset();
        setAuthError('');
    }, [isLogin, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        setAuthError('');

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, data.email, data.password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                await createUserDoc(userCredential.user.uid, data.email);
            }

            navigate(ROUTES.APP.MUSIC)
        } catch (error) {
            console.error(`${isLogin ? 'Login' : 'Register'} error:`, error);
            const fallback = isLogin ? DEFAULT_ERROR.login : DEFAULT_ERROR.register;
            setAuthError(AUTH_ERRORS[error.code] || fallback);
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleAuth = async () => {
        setLoading(true);
        setAuthError('');

        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const additionalInfo = getAdditionalUserInfo(userCredential);

            if (additionalInfo?.isNewUser) {
                await createUserDoc(userCredential.user.uid, userCredential.user.email);
            }

            navigate(ROUTES.APP.MUSIC);
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                return;
            }
            console.error('Google auth error:', error);
            setAuthError('Помилка авторизації через Google. Спробуйте пізніше');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.wrapper}>
            <div className={style.container}>
                <h1 className={style.title}>
                    {isLogin ? 'Вхід у' : 'Створення аккаунту'}
                    <span> mPm</span>
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className={style.form}>
                    <div className={style.formGroup}>
                        <label className={style.label}>Email</label>
                        <Input
                            type='email'
                            placeholder='your@email.com'
                            autoComplete='email'
                            error={errors.email?.message}
                            {...register('email', {
                                required: 'Email обов\'язковий',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Неправильний формат email'
                                }
                            })}
                            disabled={loading}
                        />
                    </div>

                    <div className={style.formGroup}>
                        <label className={style.label}>Пароль</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            error={errors.password?.message}
                            {...register('password', {
                                required: 'Пароль обов\'язковий',
                                minLength: {
                                    value: 6,
                                    message: 'Пароль має бути не менше 6 символів'
                                }
                            })}
                            disabled={loading}
                        />
                    </div>

                    {!isLogin && (
                        <div className={style.formGroup}>
                            <label className={style.label}>Підтвердження пароля</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword', {
                                    required: 'Підтвердження пароля обов\'язкове',
                                    validate: value => value === password || 'Паролі не співпадають'
                                })}
                                disabled={loading}
                            />
                        </div>
                    )}

                    {authError && <span className={style.error}>{authError}</span>}

                    <Button
                        type="submit"
                        variant="white"
                        disabled={loading}
                        className={style.submitButton}
                    >
                        {loading
                            ? (isLogin ? 'Вхід...' : 'Реєстрація...')
                            : (isLogin ? 'Увійти' : 'Зареєструватися')
                        }
                    </Button>
                </form>

                <div className={style.actions}>
                    <div className={style.divider}>
                        <span> або </span>
                    </div>

                    <Button
                        onClick={handleGoogleAuth}
                        variant="primary"
                        disabled={loading}
                        className={style.googleButton}
                    >
                        <img src={googleIcon} alt="Google icon" />
                        {isLogin ? 'Увійти з Google' : 'Реєстрація з Google'}
                    </Button>
                </div>

                <div className={style.switchBlock}>
                    {isLogin ? (
                        <>
                            <p>Немає акаунту?</p>
                            <Link to={ROUTES.REGISTER}>Зареєструватися</Link>
                        </>
                    ) : (
                        <>
                            <p>Вже є акаунт?</p>
                            <Link to={ROUTES.LOGIN}>Увійти</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
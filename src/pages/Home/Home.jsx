import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../shared/api/firebase';
import { ROUTES } from '../../shared/config/routes';
import Button from '../../shared/ui/Button/Button';
import heroImg from '../../assets/heroImg.jpg';
import style from './Home.module.css';
import gsap from 'gsap';

function Home() {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);

    const heroRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".gsap-reveal", {
                y: 50,          
                opacity: 0,       
                duration: 1,         
                stagger: 0.2,        
                ease: "power3.out",  
                delay: 0.2           
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    const handleStartClick = () => {
        if (user) {
            navigate(ROUTES.APP.MUSIC);
        } else {
            navigate(ROUTES.REGISTER);
        }
    };

    return (
        <>
            <div className={style.hero} ref={heroRef}>
                <div className={style.heroContainer}>
                    <div className={style.heroBody}>
                        <h1 className={`${style.heroTitle} gsap-reveal`}>
                            Music <br />& play <br />market
                        </h1>

                        <div className={`${style.heroText} gsap-reveal`}>
                            <p>
                                Твій персональний музичний простір. Знаходь нові треки, створюй унікальні плейлисти для будь-якого настрою та ділися своїм вайбом зі світом.
                            </p>
                        </div>

                        <div className="gsap-reveal">
                            <Button
                                onClick={handleStartClick}
                                className={style.ctaButton}
                                variant='white'
                            >
                                Почати створювати
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <img className={style.heroImg} src={heroImg} alt="Hero Background" />
        </>
    );
}

export default Home;
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../shared/api/firebase";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../../../shared/config/routes";
import Loader from "../../../shared/ui/Loader/Loader";

function AuthRedirect() {

    const [user, loading] = useAuthState(auth)

    if (loading) {
        return <Loader />;
    }

    return user ? <Navigate to={ROUTES.APP.MUSIC} replace /> : <Outlet />;
}

export default AuthRedirect;
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../shared/api/firebase";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../../../shared/config/routes";
import Loader from "../../../shared/ui/Loader/Loader";

function ProtectedRoute() {

    const [user, loading] = useAuthState(auth);

    if (loading) {
        return <Loader />;
    }

    return user ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}

export default ProtectedRoute;
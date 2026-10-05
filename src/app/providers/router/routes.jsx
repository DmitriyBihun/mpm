import Home from "../../../pages/Home/Home";
import MusicPage from "../../../pages/MusicPage/MusicPage";
import PlaylistsPage from "../../../pages/PlaylistsPage/PlaylistsPage";
import PlaylistPage from "../../../pages/PlaylistPage/PlaylistPage";
import ProtectedRoute from "../../../widgets/components/ProtectedRoute/ProtectedRoute";
import { Navigate } from "react-router-dom";
import SharedPlaylistPage from "../../../pages/SharedPlaylistPage/SharedPlaylistPage";
import AuthRedirect from "../../../widgets/components/AuthRedirect/AuthRedirect";
import AuthPage from "../../../pages/AuthPage/AuthPage";

export const routesConfig = [
    {
        index: true,
        element: <Home />
    },
    {
        element: <AuthRedirect />,
        children: [
            {
                path: 'login',
                element: <AuthPage />
            },
            {
                path: 'register',
                element: <AuthPage />
            }
        ]
    },
    {
        path: 'app',
        element: <ProtectedRoute />,
        children: [
            {
                path: 'music',
                element: <MusicPage />
            },
            {
                path: 'playlists/:playlistId',
                element: <PlaylistPage />
            },
            {
                path: 'playlists',
                element: <PlaylistsPage />
            }
        ]
    },
    {
        path: 'share/:playlistId',
        element: <SharedPlaylistPage />
    },
    {
        path: '*',
        element: <Navigate to="/" replace />
    }
];
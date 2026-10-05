export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    APP: {
        MUSIC: '/app/music',
        PLAYLISTS: '/app/playlists', 
        PLAYLIST: (id) => `/app/playlists/${id}`,
    },
};
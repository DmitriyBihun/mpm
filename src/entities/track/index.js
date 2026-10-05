export const createTrackFromDeezer = (deezerTrack) => ({
    id: String(deezerTrack.id),
    title: deezerTrack.title,
    artist: deezerTrack.artist.name,
    cover: deezerTrack.album.cover_medium || deezerTrack.album.cover,
    duration: deezerTrack.duration,
    preview: deezerTrack.preview,
});
import { collection, serverTimestamp, doc, increment, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export const playlistTracksApi = {
    // Додати трек у плейлист атомарно (батчем)
    addTrackToPlaylist: async (playlistId, track) => {
        try {
            const batch = writeBatch(db);

            const trackData = {
                playlistId,
                trackId: track.id,
                title: track.title,
                artist: track.artist,
                cover: track.cover,
                addedAt: serverTimestamp()
            };

            // 1. Створюємо референс для нового треку
            const trackRef = doc(collection(db, 'playlistTracks'));
            batch.set(trackRef, trackData);

            // 2. Оновлюємо лічильник у плейлисті (+1)
            const playlistRef = doc(db, 'playlists', playlistId);
            batch.update(playlistRef, {
                tracksCount: increment(1)
            });

            // 3. Фіксуємо транзакцію атомарно
            await batch.commit();
            console.log('Track added with ID:', trackRef.id);

            return trackRef.id;
        } catch (error) {
            console.error('Error adding track to playlist:', error);
            throw error;
        }
    },

    // Видалити трек із плейлиста атомарно (батчем)
    removeTrackFromPlaylist: async (trackDocId, playlistId) => {
        try {
            const batch = writeBatch(db);

            // 1. Видаляємо трек
            const trackRef = doc(db, 'playlistTracks', trackDocId);
            batch.delete(trackRef);

            // 2. Оновлюємо лічильник у плейлисті (-1)
            const playlistRef = doc(db, 'playlists', playlistId);
            batch.update(playlistRef, {
                tracksCount: increment(-1)
            });

            // 3. Фіксуємо транзакцію атомарно
            await batch.commit();
            console.log('Track removed, playlist count updated');
        } catch (error) {
            console.error('Error removing track:', error);
            throw error;
        }
    }
};
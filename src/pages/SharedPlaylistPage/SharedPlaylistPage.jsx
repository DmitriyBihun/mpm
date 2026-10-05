import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../shared/api/firebase';
import { ROUTES } from '../../shared/config/routes';
import TrackInPlaylist from '../../widgets/components/TrackInPlaylist/TrackInPlaylist';
import Button from '../../shared/ui/Button/Button';
import Loader from '../../shared/ui/Loader/Loader';
import style from './SharedPlaylistPage.module.css';

function SharedPlaylistPage() {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isCancelled = false;

        const loadSharedPlaylist = async () => {
            if (!playlistId) return;

            setLoading(true);
            setError('');

            try {
                const playlistDoc = await getDoc(doc(db, 'playlists', playlistId));

                if (isCancelled) return;

                if (!playlistDoc.exists()) {
                    setError('Плейлист не знайдено');
                    return;
                }

                const playlistData = {
                    id: playlistDoc.id,
                    ...playlistDoc.data()
                };

                if (!playlistData.isPublic) {
                    setError('Цей плейлист є приватним');
                    return;
                }

                if (!isCancelled) {
                    setPlaylist(playlistData);
                }

                const tracksRef = collection(db, 'playlistTracks');
                const q = query(tracksRef, where('playlistId', '==', playlistId));
                const querySnapshot = await getDocs(q);

                if (isCancelled) return;

                const playlistTracks = [];
                querySnapshot.forEach((doc) => {
                    playlistTracks.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                // Сортуємо треки за датою додавання
                playlistTracks.sort((a, b) => {
                    const dateA = a.addedAt?.toDate?.() || new Date(0);
                    const dateB = b.addedAt?.toDate?.() || new Date(0);
                    return dateB - dateA;
                });

                if (!isCancelled) {
                    setTracks(playlistTracks);
                }

            } catch (error) {
                if (!isCancelled) {
                    console.error('Error loading shared playlist:', error);
                    setError('Не вдалося завантажити плейлист. Спробуйте пізніше.');
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        loadSharedPlaylist();

        return () => {
            isCancelled = true;
        };
    }, [playlistId]);

    if (loading) {
        return <Loader text="Завантаження плейлиста..." />;
    }

    if (error) {
        return (
            <div className={style.errorContainer}>
                <p className={style.error}>{error}</p>
                <Button
                    onClick={() => navigate(ROUTES.HOME)}
                    variant="white"
                    className={style.homeButton}
                >
                    На головну
                </Button>
            </div>
        );
    }

    return (
        <div className={style.container}>
            <div className={style.header}>
                <div className={style.playlistInfo}>
                    <div className={style.publicBadge}>Публічний плейлист</div>
                    <h1 className={style.playlistName}>{playlist?.name}</h1>
                    <p className={style.tracksCount}>
                        Треків: {tracks.length}
                    </p>
                </div>
            </div>

            {tracks.length === 0 ? (
                <div className={style.emptyState}>
                    <p>У цьому плейлисті ще немає треків</p>
                </div>
            ) : (
                <div className={style.tracksList}>
                    {tracks.map((track) => (
                        <TrackInPlaylist
                            key={track.id}
                            track={track}
                            showRemoveButton={false}
                        />
                    ))}
                </div>
            )}

            <div className={style.footer}>
                <p>Створено в <span>Music Playlist Maker</span></p>
                <Button
                    onClick={() => navigate(ROUTES.REGISTER)}
                    variant="white"
                    className={style.createButton}
                >
                    Створити свій плейлист
                </Button>
            </div>
        </div>
    );
}

export default SharedPlaylistPage;
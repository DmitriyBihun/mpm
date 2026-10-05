import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../shared/api/firebase';
import TrackInPlaylist from '../../widgets/components/TrackInPlaylist/TrackInPlaylist';
import { playlistTracksApi } from '../../shared/api/playlistTracks';
import { ROUTES } from '../../shared/config/routes';
import Button from '../../shared/ui/Button/Button';
import Loader from '../../shared/ui/Loader/Loader';
import style from './PlaylistPage.module.css';

function PlaylistPage() {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const [user] = useAuthState(auth);

    const [playlist, setPlaylist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isCancelled = false;

        const loadPlaylistData = async () => {
            if (!playlistId || !user) return;

            setLoading(true);
            setError('');

            try {
                // 1. Завантажую інформацію про плейлист
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

                // Перевіряю, чи належить плейлист потому юзеру
                if (playlistData.userId !== user.uid) {
                    setError('У вас немає доступу до цього плейлиста');
                    return;
                }

                if (!isCancelled) {
                    setPlaylist(playlistData);
                }

                // 2. Завантажую треки цього плейлиста
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

                // Сортую
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
                    console.error('Error loading playlist:', error);
                    setError('Не вдалося завантажити плейлист');
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        if (playlistId && user) {
            loadPlaylistData();
        }

        return () => {
            isCancelled = true;
        };
    }, [playlistId, user]);

    const handleRemoveTrack = async (trackDocId) => {
        try {
            await playlistTracksApi.removeTrackFromPlaylist(trackDocId, playlistId);
            setTracks(prev => prev.filter(t => t.id !== trackDocId));
        } catch (error) {
            console.error('Error removing track:', error);
            alert('Не вдалося видалити трек');
        }
    };

    const handleGoBack = () => {
        navigate(ROUTES.APP.PLAYLISTS);
    };

    if (loading) {
        return <Loader text="Завантаження плейлиста..." />;
    }

    if (error) {
        return (
            <div className={style.errorContainer}>
                <p className={style.error}>{error}</p>
                <Button
                    onClick={handleGoBack}
                    className={style.backButton}
                    variant='white'
                >
                    ← До плейлистів
                </Button>
            </div>
        );
    }

    return (
        <div className={style.playlistPage}>
            <div className={style.playlistPageContainer}>
                <Button
                    onClick={handleGoBack}
                    className={style.backButton}
                    variant='white'
                >
                    ← До всіх плейлистів
                </Button>

                <div className={style.header}>
                    <p className={style.tracksCount}>
                        Треків: {tracks.length}
                    </p>
                </div>

                {tracks.length === 0 ? (
                    <div className={style.emptyState}>
                        <h3 className={style.emptyStateTitle}>У цьому плейлисті ще немає треків</h3>
                        <p className={style.emptyStateText}>
                            Додайте треки зі сторінки <span>Музика</span>
                        </p>
                        <Button
                            onClick={() => navigate(ROUTES.APP.MUSIC)}
                            className={style.emptyStateButton}
                            variant='white'
                        >
                            Перейти до музики
                        </Button>
                    </div>
                ) : (
                    <div className={style.tracksList}>
                        {tracks.map((track) => (
                            <TrackInPlaylist
                                key={track.id}
                                track={track}
                                onRemove={handleRemoveTrack}
                                showRemoveButton={true}
                            />
                        ))}
                    </div>
                )}
                <p className={style.playlistName}>"{playlist?.name}"</p>
            </div>
        </div>
    );
}

export default PlaylistPage;
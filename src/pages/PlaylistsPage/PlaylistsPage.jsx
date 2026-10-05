import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../shared/api/firebase";
import { useEffect, useState, useRef, useCallback } from "react";
import { collection, deleteDoc, getDocs, query, where, doc, writeBatch } from "firebase/firestore";
import PlaylistCard from "../../widgets/components/PlaylistCard/PlaylistCard";
import CreatePlaylistModal from "../../widgets/components/CreatePlaylistModal/CreatePlaylistModal";
import Button from "../../shared/ui/Button/Button";
import Loader from '../../shared/ui/Loader/Loader';
import style from './PlaylistsPage.module.css';

function PlaylistsPage() {
    const [user] = useAuthState(auth);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const loadPlaylists = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError('');

        try {
            const playlistsRef = collection(db, 'playlists');
            const q = query(playlistsRef, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (!isMountedRef.current) return;

            const userPlaylists = [];
            querySnapshot.forEach((doc) => {
                userPlaylists.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            userPlaylists.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB - dateA;
            });

            if (isMountedRef.current) {
                setPlaylists(userPlaylists);
            }
        } catch (error) {
            if (isMountedRef.current) {
                console.error('Error loading playlists:', error);
                setError('Не вдалося завантажити плейлисти');
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadPlaylists();
        }

        const handleFocus = () => {
            if (user) {
                loadPlaylists();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user, loadPlaylists]);

    const handleDeletePlaylist = async (playlistId) => {

        try {
            // Используем batch для атомарного удаления
            const batch = writeBatch(db);

            // 1. Удаляем сам плейлист
            const playlistRef = doc(db, 'playlists', playlistId);
            batch.delete(playlistRef);

            // 2. Находим все треки этого плейлиста
            const tracksRef = collection(db, 'playlistTracks');
            const q = query(tracksRef, where('playlistId', '==', playlistId));
            const querySnapshot = await getDocs(q);

            // 3. Добавляем удаление каждого трека в batch
            querySnapshot.forEach((trackDoc) => {
                batch.delete(trackDoc.ref);
            });

            // 4. Выполняем все операции одним запросом
            await batch.commit();

            // 5. Обновляем UI
            setPlaylists(prev => prev.filter(p => p.id !== playlistId));

            console.log(`Playlist ${playlistId} and ${querySnapshot.size} tracks deleted`);
        } catch (error) {
            console.error('Error deleting playlist:', error);
            alert('Не вдалося видалити плейлист');
        }
    };

    const handleCreateSuccess = () => {
        loadPlaylists(); // Перезагружаем список
    };

    if (loading) {
        return <Loader text="Завантаження..." />
    }

    return (
        <div className={style.playlistPage}>
            <div className={style.playlistPageContainer}>
                <div className={style.header}>
                    <h1 className={style.title}>Мої плейлисти</h1>
                    <Button
                        className={style.createButton}
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="white"
                    >
                        + Створити плейлист
                    </Button>
                </div>

                {error && <div className={style.error}>{error}</div>}

                {playlists.length === 0 ? (
                    <div className={style.emptyState}>
                        <h3 className={style.emptyStateTitle}>Ще немає плейлистів</h3>
                        <p className={style.emptyStateText}>
                            Створіть свій перший плейлист і додайте до нього улюблені треки
                        </p>
                        <Button
                            className={style.emptyCreateButton}
                            onClick={() => setIsCreateModalOpen(true)}
                            variant="white"
                        >
                            + Створити плейлист
                        </Button>
                    </div>
                ) : (
                    <div className={style.playlistsGrid}>
                        {playlists.map((playlist) => (
                            <PlaylistCard
                                key={playlist.id}
                                playlist={playlist}
                                onDelete={handleDeletePlaylist}
                            />
                        ))}
                    </div>
                )}

                <CreatePlaylistModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreateSuccess={handleCreateSuccess}
                />
            </div>
        </div>
        
    );
}

export default PlaylistsPage;
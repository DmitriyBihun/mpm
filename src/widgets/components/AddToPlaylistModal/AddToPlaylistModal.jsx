import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../shared/api/firebase.js';
import { playlistTracksApi } from '../../../shared/api/playlistTracks.js';
import Button from '../../../shared/ui/Button/Button.jsx';
import style from './AddToPlaylistModal.module.css';

function AddToPlaylistModal({ isOpen, onClose, track, onCreatePlaylistClick }) {
    const [user] = useAuthState(auth);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addingTrack, setAddingTrack] = useState(false);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let isCancelled = false;

        const loadUserPlaylists = async () => {
            setLoading(true);
            setError('');
            try {
                const playlistsRef = collection(db, 'playlists');
                const q = query(playlistsRef, where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);

                if (isCancelled) return;

                const userPlaylists = [];
                querySnapshot.forEach((doc) => {
                    userPlaylists.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                if (!isCancelled) {
                    setPlaylists(userPlaylists);
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error('Error loading playlists:', error);
                    setError('Не вдалося завантажити плейлисти');
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        if (isOpen && user) {
            loadUserPlaylists();
        }

        return () => {
            isCancelled = true;
        };
    }, [isOpen, user]);

    const handleAddToPlaylist = async () => {
        if (!selectedPlaylistId || !track) return;

        setAddingTrack(true);
        setError('');

        try {
            await playlistTracksApi.addTrackToPlaylist(selectedPlaylistId, track);
            onClose();
        } catch (error) {
            console.error('Error adding track:', error);
            setError('Не вдалося додати трек. Спробуйте пізніше.');
        } finally {
            setAddingTrack(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={style.overlay} onClick={onClose}>
            <div className={style.modal} onClick={(e) => e.stopPropagation()}>
                <div className={style.header}>
                    <h3 className={style.title}>Додати до плейлиста</h3>
                    <Button
                        className={style.closeButton}
                        onClick={onClose}
                        variant='white'
                        aria-label="Закрити"
                    >
                        ✕
                    </Button>
                </div>

                <div className={style.trackInfo}>
                    <img src={track.cover} alt={track.title} className={style.trackCover} />
                    <div className={style.trackDetails}>
                        <div className={style.trackTitle}>{track.title}</div>
                        <div className={style.trackArtist}>{track.artist}</div>
                    </div>
                </div>

                <div className={style.content}>
                    {error && <div className={style.errorMessage}>{error}</div>}

                    {loading ? (
                        <div className={style.loading}>Завантаження плейлистів...</div>
                    ) : playlists.length === 0 ? (
                        <div className={style.emptyState}>
                            <p>У вас ще немає плейлистів</p>
                            <Button
                                className={style.createPlaylistButton}
                                onClick={() => {
                                    onClose();
                                    onCreatePlaylistClick(track);
                                }}
                                variant='white'
                            >
                                + Створити плейлист
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className={style.playlistsList}>
                                {playlists.map((playlist) => (
                                    <label
                                        key={playlist.id}
                                        className={`${style.playlistItem} ${selectedPlaylistId === playlist.id ? style.selected : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="playlist"
                                            value={playlist.id}
                                            checked={selectedPlaylistId === playlist.id}
                                            onChange={(e) => setSelectedPlaylistId(e.target.value)}
                                            className={style.radio}
                                            disabled={addingTrack}
                                        />
                                        <span className={style.playlistName}>{playlist.name}</span>
                                        <span className={style.playlistCount}>
                                            {playlist.tracksCount || 0} треків
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div className={style.actions}>
                                <Button
                                    className={style.cancelButton}
                                    onClick={onClose}
                                    disabled={addingTrack}
                                    variant='primary'
                                >
                                    Скасувати
                                </Button>
                                <Button
                                    className={style.addButton}
                                    onClick={handleAddToPlaylist}
                                    disabled={!selectedPlaylistId || addingTrack}
                                    variant='white'
                                >
                                    {addingTrack ? 'Додавання...' : 'Додати'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddToPlaylistModal;
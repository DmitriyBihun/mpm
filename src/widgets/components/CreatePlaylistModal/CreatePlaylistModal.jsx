import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../shared/api/firebase';
import { playlistTracksApi } from '../../../shared/api/playlistTracks';
import Button from '../../../shared/ui/Button/Button.jsx';
import Input from '../../../shared/ui/Input/Input.jsx';
import style from './CreatePlaylistModal.module.css';

function CreatePlaylistModal({ isOpen, onClose, trackToAdd, onCreateSuccess }) {
    const [user] = useAuthState(auth);
    const [playlistName, setPlaylistName] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [submitError, setSubmitError] = useState('');

    // Блокируем скролл при открытой модалке
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setPlaylistName('');
            setIsPublic(false);
            setValidationError('');
            setSubmitError('');
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Закрываем модалку по Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleNameChange = (e) => {
        setPlaylistName(e.target.value);
        if (validationError) {
            setValidationError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!playlistName.trim()) {
            setValidationError('Назва плейлиста обов\'язкова');
            return;
        }

        setValidationError('');
        setSubmitError('');
        setLoading(true);

        try {
            const playlistData = {
                name: playlistName.trim(),
                userId: user.uid,
                createdAt: serverTimestamp(),
                tracksCount: 0,
                isPublic: isPublic
            };

            const docRef = await addDoc(collection(db, 'playlists'), playlistData);
            console.log('Playlist created with ID:', docRef.id);

            if (trackToAdd) {
                await playlistTracksApi.addTrackToPlaylist(docRef.id, trackToAdd);
            }

            setPlaylistName('');
            setIsPublic(false);
            onCreateSuccess?.(docRef.id);
            onClose();
        } catch (error) {
            console.error('Error creating playlist:', error);
            setSubmitError('Не вдалося створити плейлист. Спробуйте пізніше.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={style.overlay} onClick={onClose}>
            <div className={style.modal} onClick={(e) => e.stopPropagation()}>
                <div className={style.header}>
                    <h3 className={style.title}>Створити новий плейлист</h3>
                    <Button
                        onClick={onClose}
                        className={style.closeButton}
                        variant='white'
                        aria-label="Close modal"
                    >
                        ✕
                    </Button>
                </div>

                {trackToAdd && (
                    <div className={style.trackInfo}>
                        <img
                            src={trackToAdd.cover}
                            alt={trackToAdd.title}
                            className={style.trackCover}
                        />
                        <div className={style.trackDetails}>
                            <div className={style.trackTitle}>{trackToAdd.title}</div>
                            <div className={style.trackArtist}>{trackToAdd.artist}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={style.form}>
                    <div className={style.formGroup}>
                        <label htmlFor="playlistName" className={style.label}>
                            Назва плейлиста
                        </label>
                        <Input
                            type="text"
                            id="playlistName"
                            value={playlistName}
                            onChange={handleNameChange}
                            placeholder="Наприклад: Для бігу, Улюблене, 2024..."
                            disabled={loading}
                            autoFocus
                            error={validationError}
                        />
                    </div>

                    <div className={style.publicToggle}>
                        <label className={style.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                disabled={loading}
                                className={style.toggleInput}
                            />
                            <span className={style.toggleSlider}></span>
                            <span className={style.toggleText}>
                                {isPublic ? 'Публічний плейлист' : 'Приватний плейлист'}
                            </span>
                        </label>
                        <p className={style.toggleHint}>
                            {isPublic
                                ? 'Будь-хто з посиланням зможе переглянути цей плейлист'
                                : 'Тільки ви зможете бачити цей плейлист'}
                        </p>
                    </div>

                    {submitError && (
                        <div className={style.submitError}>
                            {submitError}
                        </div>
                    )}

                    <div className={style.actions}>
                        <Button
                            type="button"
                            className={style.cancelButton}
                            onClick={onClose}
                            disabled={loading}
                            variant='white'
                        >
                            Скасувати
                        </Button>
                        <Button
                            type="submit"
                            className={style.createButton}
                            disabled={loading}
                            variant='primary'
                        >
                            {loading ? 'Створення...' : 'Створити плейлист'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePlaylistModal;
import { useNavigate } from "react-router-dom";
import { ROUTES } from '../../../shared/config/routes'
import deleteIcon from '../../../assets/trash.svg'
import musicNoteIcon from '../../../assets/musicNoteWhite.svg'
import Button from "../../../shared/ui/Button/Button";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../shared/api/firebase";
import Input from "../../../shared/ui/Input/Input";
import style from './PlaylistCard.module.css';

function PlaylistCard({ playlist, onDelete }) {

    const navigate = useNavigate();
    const [isPublic, setIsPublic] = useState(playlist.isPublic || false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    const handleOpenPlaylist = () => {

        navigate(ROUTES.APP.PLAYLIST(playlist.id));
    };

    const togglePublic = async () => {
        try {
            const newPublicStatus = !isPublic;
            await updateDoc(doc(db, 'playlists', playlist.id), {
                isPublic: newPublicStatus
            });
            setIsPublic(newPublicStatus);
        } catch (error) {
            console.error('Error updating playlist:', error);
            alert('Не вдалося змінити статус плейлиста');
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/share/${playlist.id}`;
        setShareUrl(url);
        setShowShareModal(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        alert('Посилання скопійовано!');
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate?.() || new Date(timestamp);
        return date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <>
            <div className={style.card}>
                <div className={style.cardHeader}>
                    <div className={style.playlistIcon}>
                        <img src={musicNoteIcon} alt="Music note icon" />
                    </div>
                    <Button
                        onClick={() => onDelete(playlist.id)}
                        aria-label="Delete playlist"
                        className={style.deleteButton}
                        variant="red"
                    >
                        <img src={deleteIcon} alt="Delete icon" />
                    </Button>
                </div>

                <div className={style.cardContent}>
                    <h3 className={style.playlistName}>{playlist.name}</h3>
                    <div className={style.playlistStats}>
                        <span className={style.trackCount}>
                            Треків: {playlist.tracksCount || 0} 
                        </span>
                        <span className={style.dot}>•</span>
                        <span className={style.date}>
                            {formatDate(playlist.createdAt)}
                        </span>
                    </div>

                    <div className={style.publicToggle}>
                        <label className={style.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={togglePublic}
                                className={style.toggleInput}
                            />
                            <span className={style.toggleSlider}></span>
                            <span className={style.toggleText}>
                                {isPublic ? 'Публічний' : 'Приватний'}
                            </span>
                        </label>

                        {isPublic && (
                            <button
                                onClick={handleShare}
                                className={style.shareButton}
                            >
                                🔗 Поділитися
                            </button>
                        )}
                    </div>
                </div>

                <Button
                    onClick={handleOpenPlaylist}
                    className={style.openButton}
                    variant="primary"
                >
                    Відкрити плейлист
                </Button>
            </div>

            {showShareModal && (
                <div className={style.shareModalOverlay} onClick={() => setShowShareModal(false)}>
                    <div className={style.shareModal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={style.shareModalTitle}>Поділитися плейлистом</h3>
                        <p className={style.shareModalText}>
                            Кожен, хто має це посилання, зможе переглянути ваш плейлист
                        </p>
                        <div className={style.shareUrlContainer}>
                            <Input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className={style.shareUrl}
                            />
                            <Button
                                onClick={copyToClipboard}
                                className={style.copyButton}
                                variant="primary"
                            >
                                Копіювати
                            </Button>
                        </div>
                        <Button
                            onClick={() => setShowShareModal(false)}
                            className={style.closeShareButton}
                            variant="white"
                            >
                            Закрити
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}


export default PlaylistCard;
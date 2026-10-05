import Button from '../../../shared/ui/Button/Button';
import style from './TrackInPlaylist.module.css';

function TrackInPlaylist({ track, onRemove, showRemoveButton = true }) {
    return (
        <div className={style.trackItem}>
            <div className={style.coverBlock}>
                <img src={track.cover} alt={track.title} className={style.cover} />
            </div>

            <div className={style.content}>
                {showRemoveButton && (
                    <Button
                        onClick={() => onRemove(track.id)}
                        className={style.removeButton}
                        aria-label="Remove from playlist"
                        variant='red'
                    >
                        ✕
                    </Button>
                )}

                <div className={style.info}>
                    <h3 className={style.title}>{track.title}</h3>
                    <p className={style.artist}>{track.artist}</p>
                </div>
            </div>
        </div>
    );
}

export default TrackInPlaylist;
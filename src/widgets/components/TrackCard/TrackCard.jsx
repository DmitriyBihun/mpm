import style from './TrackCard.module.css'
import plusIcon from '../../../assets/plus.svg'

function TrackCard({ track, onAddToPlaylist }) {

    function clearTitle(title, maxLength = 30) {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    }

    return (
        <div className={style.card}>
            <div className={style.imageWrapper}>
                <img src={track.cover} alt={track.title} className={style.image} loading="lazy" />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlaylist(track);
                    }}
                    className={style.addButton}
                    aria-label="Add to playlist"
                >
                    <img src={plusIcon} alt="" />
                </button>

            </div>
            <div className={style.content}>
                <h3 className={style.title} title={track.title}>
                    {clearTitle(track.title)}
                </h3>
                <p className={style.artist} title={track.artist}>
                    {track.artist}
                </p>
            </div>
        </div>
    );
}

export default TrackCard;
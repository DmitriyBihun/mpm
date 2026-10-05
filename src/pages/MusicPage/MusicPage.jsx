import { useState, useEffect } from 'react';
import { deezerApi } from '../../shared/api/deezer';
import { createTrackFromDeezer } from '../../entities/track';
import TrackCard from '../../widgets/components/TrackCard/TrackCard';
import AddToPlaylistModal from '../../widgets/components/AddToPlaylistModal/AddToPlaylistModal';
import CreatePlaylistModal from '../../widgets/components/CreatePlaylistModal/CreatePlaylistModal';
import Button from "../../shared/ui/Button/Button";
import Input from '../../shared/ui/Input/Input';
import Loader from '../../shared/ui/Loader/Loader';
import style from './MusicPage.module.css';

function MusicPage() {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);

    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(null);

    const ITEMS_PER_PAGE = 12;
    const isSearching = Boolean(searchQuery.trim());

    useEffect(() => {
        let isCancelled = false;

        const fetchTracks = async () => {
            setLoading(true);
            setError(null);

            try {
                let data;

                if (searchQuery.trim()) {
                    data = await deezerApi.searchTracks(searchQuery, ITEMS_PER_PAGE, currentPage);
                } else {
                    data = await deezerApi.getChartTracks(ITEMS_PER_PAGE, currentPage);
                }

                if (!isCancelled) {
                    setTracks(data.map(createTrackFromDeezer));
                }
            } catch (err) {
                if (!isCancelled) {
                    setError('Не вдалося завантажити треки. Спробуйте пізніше.');
                    console.error(err);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        fetchTracks();

        return () => {
            isCancelled = true;
        };
    }, [currentPage, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = searchInput.trim();
        setSearchQuery(trimmed);
        setCurrentPage(0);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setCurrentPage(0);
    };

    const handleAddToPlaylist = (track) => {
        setSelectedTrack(track);
        setIsAddModalOpen(true);
    };

    const handleCreatePlaylistClick = (track) => {
        setIsAddModalOpen(false);
        setSelectedTrack(track);
        setIsCreateModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setSelectedTrack(null);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setSelectedTrack(null);
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(0, prev - ITEMS_PER_PAGE));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNextPage = () => {
        setCurrentPage(prev => prev + ITEMS_PER_PAGE);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && tracks.length === 0) {
        return <Loader text="Завантаження треків..." />;
    }

    return (
        <div className={style.musicPage}>
            <div className={style.musicPageContainer}>
                <h1 className={style.title}>Музика</h1>

                <form onSubmit={handleSearch} className={style.searchForm}>
                    <Input
                        type="text"
                        name="search"
                        placeholder="Пошук пісень або виконавців..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        aria-label="Пошук пісень або виконавців"
                        className={style.searchInput}
                    />
                    <div className={style.buttons}>
                        <Button
                            type="submit"
                            variant='white'
                            disabled={loading}
                            className={style.searchButton}
                        >
                            Шукати
                        </Button>
                        {(searchQuery || searchInput) && (
                            <Button
                                type="button"
                                onClick={handleClearSearch}
                                className={style.clearButton}
                                variant='primary'
                            >
                                Очистити
                            </Button>
                        )}
                    </div>
                </form>

                {isSearching && (
                    <div className={style.searchInfo}>
                        <p>Результати пошуку: "{searchQuery}"</p>
                    </div>
                )}

                {error && <div className={style.errorMessage}>{error}</div>}

                {tracks.length === 0 && !loading && !error && (
                    <div className={style.noResults}>
                        <p>
                            {isSearching
                                ? `Нічого не знайдено за запитом "${searchQuery}"`
                                : 'Треки не знайдено'}
                        </p>
                        {isSearching && (
                            <Button
                                type="button"
                                onClick={handleClearSearch}
                                className={style.clearSearchButton}
                                variant='white'
                            >
                                Очистити пошук
                            </Button>
                        )}
                    </div>
                )}

                <div className={style.tracksGrid}>
                    {tracks.map((track) => (
                        <TrackCard
                            key={track.id}
                            track={track}
                            onAddToPlaylist={handleAddToPlaylist}
                        />
                    ))}
                </div>

                {tracks.length > 0 && (
                    <div className={style.pagination}>
                        <Button
                            type="button"
                            onClick={handlePreviousPage}
                            disabled={loading || currentPage === 0}
                            className={style.paginationButton}
                            variant='white'
                        >
                            ← Попередня
                        </Button>

                        <span className={style.pageInfo}>
                            Сторінка {Math.floor(currentPage / ITEMS_PER_PAGE) + 1}
                        </span>

                        <Button
                            type="button"
                            onClick={handleNextPage}
                            disabled={loading || tracks.length < ITEMS_PER_PAGE}
                            className={style.paginationButton}
                            variant='white'
                        >
                            Наступна →
                        </Button>
                    </div>
                )}

                {selectedTrack && (
                    <>
                        <AddToPlaylistModal
                            isOpen={isAddModalOpen}
                            onClose={handleCloseAddModal}
                            track={selectedTrack}
                            onCreatePlaylistClick={handleCreatePlaylistClick}
                        />
                        <CreatePlaylistModal
                            isOpen={isCreateModalOpen}
                            onClose={handleCloseCreateModal}
                            trackToAdd={selectedTrack}
                            onCreateSuccess={handleCloseCreateModal}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default MusicPage;
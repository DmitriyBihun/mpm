const BASE_URL = 'https://api.deezer.com';

let jsonpCounter = 0;

// Функція для JSONP запитів з таймаутом і захистом від колізій
const jsonp = (url, timeoutMs = 10000) => {
    return new Promise((resolve, reject) => {
        const callbackName = `deezer_callback_${Date.now()}_${++jsonpCounter}`;

        const script = document.createElement('script');

        const timer = setTimeout(() => {
            cleanup();
            reject(new Error('Deezer API request timed out'));
        }, timeoutMs);

        const cleanup = () => {
            clearTimeout(timer);
            delete window[callbackName];
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };

        window[callbackName] = (data) => {
            cleanup();

            if (data.error) {
                reject(new Error(data.error.message));
            } else {
                resolve(data);
            }
        };

        script.onerror = () => {
            cleanup();
            reject(new Error('Network error'));
        };

        const separator = url.includes('?') ? '&' : '?';
        script.src = `${url}${separator}output=jsonp&callback=${callbackName}`;

        document.body.appendChild(script);
    });
};

export const deezerApi = {
    // Отримати популярні треки
    getChartTracks: async (limit = 10, index = 0) => {
        try {
            const data = await jsonp(`${BASE_URL}/chart/0/tracks?limit=${limit}&index=${index}`);
            return data.data || [];
        } catch (error) {
            console.error('Error fetching chart tracks:', error);
            throw error;
        }
    },

    // Пошук треків
    searchTracks: async (query, limit = 10, index = 0) => {
        try {
            const data = await jsonp(`${BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}&index=${index}`);
            return data.data || [];
        } catch (error) {
            console.error('Error searching tracks:', error);
            throw error;
        }
    },

    // Отримати інформацію про трек
    getTrack: async (trackId) => {
        try {
            const data = await jsonp(`${BASE_URL}/track/${trackId}`);
            return data;
        } catch (error) {
            console.error('Error fetching track:', error);
            throw error;
        }
    }
};
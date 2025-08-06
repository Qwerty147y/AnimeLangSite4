// Простое приложение без лишних функций
let currentAnime = null;
let currentEpisode = null;
let currentIframe = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadAnimes();
    handleInitialLoad();
});

// Загрузка аниме
function loadAnimes() {
    const grid = document.getElementById('anime-grid');
    
    if (!animeData || animeData.length === 0) {
        grid.innerHTML = '<div class="loading">Аниме не найдены</div>';
        return;
    }

    const gridHTML = `
        <div class="grid">
            ${animeData.map(anime => `
                <div class="anime-card" onclick="showAnimeDetail('${anime.id}')">
                    <div class="anime-banner">
                        <img src="${anime.bannerUrl}" alt="${anime.title}">
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    grid.innerHTML = gridHTML;
}

// Показать главную страницу
function showHome() {
    stopCurrentVideo();
    document.body.classList.remove('episode-playing');
    showPage('home-page');
    window.location.hash = '';
}

// Показать детали аниме
function showAnimeDetail(animeId) {
    stopCurrentVideo();
    document.body.classList.remove('episode-playing');
    
    const anime = animeData.find(a => a.id === animeId);
    if (!anime) return;

    currentAnime = anime;
    
    // Показать только серии горизонтально
    const container = document.getElementById('episodes-container');
    container.innerHTML = `
        <div class="episodes-list">
            ${anime.episodes.map(episode => `
                <div class="episode-item" onclick="showEpisode('${anime.id}', ${episode.number})">
                    ${episode.number} серия
                </div>
            `).join('')}
        </div>
    `;

    showPage('anime-detail-page');
    window.location.hash = `anime/${animeId}`;
}

// Вернуться к аниме
function backToAnime() {
    if (currentAnime) {
        showAnimeDetail(currentAnime.id);
    } else {
        showHome();
    }
}

// Показать серию
function showEpisode(animeId, episodeNumber) {
    stopCurrentVideo();
    
    const anime = animeData.find(a => a.id === animeId);
    const episode = anime?.episodes.find(e => e.number === episodeNumber);
    
    if (!anime || !episode) return;

    currentAnime = anime;
    currentEpisode = episode;
    
    // Скрыть хедер на странице серий
    document.body.classList.add('episode-playing');
    
    // Создать iframe для Bunny.net
    const container = document.getElementById('video-container');
    container.innerHTML = `
        <iframe 
            src="${episode.videoUrl}" 
            frameborder="0" 
            width="100%"
            height="100%"
            allowfullscreen
            webkitallowfullscreen
            mozallowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
        </iframe>
    `;
    
    currentIframe = container.querySelector('iframe');
    
    // Обновить навигацию
    updateEpisodeNavigation();
    
    showPage('episode-page');
    window.location.hash = `anime/${animeId}/episode/${episodeNumber}`;
}

// Обновить навигацию серий
function updateEpisodeNavigation() {
    if (!currentAnime || !currentEpisode) return;
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const counter = document.getElementById('episode-counter');
    
    const currentNumber = currentEpisode.number;
    const totalEpisodes = currentAnime.episodes.length;
    
    // Обновить счетчик
    counter.textContent = `Серия ${currentNumber}`;
    
    // Обновить кнопки
    if (currentNumber === 1) {
        prevBtn.classList.add('disabled');
        prevBtn.disabled = true;
    } else {
        prevBtn.classList.remove('disabled');
        prevBtn.disabled = false;
    }
    
    if (currentNumber === totalEpisodes) {
        nextBtn.classList.add('disabled');
        nextBtn.disabled = true;
    } else {
        nextBtn.classList.remove('disabled');
        nextBtn.disabled = false;
    }
}

// Предыдущая серия
function goToPreviousEpisode() {
    if (!currentAnime || !currentEpisode || currentEpisode.number === 1) return;
    showEpisode(currentAnime.id, currentEpisode.number - 1);
}

// Следующая серия
function goToNextEpisode() {
    if (!currentAnime || !currentEpisode) return;
    const totalEpisodes = currentAnime.episodes.length;
    if (currentEpisode.number === totalEpisodes) return;
    showEpisode(currentAnime.id, currentEpisode.number + 1);
}

// Остановить текущее видео
function stopCurrentVideo() {
    if (currentIframe) {
        currentIframe.remove();
        currentIframe = null;
    }
}

// Показать страницу
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    window.scrollTo(0, 0);
}

// Обработка начальной загрузки
function handleInitialLoad() {
    const hash = window.location.hash;
    if (hash) {
        handleHashChange(hash);
    }
    
    window.addEventListener('hashchange', () => {
        handleHashChange(window.location.hash);
    });
}

// Обработка изменения hash
function handleHashChange(hash) {
    if (hash.startsWith('#anime/')) {
        const parts = hash.split('/');
        const animeId = parts[1];
        const episodeNumber = parts[3];
        
        if (episodeNumber) {
            showEpisode(animeId, parseInt(episodeNumber));
        } else {
            showAnimeDetail(animeId);
        }
    } else if (hash === '#support') {
        showSupport();
    } else {
        showHome();
    }
}
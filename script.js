        // Variáveis globais
        let currentItemId = null;
        let currentItemType = null;
        let previousPage = 'home-page';
        let currentAnimePage = 1;
        let currentMangaPage = 1;
        
        // Histórico de navegação
        const pageHistory = ['home-page'];
        
        // Dicionário de tradução para termos comuns
        const translationDict = {
            // Status
            'Finished Airing': 'Transmissão Concluída',
            'Currently Airing': 'Em Transmissão',
            'Not yet aired': 'Não Estreou',
            'Publishing': 'Publicando',
            'Finished': 'Finalizado',
            'Hiatus': 'Em Hiato',
            'Discontinued': 'Descontinuado',
            'Upcoming': 'Em Breve',
            
            // Types
            'TV': 'Série de TV',
            'Movie': 'Filme',
            'OVA': 'OVA',
            'ONA': 'ONA',
            'Special': 'Especial',
            'Music': 'Música',
            'Manga': 'Mangá',
            'Light Novel': 'Light Novel',
            'One-shot': 'One-shot',
            'Doujin': 'Doujin',
            'Manhua': 'Manhua',
            'Manhwa': 'Manhwa',
            'Novel': 'Novel',
            
            // Ratings
            'G - All Ages': 'Livre para todos os públicos',
            'PG - Children': 'Crianças',
            'PG-13 - Teens 13 or older': 'Adolescentes (13+)',
            'R - 17+ (violence & profanity)': 'Maiores de 17 (violência e linguagem imprópria)',
            'R+ - Mild Nudity': 'Conteúdo sugestivo',
            'Rx - Hentai': 'Hentai (conteúdo adulto explícito)',
            
            // Dias da semana
            'monday': 'Segunda-feira',
            'tuesday': 'Terça-feira',
            'wednesday': 'Quarta-feira',
            'thursday': 'Quinta-feira',
            'friday': 'Sexta-feira',
            'saturday': 'Sábado',
            'sunday': 'Domingo',
            'other': 'Outros',
            'unknown': 'Desconhecido'
        };

        // Sistema de Favoritos
        let favorites = JSON.parse(localStorage.getItem('otakuverseFavorites')) || [];

        // Função para salvar favoritos no localStorage
        function saveFavorites() {
            localStorage.setItem('otakuverseFavorites', JSON.stringify(favorites));
        }

        // Função para adicionar/remover favoritos
        function toggleFavorite(id, type, title, image) {
            const index = favorites.findIndex(fav => fav.id === id && fav.type === type);
            
            if (index === -1) {
                // Adicionar aos favoritos
                favorites.push({
                    id,
                    type,
                    title,
                    image,
                    dateAdded: new Date().toISOString()
                });
            } else {
                // Remover dos favoritos
                favorites.splice(index, 1);
            }
            
            saveFavorites();
            updateFavoriteButtons();
            return index === -1; // Retorna true se foi adicionado, false se foi removido
        }

        // Função para verificar se um item é favorito
        function isFavorite(id, type) {
            return favorites.some(fav => fav.id === id && fav.type === type);
        }

        // Função para atualizar os botões de favorito
        function updateFavoriteButtons() {
            document.querySelectorAll('.favorite-btn').forEach(btn => {
                const id = btn.getAttribute('data-id');
                const type = btn.getAttribute('data-type');
                
                if (isFavorite(id, type)) {
                    btn.classList.add('active');
                    btn.innerHTML = '<i class="fas fa-heart"></i>';
                } else {
                    btn.classList.remove('active');
                    btn.innerHTML = '<i class="far fa-heart"></i>';
                }
            });
        }

        // Função para carregar a página de favoritos
        function loadFavorites() {
            const container = document.getElementById('favorites-container');
            const noFavorites = document.getElementById('no-favorites');
            
            if (favorites.length === 0) {
                container.innerHTML = '';
                noFavorites.style.display = 'block';
                return;
            }
            
            noFavorites.style.display = 'none';
            container.innerHTML = '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4" id="favorites-grid"></div>';
            const grid = document.getElementById('favorites-grid');
            
            favorites.forEach(fav => {
                const card = document.createElement('div');
                card.className = 'col';
                
                card.innerHTML = `
                    <div class="content-card">
                        <div class="content-card-image" style="background-image: url('${fav.image || ''}')">
                            ${!fav.image ? '📺' : ''}
                            <button class="favorite-btn active" data-id="${fav.id}" data-type="${fav.type}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                        <div class="content-card-info">
                            <h3>${fav.title}</h3>
                            <p>${fav.type === 'anime' ? 'Anime' : 'Mangá'} favorito</p>
                            <div class="rating">
                                <span class="stars">⭐</span>
                                <span>Favorito</span>
                            </div>
                        </div>
                    </div>
                `;
                
                // Adiciona evento de clique ao card
                card.querySelector('.content-card').addEventListener('click', () => {
                    showItemDetail(fav.id, fav.type);
                });
                
                // Adiciona evento de clique ao botão de favorito
                card.querySelector('.favorite-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const wasAdded = toggleFavorite(fav.id, fav.type, fav.title, fav.image);
                    
                    if (!wasAdded) {
                        card.remove();
                        if (favorites.length === 0) {
                            noFavorites.style.display = 'block';
                        }
                    }
                });
                
                grid.appendChild(card);
            });
        }
        
        // Função para traduzir texto
        function translateText(text) {
            if (!text) return 'N/A';
            return translationDict[text] || text;
        }
        
        // Função para traduzir array de objetos (como gêneros)
        function translateArray(items, property = 'name') {
            if (!items || !Array.isArray(items)) return 'N/A';
            return items.map(item => translateText(item[property])).join(', ');
        }
        
        // Função para traduzir informações de data
        function translateDate(dateString) {
            if (!dateString) return 'N/A';
            
            // Tenta traduzir strings de data comuns
            if (dateString.includes('to')) {
                const [from, to] = dateString.split(' to ');
                return `${translateDate(from)} até ${translateDate(to)}`;
            }
            
            // Traduz meses
            const months = {
                'Jan': 'Jan', 'Feb': 'Fev', 'Mar': 'Mar', 'Apr': 'Abr',
                'May': 'Mai', 'Jun': 'Jun', 'Jul': 'Jul', 'Aug': 'Ago',
                'Sep': 'Set', 'Oct': 'Out', 'Nov': 'Nov', 'Dec': 'Dez'
            };
            
            let translated = dateString;
            Object.keys(months).forEach(enMonth => {
                translated = translated.replace(enMonth, months[enMonth]);
            });
            
            return translated;
        }
        
        // Função para alternar entre páginas
        function showPage(pageId) {
            console.log('Tentando mostrar página:', pageId);
            
            // Verifica se a página existe
            const targetPage = document.getElementById(pageId);
            if (!targetPage) {
                console.error('Página não encontrada:', pageId);
                return;
            }
            
            previousPage = document.querySelector('.page.active').id;
            pageHistory.push(pageId);
            
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            targetPage.classList.add('active');
            window.scrollTo(0, 0);
            
            console.log('Página ativa:', pageId);
            
            // Carrega dados específicos da página se necessário
            if (pageId === 'seasons-page') {
                loadSeasonAnime(2024, 'winter');
            } else if (pageId === 'schedule-page') {
                loadSchedule();
            } else if (pageId === 'characters-page') {
                loadTopCharacters();
            } else if (pageId === 'news-page') {
                loadNews();
            } else if (pageId === 'favorites-page') {
                loadFavorites();
            }
        }
        
        // Função para voltar para a página anterior
        function showPreviousPage() {
            if (pageHistory.length > 1) {
                pageHistory.pop(); // Remove a página atual
                const previousPage = pageHistory[pageHistory.length - 1];
                showPage(previousPage);
            } else {
                showPage('home-page');
            }
        }
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Header background change on scroll
        window.addEventListener('scroll', function() {
            const header = document.querySelector('header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(0, 0, 0, 0.95)';
            } else {
                header.style.background = 'rgba(0, 0, 0, 0.8)';
            }
        });

        // Função para buscar dados da Jikan API
        async function fetchJikanData(endpoint, containerId, type, limit = 8) {
            try {
                showLoading(containerId);
                const response = await fetch(`https://api.jikan.moe/v4/${endpoint}`);
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                
                const container = document.getElementById(containerId);
                container.innerHTML = ''; // Limpa o conteúdo de carregamento
                
                // Limita a itens
                const items = data.data.slice(0, limit);
                
                if (items.length === 0) {
                    container.innerHTML = '<div class="col-12 text-center"><p>Nenhum resultado encontrado.</p></div>';
                    return;
                }
                
                items.forEach(item => {
                    const card = createContentCard(item, type);
                    container.appendChild(card);
                });
                
                updateFavoriteButtons();
            } catch (error) {
                console.error(`Erro ao buscar ${type}:`, error);
                showError(containerId, `Não foi possível carregar os ${type}. Tente novamente mais tarde.`);
            }
        }

        // Função para criar card de conteúdo
        function createContentCard(item, type) {
            const card = document.createElement('div');
            card.className = 'col';
            
            // Formata a sinopse para limitar o tamanho
            let synopsis = item.synopsis || 'Sinopse não disponível.';
            if (synopsis.length > 150) {
                synopsis = synopsis.substring(0, 150) + '...';
            }
            
            // Gera estrelas baseadas na avaliação
            const score = item.score || 0;
            const stars = generateStarRating(score);
            
            const isFav = isFavorite(item.mal_id, type);
            
            card.innerHTML = `
                <div class="content-card">
                    <div class="content-card-image" style="background-image: url('${item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || ''}')">
                        ${!item.images?.jpg?.large_image_url && !item.images?.jpg?.image_url ? '📺' : ''}
                        <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${item.mal_id}" data-type="${type}">
                            <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    <div class="content-card-info">
                        <h3>${item.title}</h3>
                        <p>${synopsis}</p>
                        <div class="rating">
                            <span class="stars">${stars}</span>
                            <span>${score > 0 ? score + '/10' : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Adiciona evento de clique ao card
            card.querySelector('.content-card').addEventListener('click', () => {
                showItemDetail(item.mal_id, type);
            });
            
            // Adiciona evento de clique ao botão de favorito
            card.querySelector('.favorite-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const wasAdded = toggleFavorite(
                    item.mal_id, 
                    type, 
                    item.title, 
                    item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || ''
                );
                
                const btn = card.querySelector('.favorite-btn');
                if (wasAdded) {
                    btn.classList.add('active');
                    btn.innerHTML = '<i class="fas fa-heart"></i>';
                } else {
                    btn.classList.remove('active');
                    btn.innerHTML = '<i class="far fa-heart"></i>';
                }
            });
            
            return card;
        }

        // Função para mostrar loading
        function showLoading(containerId) {
            const container = document.getElementById(containerId);
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="loader"></div>
                    <p>Carregando...</p>
                </div>
            `;
        }

        // Função para mostrar erro
        function showError(containerId, message) {
            const container = document.getElementById(containerId);
            container.innerHTML = `
                <div class="col-12">
                    <div class="error-message">
                        <div class="error-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3>Erro ao carregar</h3>
                        <p>${message}</p>
                        <button class="btn btn-primary-custom mt-3" onclick="location.reload()">
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            `;
        }

        // Função para carregar animes por temporada
        async function loadSeasonAnime(year, season) {
            try {
                showLoading('seasons-container');
                const response = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}`);
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                
                const container = document.getElementById('seasons-container');
                container.innerHTML = ''; // Limpa o conteúdo de carregamento
                
                // Limita a 12 itens
                const items = data.data.slice(0, 12);
                
                if (items.length === 0) {
                    container.innerHTML = '<div class="col-12 text-center"><p>Nenhum anime encontrado para esta temporada.</p></div>';
                    return;
                }
                
                const row = document.createElement('div');
                row.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4';
                
                items.forEach(item => {
                    const card = createContentCard(item, 'anime');
                    row.appendChild(card);
                });
                
                container.appendChild(row);
                updateFavoriteButtons();
                
            } catch (error) {
                console.error('Erro ao carregar animes da temporada:', error);
                showError('seasons-container', 'Não foi possível carregar os animes da temporada. Tente novamente mais tarde.');
            }
        }

        // Função para carregar calendário de lançamentos
        async function loadSchedule() {
            try {
                showLoading('schedule-container');
                const response = await fetch('https://api.jikan.moe/v4/schedules');
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                
                const container = document.getElementById('schedule-container');
                container.innerHTML = ''; // Limpa o conteúdo de carregamento
                
                // Agrupa por dia da semana
                const days = {
                    'monday': [], 'tuesday': [], 'wednesday': [], 'thursday': [],
                    'friday': [], 'saturday': [], 'sunday': [], 'other': []
                };
                
                data.data.forEach(item => {
                    const day = item.broadcast?.day?.toLowerCase() || 'other';
                    if (days[day]) {
                        days[day].push(item);
                    } else {
                        days['other'].push(item);
                    }
                });
                
                // Limita a 5 animes por dia
                Object.keys(days).forEach(day => {
                    days[day] = days[day].slice(0, 5);
                });
                
                // Cria os elementos para cada dia
                Object.keys(days).forEach(day => {
                    if (days[day].length === 0) return;
                    
                    const dayElement = document.createElement('div');
                    dayElement.className = 'schedule-day';
                    
                    const dayTitle = document.createElement('h3');
                    dayTitle.textContent = translateText(day);
                    dayElement.appendChild(dayTitle);
                    
                    days[day].forEach(item => {
                        const animeElement = document.createElement('div');
                        animeElement.className = 'd-flex align-items-center mb-2 p-2 bg-dark bg-opacity-25 rounded';
                        animeElement.style.cursor = 'pointer';
                        
                        animeElement.innerHTML = `
                            <img src="${item.images?.jpg?.small_image_url || ''}" width="50" height="70" class="me-3 rounded" style="object-fit: cover;">
                            <div class="flex-grow-1">
                                <h6 class="mb-0">${item.title}</h6>
                                <small class="text-white-50">${item.broadcast?.time || 'Horário não definido'}</small>
                            </div>
                            <div class="text-warning">
                                <small>⭐ ${item.score || 'N/A'}</small>
                            </div>
                        `;
                        
                        animeElement.addEventListener('click', () => {
                            showItemDetail(item.mal_id, 'anime');
                        });
                        
                        dayElement.appendChild(animeElement);
                    });
                    
                    container.appendChild(dayElement);
                });
                
            } catch (error) {
                console.error('Erro ao carregar calendário:', error);
                showError('schedule-container', 'Não foi possível carregar o calendário. Tente novamente mais tarde.');
            }
        }

        // Função para carregar personagens populares
        async function loadTopCharacters() {
            try {
                showLoading('characters-container');
                const response = await fetch('https://api.jikan.moe/v4/top/characters');
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                
                const container = document.getElementById('characters-container');
                container.innerHTML = ''; // Limpa o conteúdo de carregamento
                
                // Limita a 20 personagens
                const characters = data.data.slice(0, 20);
                
                if (characters.length === 0) {
                    container.innerHTML = '<div class="col-12 text-center"><p>Nenhum personagem encontrado.</p></div>';
                    return;
                }
                
                characters.forEach(character => {
                    const card = document.createElement('div');
                    card.className = 'character-card';
                    
                    card.innerHTML = `
                        <img src="${character.images?.jpg?.image_url || ''}" alt="${character.name}" class="character-image">
                        <div class="character-info">
                            <h3 class="character-name">${character.name}</h3>
                            <p class="character-role">${character.about?.substring(0, 100) || 'Sem descrição'}...</p>
                        </div>
                    `;
                    
                    card.addEventListener('click', () => {
                        // Aqui você pode implementar uma página de detalhes para personagens
                        alert(`Detalhes de ${character.name} serão implementados em breve!`);
                    });
                    
                    container.appendChild(card);
                });
                
            } catch (error) {
                console.error('Erro ao carregar personagens:', error);
                showError('characters-container', 'Não foi possível carregar os personagens. Tente novamente mais tarde.');
            }
        }

        // Função para carregar notícias
        async function loadNews() {
            try {
                showLoading('news-container');
                // Notícias estáticas (a API Jikan não tem endpoint específico para notícias)
                const news = [
                    {
                        title: 'Novo anime de Demon Slayer anunciado',
                        date: '2023-11-15',
                        excerpt: 'Foi anunciado hoje um novo arco do anime Demon Slayer, previsto para estrear em 2024.',
                        image: 'https://via.placeholder.com/300x160/667eea/ffffff?text=Demon+Slayer'
                    },
                    {
                        title: 'One Piece atinge marca histórica',
                        date: '2023-11-10',
                        excerpt: 'O mangá One Piece atingiu a incrível marca de 500 milhões de cópias vendidas em todo o mundo.',
                        image: 'https://via.placeholder.com/300x160/764ba2/ffffff?text=One+Piece'
                    },
                    {
                        title: 'Estúdio anuncia adaptação de novo mangá',
                        date: '2023-11-05',
                        excerpt: 'O estúdio MAPPA anunciou que fará a adaptação do mangá "Chainsaw Man" para anime.',
                        image: 'https://via.placeholder.com/300x160/ff6b6b/ffffff?text=Chainsaw+Man'
                    },
                    {
                        title: 'Festival de anime no Brasil confirmado',
                        date: '2023-10-28',
                        excerpt: 'O maior festival de anime do Brasil confirmou suas datas para 2024 com atrações internacionais.',
                        image: 'https://via.placeholder.com/300x160/ffd93d/000000?text=Anime+Festival'
                    },
                    {
                        title: 'Nova temporada de Attack on Titan',
                        date: '2023-10-20',
                        excerpt: 'A temporada final de Attack on Titan será dividida em três partes, com a primeira estreando em breve.',
                        image: 'https://via.placeholder.com/300x160/4facfe/ffffff?text=Attack+on+Titan'
                    },
                    {
                        title: 'Recorde de vendas para mangá brasileiro',
                        date: '2023-10-15',
                        excerpt: 'Mangá nacional "Turma da Mônica Jovem" bate recorde de vendas no último fim de semana.',
                        image: 'https://via.placeholder.com/300x160/00cdac/ffffff?text=Mangá+Brasileiro'
                    }
                ];
                
                const container = document.getElementById('news-container');
                container.innerHTML = ''; // Limpa o conteúdo de carregamento
                
                news.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'news-card';
                    
                    card.innerHTML = `
                        <img src="${item.image}" alt="${item.title}" class="news-image">
                        <div class="news-info">
                            <h3 class="news-title">${item.title}</h3>
                            <p class="news-date">${translateDate(item.date)}</p>
                            <p class="news-excerpt">${item.excerpt}</p>
                        </div>
                    `;
                    
                    container.appendChild(card);
                });
                
            } catch (error) {
                console.error('Erro ao carregar notícias:', error);
                showError('news-container', 'Não foi possível carregar as notícias. Tente novamente mais tarde.');
            }
        }

        // Função para gerar estrelas baseadas na avaliação
        function generateStarRating(score) {
            if (!score || score === 0) return 'N/A';
            
            const fullStars = Math.floor(score);
            const halfStar = (score - fullStars) >= 0.5;
            let stars = '⭐'.repeat(fullStars);
            
            if (halfStar) {
                stars += '½';
            }
            
            return stars;
        }

        // Função para mostrar detalhes de um item
        async function showItemDetail(id, type) {
            currentItemId = id;
            currentItemType = type;
            
            showPage('detail-page');
            
            try {
                const response = await fetch(`https://api.jikan.moe/v4/${type}/${id}/full`);
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                const item = data.data;
                
                // Atualiza o título
                document.getElementById('detail-title').textContent = item.title;
                
                // Atualiza a imagem
                const detailImage = document.getElementById('detail-image');
                detailImage.src = item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '';
                detailImage.alt = item.title;
                
                // Atualiza a avaliação
                const score = item.score || 0;
                document.getElementById('detail-rating').textContent = generateStarRating(score);
                document.getElementById('detail-score').textContent = score > 0 ? `${score}/10` : 'N/A';
                
                // Atualiza as informações
                const infoGrid = document.getElementById('detail-info-grid');
                infoGrid.innerHTML = '';
                
                // Prepara as informações traduzidas
                const infoItems = [
                    { label: 'Tipo', value: translateText(item.type) },
                    { label: 'Episódios', value: item.episodes || 'N/A' },
                    { label: 'Status', value: translateText(item.status) },
                    { label: 'Data de estreia', value: translateDate(item.aired?.string) },
                    { label: 'Estúdio', value: translateArray(item.studios) },
                    { label: 'Gêneros', value: translateArray(item.genres) },
                    { label: 'Classificação', value: translateText(item.rating) }
                ];
                
                // Para mangás, ajusta as informações
                if (type === 'manga') {
                    infoItems[1] = { label: 'Capítulos', value: item.chapters || 'N/A' };
                    infoItems[4] = { label: 'Autores', value: translateArray(item.authors) };
                    infoItems.splice(6, 1); // Remove a classificação para mangás
                }
                
                infoItems.forEach(info => {
                    const infoItem = document.createElement('div');
                    infoItem.className = 'info-item';
                    infoItem.innerHTML = `
                        <div class="info-label">${info.label}</div>
                        <div class="info-value">${info.value}</div>
                    `;
                    infoGrid.appendChild(infoItem);
                });
                
                // Atualiza a sinopse
                document.getElementById('detail-synopsis').textContent = item.synopsis || 'Sinopse não disponível.';
                
                // Se for um anime, tenta carregar a lista de episódios
                if (type === 'anime') {
                    try {
                        const episodesResponse = await fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`);
                        
                        if (episodesResponse.ok) {
                            const episodesData = await episodesResponse.json();
                            
                            if (episodesData.data && episodesData.data.length > 0) {
                                document.getElementById('episode-list').style.display = 'block';
                                const episodeContainer = document.getElementById('episode-container');
                                episodeContainer.innerHTML = '';
                                
                                // Limita a 10 episódios
                                episodesData.data.slice(0, 10).forEach(episode => {
                                    const episodeItem = document.createElement('div');
                                    episodeItem.className = 'episode-item';
                                    
                                    episodeItem.innerHTML = `
                                        <div class="episode-number">Ep. ${episode.mal_id}</div>
                                        <div class="episode-title">${episode.title || 'Sem título'}</div>
                                        <div class="episode-date">${translateDate(episode.aired)}</div>
                                    `;
                                    
                                    episodeContainer.appendChild(episodeItem);
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Erro ao carregar episódios:', error);
                        // Não mostra erro para o usuário, pois a lista de episódios é secundária
                    }
                }
                
            } catch (error) {
                console.error('Erro ao carregar detalhes:', error);
                showError('detail-page', 'Não foi possível carregar os detalhes. Tente novamente mais tarde.');
            }
        }

        // Função para pesquisar
        async function searchContent(query) {
            if (!query.trim()) {
                alert('Por favor, digite algo para pesquisar.');
                return;
            }
            
            showPage('search-results-page');
            document.getElementById('search-query').textContent = query;
            
            try {
                // Pesquisa tanto animes quanto mangás
                const [animeResponse, mangaResponse] = await Promise.all([
                    fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`),
                    fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=12`)
                ]);
                
                if (!animeResponse.ok || !mangaResponse.ok) {
                    throw new Error('Erro na pesquisa');
                }
                
                const animeData = await animeResponse.json();
                const mangaData = await mangaResponse.json();
                
                // Combina resultados
                const allResults = [
                    ...animeData.data.map(item => ({ ...item, type: 'anime' })),
                    ...mangaData.data.map(item => ({ ...item, type: 'manga' }))
                ];
                
                // Ordena por pontuação (mais altas primeiro)
                allResults.sort((a, b) => (b.score || 0) - (a.score || 0));
                
                // Exibe resultados
                const resultsContainer = document.getElementById('search-results-container');
                const noResults = document.getElementById('no-results');
                const resultsCount = document.getElementById('results-count');
                
                if (allResults.length > 0) {
                    resultsCount.textContent = allResults.length;
                    resultsContainer.innerHTML = '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" id="search-results-grid"></div>';
                    
                    const resultsGrid = document.getElementById('search-results-grid');
                    noResults.style.display = 'none';
                    resultsContainer.style.display = 'block';
                    
                    allResults.forEach(item => {
                        const card = document.createElement('div');
                        card.className = 'col';
                        
                        // Formata a sinopse para limitar o tamanho
                        let synopsis = item.synopsis || 'Sinopse não disponível.';
                        if (synopsis.length > 100) {
                            synopsis = synopsis.substring(0, 100) + '...';
                        }
                        
                        // Gera estrelas baseadas na avaliação
                        const score = item.score || 0;
                        const stars = generateStarRating(score);
                        
                        card.innerHTML = `
                            <div class="content-card">
                                <div class="content-card-image" style="background-image: url('${item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || ''}')">
                                    ${!item.images?.jpg?.large_image_url && !item.images?.jpg?.image_url ? '📺' : ''}
                                </div>
                                <div class="content-card-info">
                                    <h3>${item.title}</h3>
                                    <p><span class="badge bg-primary">${item.type === 'anime' ? 'Anime' : 'Mangá'}</span></p>
                                    <p>${synopsis}</p>
                                    <div class="rating">
                                        <span class="stars">${stars}</span>
                                        <span>${score > 0 ? score + '/10' : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        // Adiciona evento de clique ao card
                        card.querySelector('.content-card').addEventListener('click', () => {
                            showItemDetail(item.mal_id, item.type);
                        });
                        
                        resultsGrid.appendChild(card);
                    });
                } else {
                    resultsContainer.style.display = 'none';
                    noResults.style.display = 'block';
                }
            } catch (error) {
                console.error('Erro na pesquisa:', error);
                showError('search-results-page', 'Ocorreu um erro durante a pesquisa. Tente novamente mais tarde.');
            }
        }

        // Função para mostrar/ocultar filtros
        function showFilters(type) {
            const animeFilters = document.getElementById('anime-filters');
            const mangaFilters = document.getElementById('manga-filters');
            
            if (type === 'anime') {
                animeFilters.style.display = animeFilters.style.display === 'none' ? 'block' : 'none';
                mangaFilters.style.display = 'none';
            } else {
                mangaFilters.style.display = mangaFilters.style.display === 'none' ? 'block' : 'none';
                animeFilters.style.display = 'none';
            }
        }

        // Função para aplicar filtros
        function applyFilters(type) {
            alert('Funcionalidade de filtros será implementada em breve!');
            // Esta função seria implementada para filtrar os resultados
            // com base nos valores selecionados nos filtros
        }

        // Função para mudar de página (paginação)
        function changePage(direction, type) {
            if (type === 'anime') {
                if (direction === 'prev') {
                    currentAnimePage = Math.max(1, currentAnimePage - 1);
                } else if (direction === 'next') {
                    currentAnimePage += 1;
                } else {
                    currentAnimePage = direction;
                }
                
                // Aqui você implementaria a lógica para carregar a página específica
                fetchJikanData(`top/anime?page=${currentAnimePage}`, 'anime-container', 'anime');
                
            } else if (type === 'manga') {
                if (direction === 'prev') {
                    currentMangaPage = Math.max(1, currentMangaPage - 1);
                } else if (direction === 'next') {
                    currentMangaPage += 1;
                } else {
                    currentMangaPage = direction;
                }
                
                // Aqui você implementaria a lógica para carregar a página específica
                fetchJikanData(`top/manga?page=${currentMangaPage}`, 'manga-container', 'manga');
            }
        }

        // Adiciona event listeners para pesquisa
        document.getElementById('search-btn').addEventListener('click', () => {
            const query = document.getElementById('search-input').value;
            searchContent(query);
        });

        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = document.getElementById('search-input').value;
                searchContent(query);
            }
        });

        // Adiciona event listeners para os botões de temporada
        document.querySelectorAll('.season-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const year = this.getAttribute('data-year');
                const season = this.getAttribute('data-season');
                loadSeasonAnime(year, season);
            });
        });

        // Modo escuro/claro
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;

        // Verifica se há uma preferência salva
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            
            if (body.classList.contains('dark-mode')) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                localStorage.setItem('theme', 'dark');
            } else {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                localStorage.setItem('theme', 'light');
            }
        });

        // Carrega os dados quando a página estiver pronta
        document.addEventListener('DOMContentLoaded', function() {
            console.log('OtakuVerse carregado com sucesso!');
            
            // Busca animes e mangás populares
            fetchJikanData('top/anime', 'anime-container', 'anime');
            fetchJikanData('top/manga', 'manga-container', 'manga');
            
            // Anima statistics numbers
            function animateNumber(element, target) {
                let current = 0;
                const increment = target / 100;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    element.textContent = Math.floor(current).toLocaleString() + '+';
                }, 20);
            }

            // Intersection Observer for animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (entry.target.classList.contains('stat-number')) {
                            const target = entry.target.textContent.replace(/\D/g, '');
                            animateNumber(entry.target, parseInt(target));
                        }
                    }
                });
            });

            document.querySelectorAll('.stat-number').forEach(el => {
                observer.observe(el);
            });
        });

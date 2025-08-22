        // Variáveis globais
        let currentItemId = null;
        let currentItemType = null;
        
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
            
            // Genres (exemplos)
            'Action': 'Ação',
            'Adventure': 'Aventura',
            'Comedy': 'Comédia',
            'Drama': 'Drama',
            'Fantasy': 'Fantasia',
            'Horror': 'Terror',
            'Mystery': 'Mistério',
            'Romance': 'Romance',
            'Sci-Fi': 'Ficção Científica',
            'Slice of Life': 'Slice of Life',
            'Sports': 'Esportes',
            'Supernatural': 'Sobrenatural',
            'Suspense': 'Suspense',
            'Ecchi': 'Ecchi',
            'Harem': 'Harem',
            'Isekai': 'Isekai',
            'Mecha': 'Mecha',
            'Shounen': 'Shounen',
            'Shoujo': 'Shoujo',
            'Seinen': 'Seinen',
            'Josei': 'Josei',
            
            // Seasons
            'Summer': 'Verão',
            'Winter': 'Inverno',
            'Spring': 'Primavera',
            'Fall': 'Outono'
        };
        
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
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');
            window.scrollTo(0, 0);
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
        async function fetchJikanData(endpoint, containerId, type) {
            try {
                const response = await fetch(`https://api.jikan.moe/v4/${endpoint}`);
                const data = await response.json();
                
                const container = document.getElementById(containerId);
                container.innerHTML = ''; // Limpa o conteúdo de carregamento
                
                // Limita a 8 itens
                const items = data.data.slice(0, 8);
                
                items.forEach(item => {
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
                    
                    card.innerHTML = `
                        <div class="content-card">
                            <div class="content-card-image" style="background-image: url('${item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || ''}')">
                                ${!item.images?.jpg?.large_image_url && !item.images?.jpg?.image_url ? '📺' : ''}
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
                    
                    container.appendChild(card);
                });
            } catch (error) {
                console.error(`Erro ao buscar ${type}:`, error);
                const container = document.getElementById(containerId);
                container.innerHTML = `<div class="col-12 text-center"><p>Não foi possível carregar os ${type}. Tente novamente mais tarde.</p></div>`;
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
                
            } catch (error) {
                console.error('Erro ao carregar detalhes:', error);
                document.getElementById('detail-title').textContent = 'Erro ao carregar';
                document.getElementById('detail-synopsis').textContent = 'Não foi possível carregar os detalhes. Tente novamente mais tarde.';
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
                document.getElementById('search-results-container').innerHTML = `
                    <div class="alert alert-danger">
                        Ocorreu um erro durante a pesquisa. Tente novamente mais tarde.
                    </div>
                `;
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
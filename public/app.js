let currentGameId = null;

// Utility functions for professional UX
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');
    
    // Set icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle', 
        warning: 'fas fa-exclamation-triangle'
    };
    
    icon.className = `toast-icon ${type}`;
    icon.innerHTML = `<i class="${icons[type]}"></i>`;
    messageEl.textContent = message;
    
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

function updateStats() {
    // This will be called after loading games to update stats
    const gamesList = document.getElementById('gamesList');
    const totalGamesEl = document.getElementById('totalGames');
    const games = gamesList.children.length;
    
    if (totalGamesEl) {
        totalGamesEl.textContent = games;
    }
}

function getPlayerInitials(name) {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

async function loadGames() {
    showLoading('loadingGames');
    
    try {
        const response = await fetch('/api/games');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const games = await response.json();
        displayGames(games);
        updateStats();
        showToast('Juegos cargados correctamente', 'success');
    } catch (error) {
        console.error('Error loading games:', error);
        showToast('Error al cargar los juegos. Inténtalo de nuevo.', 'error');
        displayGames([]); // Show empty state
    } finally {
        hideLoading('loadingGames');
    }
}

function displayGames(games) {
    const gamesList = document.getElementById('gamesList');
    gamesList.innerHTML = '';
    
    if (games.length === 0) {
        gamesList.innerHTML = `
            <div class="empty-state fade-in">
                <i class="fas fa-gamepad"></i>
                <h3>No hay juegos todavía</h3>
                <p>Crea tu primer juego para comenzar a llevar el conteo de puntos</p>
            </div>
        `;
        return;
    }
    
    games.forEach((game, index) => {
        const gameItem = document.createElement('div');
        gameItem.className = 'game-item fade-in';
        gameItem.style.animationDelay = `${index * 0.1}s`;
        
        gameItem.innerHTML = `
            <div class="game-info">
                <div class="game-info-left">
                    <div class="game-icon">
                        <i class="fas fa-gamepad"></i>
                    </div>
                    <div class="game-details">
                        <h4>${game.name}</h4>
                        <div class="game-players">
                            <i class="fas fa-users"></i>
                            ${game.players.length} jugador${game.players.length !== 1 ? 'es' : ''}
                        </div>
                    </div>
                </div>
                <div class="game-actions">
                    <button onclick="deleteGame('${game._id}')" class="btn btn-danger btn-xs" title="Eliminar juego">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        gameItem.addEventListener('click', (e) => {
            if (!e.target.closest('.game-actions')) {
                openGame(game._id);
            }
        });
        
        gamesList.appendChild(gameItem);
    });
}

async function createGame() {
    const nameInput = document.getElementById('gameNameInput');
    const name = nameInput.value.trim();
    const button = event.target;
    
    if (!name) {
        showToast('Por favor, ingresa el nombre del juego', 'warning');
        nameInput.focus();
        return;
    }
    
    // Disable button and show loading state
    button.disabled = true;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
    
    try {
        const response = await fetch('/api/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });
        
        if (response.ok) {
            nameInput.value = '';
            showToast(`Juego "${name}" creado exitosamente`, 'success');
            loadGames();
        } else {
            const error = await response.json();
            showToast(`Error al crear el juego: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error creating game:', error);
        showToast('Error de conexión. Verifica tu internet e inténtalo de nuevo.', 'error');
    } finally {
        // Restore button
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

async function deleteGame(gameId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este juego? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/games/${gameId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Juego eliminado correctamente', 'success');
            loadGames();
        } else {
            const error = await response.json();
            showToast(`Error al eliminar el juego: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error deleting game:', error);
        showToast('Error de conexión al eliminar el juego', 'error');
    }
}

async function openGame(gameId) {
    currentGameId = gameId;
    showLoading('loadingPlayers');
    
    try {
        const response = await fetch(`/api/games/${gameId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const game = await response.json();
        
        document.getElementById('currentGameName').textContent = game.name;
        document.getElementById('totalPlayers').textContent = game.players.length;
        document.getElementById('gamesSection').style.display = 'none';
        document.getElementById('gameDetail').style.display = 'block';
        
        displayPlayers(game.players);
    } catch (error) {
        console.error('Error loading game:', error);
        showToast('Error al cargar el juego', 'error');
    } finally {
        hideLoading('loadingPlayers');
    }
}

function displayPlayers(players) {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    
    if (players.length === 0) {
        playersList.innerHTML = `
            <div class="empty-state fade-in">
                <i class="fas fa-users"></i>
                <h3>No hay jugadores todavía</h3>
                <p>Agrega jugadores para comenzar a llevar el conteo de puntos</p>
            </div>
        `;
        return;
    }
    
    // Sort players by points (descending)
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
    
    sortedPlayers.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card fade-in';
        playerCard.style.animationDelay = `${index * 0.1}s`;
        
        const initials = getPlayerInitials(player.name);
        
        playerCard.innerHTML = `
            <div class="player-header">
                <div class="player-info">
                    <div class="player-avatar">
                        ${initials}
                    </div>
                    <div class="player-details">
                        <h3>${player.name}</h3>
                        ${index === 0 && player.points > 0 ? '<small style="color: var(--warning-color);"><i class="fas fa-crown"></i> Líder</small>' : ''}
                    </div>
                </div>
                <div class="player-score">
                    ${player.points}
                </div>
            </div>
            <div class="points-controls">
                <button class="btn-round btn-minus" onclick="changePoints('${player._id}', ${player.points - 1})" title="Restar punto">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="points-input" value="${player.points}" 
                       onchange="changePoints('${player._id}', parseInt(this.value) || 0)" 
                       title="Editar puntos directamente">
                <button class="btn-round btn-plus" onclick="changePoints('${player._id}', ${player.points + 1})" title="Sumar punto">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn btn-secondary btn-xs" onclick="deletePlayer('${player._id}')" title="Eliminar jugador">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        playersList.appendChild(playerCard);
    });
    
    // Update total players counter
    document.getElementById('totalPlayers').textContent = players.length;
}

async function addPlayer() {
    const nameInput = document.getElementById('playerNameInput');
    const name = nameInput.value.trim();
    const button = event.target;
    
    if (!name) {
        showToast('Por favor, ingresa el nombre del jugador', 'warning');
        nameInput.focus();
        return;
    }
    
    // Disable button and show loading state
    button.disabled = true;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...';
    
    try {
        const response = await fetch(`/api/games/${currentGameId}/players`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });
        
        if (response.ok) {
            const game = await response.json();
            nameInput.value = '';
            showToast(`Jugador "${name}" agregado exitosamente`, 'success');
            displayPlayers(game.players);
        } else {
            const error = await response.json();
            showToast(`Error al agregar jugador: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error adding player:', error);
        showToast('Error de conexión al agregar jugador', 'error');
    } finally {
        // Restore button
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

async function changePoints(playerId, newPoints) {
    showLoading('loadingPlayers');
    
    try {
        const response = await fetch(`/api/games/${currentGameId}/players/${playerId}/points`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ points: newPoints })
        });
        
        if (response.ok) {
            const game = await response.json();
            displayPlayers(game.players);
            
            // Show a subtle success indicator
            const pointsChange = newPoints >= 0 ? `${newPoints} puntos` : '0 puntos';
            showToast(`Puntos actualizados: ${pointsChange}`, 'success');
        } else {
            const error = await response.json();
            showToast(`Error al actualizar puntos: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error updating points:', error);
        showToast('Error de conexión al actualizar puntos', 'error');
    } finally {
        hideLoading('loadingPlayers');
    }
}

async function deletePlayer(playerId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este jugador? Esta acción no se puede deshacer.')) {
        return;
    }
    
    showLoading('loadingPlayers');
    
    try {
        const response = await fetch(`/api/games/${currentGameId}/players/${playerId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const game = await response.json();
            showToast('Jugador eliminado correctamente', 'success');
            displayPlayers(game.players);
        } else {
            const error = await response.json();
            showToast(`Error al eliminar jugador: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error deleting player:', error);
        showToast('Error de conexión al eliminar jugador', 'error');
    } finally {
        hideLoading('loadingPlayers');
    }
}

function goBack() {
    document.getElementById('gamesSection').style.display = 'block';
    document.getElementById('gameDetail').style.display = 'none';
    currentGameId = null;
    // Refresh games list to show updated player counts
    loadGames();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data without showing success toast
    loadGamesInitial();
    
    // Add keyboard shortcuts for better UX
    document.getElementById('gameNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            createGame();
        }
    });
    
    document.getElementById('playerNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPlayer();
        }
    });
    
    // Add focus management
    document.getElementById('gameNameInput').addEventListener('input', (e) => {
        const button = document.querySelector('[onclick="createGame()"]');
        button.disabled = !e.target.value.trim();
    });
    
    document.getElementById('playerNameInput').addEventListener('input', (e) => {
        const button = document.querySelector('[onclick="addPlayer()"]');
        button.disabled = !e.target.value.trim();
    });
});

// Special initial load without success toast
async function loadGamesInitial() {
    showLoading('loadingGames');
    
    try {
        const response = await fetch('/api/games');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const games = await response.json();
        displayGames(games);
        updateStats();
    } catch (error) {
        console.error('Error loading games:', error);
        showToast('Error al cargar los juegos. Inténtalo de nuevo.', 'error');
        displayGames([]);
    } finally {
        hideLoading('loadingGames');
    }
}
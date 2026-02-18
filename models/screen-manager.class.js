/**
 * Manages game overlay screens (Game Over, Win Screen)
 */
class ScreenManager {
    /**
     * Creates a new ScreenManager instance
     */
    constructor() {
        this.overlayContainer = null;
        this.createOverlayContainer();
    }

    /**
     * Creates the overlay container in DOM
     */
    createOverlayContainer() {
        this.overlayContainer = document.createElement('div');
        this.overlayContainer.id = 'game-overlay';
        this.overlayContainer.className = 'game-overlay hidden';
        document.body.appendChild(this.overlayContainer);
    }

    /**
     * Shows the game over screen
     */
    showGameOver() {
        this.overlayContainer.innerHTML = this.getGameOverTemplate();
        this.overlayContainer.classList.remove('hidden');
        this.addGameOverListeners();
    }

    /**
     * Shows the win screen with restart button
     */
    showWinScreen() {
        this.overlayContainer.innerHTML = this.getWinScreenTemplate();
        this.overlayContainer.classList.remove('hidden');
        this.addWinScreenListeners();
    }

    /**
     * Hides all overlay screens
     */
    hideScreens() {
        this.overlayContainer.classList.add('hidden');
        this.overlayContainer.innerHTML = '';
    }

    /**
     * Returns game over screen HTML template
     * @returns {string} HTML template string
     */
    getGameOverTemplate() {
        return `
            <div class="screen-content">
                <img src="img/9_intro_outro_screens/game_over/game over.png" 
                     alt="Game Over" class="screen-image">
                <div class="screen-text">
                    Press any key to restart
                </div>
            </div>
        `;
    }

    /**
     * Returns win screen HTML template  
     * @returns {string} HTML template string
     */
    getWinScreenTemplate() {
        return `
            <div class="screen-content">
                <img src="img/You won, you lost/You Won B.png" 
                     alt="You Won" class="screen-image">
                <button id="restart-button" class="restart-button">
                    Play Again
                </button>
            </div>
        `;
    }

    /**
     * Adds event listeners for game over screen
     */
    addGameOverListeners() {
        const handleKeyPress = (event) => {
            document.removeEventListener('keydown', handleKeyPress);
            this.triggerRestart();
        };
        document.addEventListener('keydown', handleKeyPress);
    }

    /**
     * Adds event listeners for win screen
     */
    addWinScreenListeners() {
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.triggerRestart();
            });
        }
    }

    /**
     * Triggers game restart event
     */
    triggerRestart() {
        const restartEvent = new CustomEvent('gameRestart');
        document.dispatchEvent(restartEvent);
    }
}
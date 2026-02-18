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
        const existingOverlay = document.getElementById('game-overlay');
        if (existingOverlay) {
            this.overlayContainer = existingOverlay;
            return;
        }
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
     * Shows the start screen
     */
    showStartScreen() {
        this.overlayContainer.innerHTML = this.getStartScreenTemplate();
        this.overlayContainer.classList.remove('hidden');
        this.addStartScreenListeners();
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
     * Returns start screen HTML template
     * @returns {string} HTML template string
     */
    getStartScreenTemplate() {
        return `
            <div class="screen-content startscreen">
                <img src="img/9_intro_outro_screens/start/startscreen_2.png" 
                     alt="Start Screen" class="screen-image startscreen-image">
                ${this.getStartscreenButtonsTemplate()}
                ${this.getControlsSectionTemplate()}
                ${this.getImprintSectionTemplate()}
            </div>
        `;
    }

    /**
     * Returns start screen buttons template
     * @returns {string} HTML template string
     */
    getStartscreenButtonsTemplate() {
        return `
            <div class="startscreen-buttons">
                <button id="start-game-button" class="startscreen-button primary">Start Game</button>
                <button id="controls-button" class="startscreen-button">Controls</button>
                <button id="imprint-button" class="startscreen-button">Imprint</button>
            </div>
        `;
    }

    /**
     * Returns controls section template
     * @returns {string} HTML template string
     */
    getControlsSectionTemplate() {
        return `
            <div id="startscreen-controls" class="startscreen-section hidden">
                <h2 class="startscreen-heading">Controls</h2>
                <ul class="startscreen-list">
                    <li>Arrow Left / Right - Move</li>
                    <li>Space - Jump</li>
                    <li>D - Throw bottle</li>
                </ul>
            </div>
        `;
    }

    /**
     * Returns imprint section template
     * @returns {string} HTML template string
     */
    getImprintSectionTemplate() {
        return `
            <div id="startscreen-imprint" class="startscreen-section hidden">
                <h2 class="startscreen-heading">Imprint</h2>
                <p class="startscreen-text">This is a placeholder imprint text. Add your legal notice here.</p>
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
     * Adds event listeners for start screen
     */
    addStartScreenListeners() {
        const startButton = document.getElementById('start-game-button');
        const controlsButton = document.getElementById('controls-button');
        const imprintButton = document.getElementById('imprint-button');
        if (startButton) startButton.addEventListener('click', () => this.triggerStart());
        if (controlsButton) controlsButton.addEventListener('click', () => this.showStartSection('controls'));
        if (imprintButton) imprintButton.addEventListener('click', () => this.showStartSection('imprint'));
    }

    /**
     * Shows the selected start screen section
     * @param {string} sectionName - Section to show
     */
    showStartSection(sectionName) {
        this.setStartSectionState('controls', sectionName === 'controls');
        this.setStartSectionState('imprint', sectionName === 'imprint');
    }

    /**
     * Toggles start screen sections
     * @param {string} sectionName - Section id suffix
     * @param {boolean} isVisible - Visibility state
     */
    setStartSectionState(sectionName, isVisible) {
        const element = document.getElementById(`startscreen-${sectionName}`);
        if (!element) return;
        element.classList.toggle('hidden', !isVisible);
    }

    /**
     * Triggers game restart event
     */
    triggerRestart() {
        const restartEvent = new CustomEvent('gameRestart');
        document.dispatchEvent(restartEvent);
    }

    /**
     * Triggers game start event
     */
    triggerStart() {
        const startEvent = new CustomEvent('gameStart');
        this.hideScreens();
        document.dispatchEvent(startEvent);
    }
}
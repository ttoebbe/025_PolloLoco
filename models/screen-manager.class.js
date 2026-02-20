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
    this.setupAudioListeners();
  }

  /**
   * Creates the overlay container in DOM
   */
  createOverlayContainer() {
    const existingOverlay = document.getElementById("game-overlay");
    if (existingOverlay) {
      this.overlayContainer = existingOverlay;
      return;
    }
    this.overlayContainer = document.createElement("div");
    this.overlayContainer.id = "game-overlay";
    this.overlayContainer.className = "game-overlay hidden";
    document.body.appendChild(this.overlayContainer);
  }

  /**
   * Shows the game over screen
   */
  showGameOver() {
    this.overlayContainer.innerHTML = this.getGameOverTemplate();
    this.overlayContainer.classList.remove("hidden");
    this.addGameOverListeners();
  }

  /**
   * Shows the win screen with restart button
   */
  showWinScreen() {
    this.overlayContainer.innerHTML = this.getWinScreenTemplate();
    this.overlayContainer.classList.remove("hidden");
    this.addWinScreenListeners();
  }

  /**
   * Shows the start screen
   */
  showStartScreen() {
    this.overlayContainer.innerHTML = this.getStartScreenTemplate();
    this.overlayContainer.classList.remove("hidden");
    this.addStartScreenListeners();
    this.updateMuteIcons(this.getAudioMutedState());
  }

  /**
   * Hides all overlay screens
   */
  hideScreens() {
    this.overlayContainer.classList.add("hidden");
    this.overlayContainer.innerHTML = "";
  }

  /**
   * Returns game over screen HTML template
   * @returns {string} HTML template string
   */
  getGameOverTemplate() {
    return `
      <div class="screen-content">
        <img src="img/9_intro_outro_screens/game_over/game over.png" alt="Game Over" class="screen-image">
        <div class="screen-text">Press any key to restart</div>
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
        <img src="img/You won, you lost/You Won B.png" alt="You Won" class="screen-image">
        <button id="restart-button" class="restart-button">Play Again</button>
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
        ${this.getTopRightButtonsTemplate()}
        <img src="img/9_intro_outro_screens/start/startscreen_2.png" alt="Start Screen" class="screen-image startscreen-image">
      </div>
    `;
  }

  /**
   * Returns top right button area
   * @returns {string} HTML template string
   */
  getTopRightButtonsTemplate() {
    return `
      <div class="button-container top-right-buttons">
        ${this.getStartButtonTemplate()}
        ${this.getMuteButtonTemplate()}
        ${this.getFullscreenButtonTemplate()}
        ${this.getControlsButtonTemplate()}
        ${this.getImpressumButtonTemplate()}
      </div>
    `;
  }

  /**
   * Returns start button template
   * @returns {string} HTML template string
   */
  getStartButtonTemplate() {
    return `<button id="start-button" type="button">Start</button>`;
  }

  /**
   * Returns mute button template
   * @returns {string} HTML template string
   */
  getMuteButtonTemplate() {
    return `
      <button id="mute" class="icon-button" type="button">
        <img id="mute-icon" src="img/button_background_images/soundon.svg" alt="Toggle sound">
      </button>
    `;
  }

  /**
   * Returns fullscreen button template
   * @returns {string} HTML template string
   */
  getFullscreenButtonTemplate() {
    return `<button id="fullscreen-toggle" type="button">Fullscreen</button>`;
  }

  /**
   * Returns controls button template
   * @returns {string} HTML template string
   */
  getControlsButtonTemplate() {
    return `
      <button id="controls" class="icon-button" type="button">
        <img src="img/button_background_images/controls.svg" alt="Controls">
      </button>
    `;
  }

  /**
   * Returns impressum button template
   * @returns {string} HTML template string
   */
  getImpressumButtonTemplate() {
    return `
      <button id="impressum" class="icon-button" type="button">
        <img src="img/button_background_images/imprint.svg" alt="Imprint">
      </button>
    `;
  }

  /**
   * Adds event listeners for game over screen
   */
  addGameOverListeners() {
    const handleKeyPress = () => {
      document.removeEventListener("keydown", handleKeyPress);
      this.triggerRestart();
    };
    document.addEventListener("keydown", handleKeyPress);
  }

  /**
   * Adds event listeners for win screen
   */
  addWinScreenListeners() {
    const restartButton = document.getElementById("restart-button");
    if (!restartButton) return;
    restartButton.addEventListener("click", () => this.triggerRestart());
  }

  /**
   * Adds event listeners for start screen
   */
  addStartScreenListeners() {
    this.bindButtonClick("start-button", () => this.triggerStart());
    this.bindButtonClick("mute", () => this.toggleMute());
    this.bindButtonClick("fullscreen-toggle", () => this.toggleFullscreen());
    this.bindButtonClick("controls", () => this.handlePlaceholderClick("Controls"));
    this.bindButtonClick("impressum", () => this.handlePlaceholderClick("Imprint"));
  }

  /**
   * Binds click listener when button exists
   * @param {string} buttonId - Target button id
   * @param {Function} callback - Click callback
   */
  bindButtonClick(buttonId, callback) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    button.addEventListener("click", callback);
  }

  /**
   * Toggles global mute state
   */
  toggleMute() {
    if (!window.audioManager) return;
    window.audioManager.toggleMute();
  }

  /**
   * Registers audio mute listeners
   */
  setupAudioListeners() {
    document.addEventListener("audioMuteChanged", (event) => this.handleAudioMuteChanged(event));
  }

  /**
   * Handles mute change event
   * @param {CustomEvent} event - Mute change event
   */
  handleAudioMuteChanged(event) {
    const isMuted = event?.detail?.isMuted ?? this.getAudioMutedState();
    this.updateMuteIcons(isMuted);
  }

  /**
   * Returns global muted state
   * @returns {boolean} True if muted
   */
  getAudioMutedState() {
    return window.audioManager ? window.audioManager.isMuted : false;
  }

  /**
   * Updates mute icons in UI
   * @param {boolean} isMuted - Current mute state
   */
  updateMuteIcons(isMuted) {
    this.updateStartMuteIcon(isMuted);
    this.updateRuntimeMuteIcon(isMuted);
  }

  /**
   * Updates startscreen mute icon
   * @param {boolean} isMuted - Current mute state
   */
  updateStartMuteIcon(isMuted) {
    const muteIcon = document.getElementById("mute-icon");
    if (!muteIcon) return;
    muteIcon.src = isMuted ? "img/button_background_images/mute.svg" : "img/button_background_images/soundon.svg";
  }

  /**
   * Updates runtime mute icon
   * @param {boolean} isMuted - Current mute state
   */
  updateRuntimeMuteIcon(isMuted) {
    const runtimeMuteIcon = document.getElementById("runtime-mute-icon");
    if (!runtimeMuteIcon) return;
    runtimeMuteIcon.src = isMuted ? "img/button_background_images/mute.svg" : "img/button_background_images/soundon.svg";
  }

  /**
   * Toggles fullscreen mode for canvas shell
   */
  toggleFullscreen() {
    const canvasShell = document.querySelector(".canvas-shell");
    if (!canvasShell) return;
    if (!document.fullscreenElement) {
      canvasShell.requestFullscreen?.();
      return;
    }
    document.exitFullscreen?.();
  }

  /**
   * Handles placeholder button actions
   * @param {string} sectionName - Placeholder name
   */
  handlePlaceholderClick(sectionName) {
    console.info(`${sectionName} placeholder is not implemented yet.`);
  }

  /**
   * Triggers game restart event
   */
  triggerRestart() {
    const restartEvent = new CustomEvent("gameRestart");
    document.dispatchEvent(restartEvent);
  }

  /**
   * Triggers game start event
   */
  triggerStart() {
    this.hideScreens();
    const startEvent = new CustomEvent("gameStart");
    document.dispatchEvent(startEvent);
  }
}

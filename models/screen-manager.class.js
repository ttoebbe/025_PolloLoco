/**
 * Manages game overlay screens (Game Over, Win Screen)
 */
class ScreenManager {
  /**
   * Creates a new ScreenManager instance
   */
  constructor() {
    this.overlayContainer = null;
    this.gameOverKeyHandler = null;
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
    this.removeGameOverListeners();
    this.overlayContainer.classList.add("hidden");
    this.overlayContainer.innerHTML = "";
  }

  /**
   * Returns game over screen HTML template
   * @returns {string} HTML template string
   */
  getGameOverTemplate() {
    return `
      <div class="screen-content game-over-screen">
        <img src="img/9_intro_outro_screens/game_over/game over.png" alt="Game Over" class="screen-image game-over-image">
        ${this.getGameOverActionsTemplate()}
      </div>
    `;
  }

  /**
   * Returns game over action area template
   * @returns {string} HTML template string
   */
  getGameOverActionsTemplate() {
    return `<div class="game-over-actions">${this.getGameOverRestartButtonTemplate()}</div>`;
  }

  /**
   * Returns game over restart button template
   * @returns {string} HTML template string
   */
  getGameOverRestartButtonTemplate() {
    return `<button id="game-over-restart-button" class="game-over-restart-button" type="button">Restart</button>`;
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
        <div class="top-right-button-row">
          ${this.getStartButtonTemplate()}
          ${this.getMuteButtonTemplate()}
          ${this.getFullscreenButtonTemplate()}
          ${this.getControlsButtonTemplate()}
          ${this.getImpressumButtonTemplate()}
        </div>
        <div id="controls-info" class="startscreen-info hidden" aria-live="polite">
          Tastatur: <br>
          ←/→: Laufen <br>
          Leertaste: Springen <br>
          D: Werfen
        </div>
        <div id="imprint-info" class="startscreen-info hidden" aria-live="polite">
          Dieses Game wurde erstellt von: Thomas Többe-Hömke <br>
          Mail: toebbe.thomas@outlook.de
        </div>
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
      <button id="controls" class="icon-button" type="button" aria-expanded="false" aria-controls="controls-info">
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
      <button id="impressum" class="icon-button" type="button" aria-expanded="false" aria-controls="imprint-info">
        <img src="img/button_background_images/imprint.svg" alt="Imprint">
      </button>
    `;
  }

  /**
   * Adds event listeners for game over screen
   */
  addGameOverListeners() {
    this.bindGameOverButton();
    this.bindGameOverKey();
  }

  /**
   * Binds game over restart button click
   */
  bindGameOverButton() {
    this.bindButtonClick("game-over-restart-button", () => this.triggerRestart());
  }

  /**
   * Binds game over keyboard restart
   */
  bindGameOverKey() {
    this.removeGameOverListeners();
    this.gameOverKeyHandler = () => this.triggerRestart();
    document.addEventListener("keydown", this.gameOverKeyHandler);
  }

  /**
   * Removes game over keyboard restart listener
   */
  removeGameOverListeners() {
    if (!this.gameOverKeyHandler) return;
    document.removeEventListener("keydown", this.gameOverKeyHandler);
    this.gameOverKeyHandler = null;
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
    this.bindButtonClick("controls", () => this.toggleInfoPanel("controls"));
    this.bindButtonClick("impressum", () => this.toggleInfoPanel("imprint"));
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
   * Toggles one startscreen info panel and closes the other
   * @param {"controls" | "imprint"} panelName - Panel to toggle
   */
  toggleInfoPanel(panelName) {
    const controlsInfo = document.getElementById("controls-info");
    const imprintInfo = document.getElementById("imprint-info");
    if (!controlsInfo || !imprintInfo) return;

    const isControlsOpen = !controlsInfo.classList.contains("hidden");
    const isImprintOpen = !imprintInfo.classList.contains("hidden");

    if (panelName === "controls") {
      this.setInfoPanelVisibility(!isControlsOpen, false);
      return;
    }
    this.setInfoPanelVisibility(false, !isImprintOpen);
  }

  /**
   * Applies startscreen info panel visibility and aria states
   * @param {boolean} controlsOpen - Controls info visible state
   * @param {boolean} imprintOpen - Imprint info visible state
   */
  setInfoPanelVisibility(controlsOpen, imprintOpen) {
    const controlsInfo = document.getElementById("controls-info");
    const imprintInfo = document.getElementById("imprint-info");
    const controlsButton = document.getElementById("controls");
    const imprintButton = document.getElementById("impressum");

    if (controlsInfo) controlsInfo.classList.toggle("hidden", !controlsOpen);
    if (imprintInfo) imprintInfo.classList.toggle("hidden", !imprintOpen);
    if (controlsButton) controlsButton.setAttribute("aria-expanded", `${controlsOpen}`);
    if (imprintButton) imprintButton.setAttribute("aria-expanded", `${imprintOpen}`);
  }

  /**
   * Triggers game restart event
   */
  triggerRestart() {
    this.removeGameOverListeners();
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

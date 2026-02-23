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
    this.imprintEscapeHandler = null;
    this.createOverlayContainer();
    this.setupAudioListeners();
  }

  /**
   * Creates the overlay container in DOM
   */
  createOverlayContainer() {
    const existingOverlay = document.getElementById("game-overlay");
    if (existingOverlay) {
      existingOverlay.classList.add("notranslate");
      existingOverlay.setAttribute("translate", "no");
      this.overlayContainer = existingOverlay;
      return;
    }
    this.overlayContainer = document.createElement("div");
    this.overlayContainer.id = "game-overlay";
    this.overlayContainer.className = "game-overlay hidden notranslate";
    this.overlayContainer.setAttribute("translate", "no");
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
    this.closeImprintModal(false);
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
    return `
      <div class="game-over-actions">
        ${this.getGameOverRestartButtonTemplate()}
        ${this.getBackToMenuButtonTemplate("game-over-menu-button")}
      </div>
    `;
  }

  /**
   * Returns game over restart button template
   * @returns {string} HTML template string
   */
  getGameOverRestartButtonTemplate() {
    return `<button id="game-over-restart-button" class="game-over-restart-button" type="button">Restart</button>`;
  }

  /**
   * Returns one endscreen back-to-menu button template
   * @param {string} buttonId - Button id
   * @returns {string} HTML template string
   */
  getBackToMenuButtonTemplate(buttonId) {
    return `<button id="${buttonId}" class="game-over-restart-button" type="button">Back to Menu</button>`;
  }

  /**
   * Returns win screen HTML template
   * @returns {string} HTML template string
   */
  getWinScreenTemplate() {
    return `
      <div class="screen-content game-over-screen">
        <img src="img/You won, you lost/You Won B.png" alt="You Won" class="screen-image">
        ${this.getWinActionsTemplate()}
      </div>
    `;
  }

  /**
   * Returns win action area template
   * @returns {string} HTML template string
   */
  getWinActionsTemplate() {
    return `
      <div class="game-over-actions">
        <button id="restart-button" class="game-over-restart-button" type="button">Play Again</button>
        ${this.getBackToMenuButtonTemplate("win-menu-button")}
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
        ${this.getImprintModalTemplate()}
        <img src="img/9_intro_outro_screens/start/startscreen_2.png" alt="Start Screen" class="screen-image startscreen-image">
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
      <button id="impressum" class="icon-button" type="button" aria-expanded="false" aria-controls="imprint-modal">
        <img src="img/button_background_images/imprint.svg" alt="Imprint">
      </button>
    `;
  }

  /**
   * Adds event listeners for game over screen
   */
  addGameOverListeners() {
    this.bindGameOverButtons();
    this.bindGameOverKey();
  }

  /**
   * Binds game over action buttons
   */
  bindGameOverButtons() {
    this.bindButtonClick("game-over-restart-button", () => this.triggerRestart());
    this.bindButtonClick("game-over-menu-button", () => this.triggerBackToMenu());
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
    this.bindButtonClick("restart-button", () => this.triggerRestart());
    this.bindButtonClick("win-menu-button", () => this.triggerBackToMenu());
  }

  /**
   * Adds event listeners for start screen
   */
  addStartScreenListeners() {
    this.bindButtonClick("start-button", () => this.triggerStart());
    this.bindButtonClick("mute", () => this.toggleMute());
    this.bindButtonClick("fullscreen-toggle", () => this.toggleFullscreen());
    this.bindButtonClick("controls", () => this.toggleInfoPanel("controls"));
    this.bindButtonClick("impressum", () => this.openImprintModal());
    this.bindImprintModalListeners();
  }

  /**
   * Binds imprint modal close actions
   */
  bindImprintModalListeners() {
    this.bindButtonClick("imprint-close", () => this.closeImprintModal());
    this.bindButtonClick("imprint-backdrop", () => this.closeImprintModal());
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
   * Toggles the startscreen controls panel
   * @param {"controls"} panelName - Panel to toggle
   */
  toggleInfoPanel(panelName) {
    const controlsInfo = document.getElementById("controls-info");
    if (!controlsInfo || panelName !== "controls") return;
    const isControlsOpen = !controlsInfo.classList.contains("hidden");
    this.setInfoPanelVisibility(!isControlsOpen, false);
  }

  /**
   * Applies startscreen panel visibility and aria states
   * @param {boolean} controlsOpen - Controls info visible state
   * @param {boolean} imprintOpen - Imprint modal visible state
   */
  setInfoPanelVisibility(controlsOpen, imprintOpen) {
    const controlsInfo = document.getElementById("controls-info");
    const imprintModal = document.getElementById("imprint-modal");
    const controlsButton = document.getElementById("controls");
    const imprintButton = document.getElementById("impressum");

    controlsInfo?.classList.toggle("hidden", !controlsOpen);
    imprintModal?.classList.toggle("hidden", !imprintOpen);
    imprintModal?.setAttribute("aria-hidden", `${!imprintOpen}`);
    controlsButton?.setAttribute("aria-expanded", `${controlsOpen}`);
    imprintButton?.setAttribute("aria-expanded", `${imprintOpen}`);
  }

  /**
   * Opens the imprint modal and moves focus to close button
   */
  openImprintModal() {
    this.setInfoPanelVisibility(false, true);
    this.bindImprintEscape();
    document.getElementById("imprint-close")?.focus();
  }

  /**
   * Closes the imprint modal and optionally restores focus
   * @param {boolean} restoreFocus - Restore focus to imprint button
   */
  closeImprintModal(restoreFocus = true) {
    this.setInfoPanelVisibility(false, false);
    this.unbindImprintEscape();
    if (!restoreFocus) return;
    document.getElementById("impressum")?.focus();
  }

  /**
   * Binds escape key while imprint modal is open
   */
  bindImprintEscape() {
    if (this.imprintEscapeHandler) return;
    this.imprintEscapeHandler = (event) => {
      if (event.key !== "Escape") return;
      this.closeImprintModal();
    };
    document.addEventListener("keydown", this.imprintEscapeHandler);
  }

  /**
   * Removes escape key listener for imprint modal
   */
  unbindImprintEscape() {
    if (!this.imprintEscapeHandler) return;
    document.removeEventListener("keydown", this.imprintEscapeHandler);
    this.imprintEscapeHandler = null;
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
   * Triggers return-to-menu event
   */
  triggerBackToMenu() {
    this.hideScreens();
    const menuEvent = new CustomEvent("gameBackToMenu");
    document.dispatchEvent(menuEvent);
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




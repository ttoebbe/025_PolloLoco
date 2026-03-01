/**
 * @typedef {import("./screen-template-factory.class.js").default} ScreenTemplateFactoryType
 * @typedef {import("./screen-ui-controller.class.js").default} ScreenUiControllerType
 */
import ScreenTemplateFactory from "./screen-template-factory.class.js";
import ScreenUiController from "./screen-ui-controller.class.js";

/**
 * Manages game overlay screens.
 */
export default class ScreenManager {
  /**
   * Creates a new ScreenManager instance.
   */
  constructor() {
    /** @type {HTMLElement | null} */
    this.overlayContainer = null;
    /** @type {((event: KeyboardEvent) => void) | null} */
    this.gameOverKeyHandler = null;
    /** @type {ScreenTemplateFactoryType} */
    this.templateFactory = new ScreenTemplateFactory();
    /** @type {ScreenUiControllerType} */
    this.uiController = new ScreenUiController();
    this.createOverlayContainer();
    this.setupAudioListeners();
  }

  /**
   * Creates the overlay container in DOM.
   */
  createOverlayContainer() {
    const existingOverlay = document.getElementById("game-overlay");
    if (existingOverlay) return this.useExistingOverlay(existingOverlay);
    this.createNewOverlay();
  }

  /**
   * Shows the game over screen.
   */
  showGameOver() {
    this.overlayContainer.innerHTML = this.templateFactory.getGameOverTemplate();
    this.overlayContainer.classList.remove("hidden");
    this.addGameOverListeners();
  }

  /**
   * Shows the win screen.
   */
  showWinScreen() {
    this.overlayContainer.innerHTML = this.templateFactory.getWinScreenTemplate();
    this.overlayContainer.classList.remove("hidden");
    this.addWinScreenListeners();
  }

  /**
   * Shows the start screen.
   */
  showStartScreen() {
    this.overlayContainer.innerHTML = this.templateFactory.getStartScreenTemplate();
    this.overlayContainer.classList.remove("hidden");
    this.addStartScreenListeners();
    this.updateMuteIcons(this.getAudioMutedState());
  }

  /**
   * Hides all overlay screens.
   */
  hideScreens() {
    this.removeGameOverListeners();
    this.closeImprintModal(false);
    this.overlayContainer.classList.add("hidden");
    this.overlayContainer.innerHTML = "";
  }

  /**
   * Adds event listeners for game over screen.
   */
  addGameOverListeners() {
    this.bindGameOverButtons();
    this.bindGameOverKey();
  }

  /**
   * Binds game over action buttons.
   */
  bindGameOverButtons() {
    this.bindButtonClick("game-over-restart-button", () => this.triggerRestart());
    this.bindButtonClick("game-over-menu-button", () => this.triggerBackToMenu());
  }

  /**
   * Binds game over keyboard restart.
   */
  bindGameOverKey() {
    this.removeGameOverListeners();
    this.gameOverKeyHandler = () => this.triggerRestart();
    document.addEventListener("keydown", this.gameOverKeyHandler);
  }

  /**
   * Removes game over keyboard restart listener.
   */
  removeGameOverListeners() {
    if (!this.gameOverKeyHandler) return;
    document.removeEventListener("keydown", this.gameOverKeyHandler);
    this.gameOverKeyHandler = null;
  }

  /**
   * Adds event listeners for win screen.
   */
  addWinScreenListeners() {
    this.bindButtonClick("restart-button", () => this.triggerRestart());
    this.bindButtonClick("win-menu-button", () => this.triggerBackToMenu());
  }

  /**
   * Adds event listeners for start screen.
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
   * Binds imprint modal close actions.
   */
  bindImprintModalListeners() {
    this.bindButtonClick("imprint-close", () => this.closeImprintModal());
    this.bindButtonClick("imprint-backdrop", () => this.closeImprintModal());
  }

  /**
   * Binds click listener when button exists.
   * @param {string} buttonId - Target button id.
   * @param {Function} callback - Click callback.
   */
  bindButtonClick(buttonId, callback) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    button.addEventListener("click", callback);
  }

  /**
   * Toggles global mute state.
   */
  toggleMute() {
    this.uiController.toggleMute();
  }

  /**
   * Registers audio mute listeners.
   */
  setupAudioListeners() {
    this.uiController.setupAudioListeners((event) => this.handleAudioMuteChanged(event));
  }

  /**
   * Handles mute change event.
   * @param {CustomEvent} event - Mute change event.
   */
  handleAudioMuteChanged(event) {
    const isMuted = event?.detail?.isMuted ?? this.getAudioMutedState();
    this.updateMuteIcons(isMuted);
  }

  /**
   * Returns global muted state.
   * @returns {boolean} True if muted.
   */
  getAudioMutedState() {
    return this.uiController.getAudioMutedState();
  }

  /**
   * Updates mute icons in UI.
   * @param {boolean} isMuted - Current mute state.
   */
  updateMuteIcons(isMuted) {
    this.uiController.updateMuteIcons(isMuted);
  }

  /**
   * Toggles fullscreen mode for canvas shell.
   */
  toggleFullscreen() {
    this.uiController.toggleFullscreen();
  }

  /**
   * Toggles the startscreen controls panel.
   * @param {"controls"} panelName - Panel to toggle.
   */
  toggleInfoPanel(panelName) {
    this.uiController.toggleInfoPanel(panelName);
  }

  /**
   * Opens the imprint modal and moves focus.
   */
  openImprintModal() {
    this.uiController.openImprintModal(() => this.closeImprintModal());
  }

  /**
   * Closes the imprint modal and optionally restores focus.
   * @param {boolean} restoreFocus - Restore focus to imprint button.
   */
  closeImprintModal(restoreFocus = true) {
    this.uiController.closeImprintModal(restoreFocus);
  }

  /**
   * Triggers game restart event.
   */
  triggerRestart() {
    this.removeGameOverListeners();
    const restartEvent = new CustomEvent("gameRestart");
    document.dispatchEvent(restartEvent);
  }

  /**
   * Triggers return-to-menu event.
   */
  triggerBackToMenu() {
    this.hideScreens();
    const menuEvent = new CustomEvent("gameBackToMenu");
    document.dispatchEvent(menuEvent);
  }

  /**
   * Triggers game start event.
   */
  triggerStart() {
    this.hideScreens();
    const startEvent = new CustomEvent("gameStart");
    document.dispatchEvent(startEvent);
  }

  /**
   * Uses an existing overlay element.
   * @param {HTMLElement} existingOverlay - Existing overlay element.
   */
  useExistingOverlay(existingOverlay) {
    existingOverlay.classList.add("notranslate");
    existingOverlay.setAttribute("translate", "no");
    this.overlayContainer = existingOverlay;
  }

  /**
   * Creates a new overlay element.
   */
  createNewOverlay() {
    this.overlayContainer = document.createElement("div");
    this.overlayContainer.id = "game-overlay";
    this.overlayContainer.className = "game-overlay hidden notranslate";
    this.overlayContainer.setAttribute("translate", "no");
    document.body.appendChild(this.overlayContainer);
  }
}

window.ScreenManager = ScreenManager;

/**
 * Handles screen UI helpers and state.
 */
export default class ScreenUiController {
  /**
   * Creates a new UI controller.
   */
  constructor() {
    this.imprintEscapeHandler = null;
  }

  /**
   * Toggles global mute state.
   */
  toggleMute() {
    if (!window.audioManager) return;
    window.audioManager.toggleMute();
  }

  /**
   * Registers audio mute listeners.
   * @param {Function} onMuteChanged - Mute change callback.
   */
  setupAudioListeners(onMuteChanged) {
    document.addEventListener("audioMuteChanged", onMuteChanged);
  }

  /**
   * Returns global muted state.
   * @returns {boolean} True if muted.
   */
  getAudioMutedState() {
    return window.audioManager ? window.audioManager.isMuted : false;
  }

  /**
   * Updates mute icons in UI.
   * @param {boolean} isMuted - Current mute state.
   */
  updateMuteIcons(isMuted) {
    this.updateStartMuteIcon(isMuted);
    this.updateRuntimeMuteIcon(isMuted);
  }

  /**
   * Updates startscreen mute icon.
   * @param {boolean} isMuted - Current mute state.
   */
  updateStartMuteIcon(isMuted) {
    const muteIcon = document.getElementById("mute-icon");
    if (!muteIcon) return;
    const iconPath = isMuted ? "img/button_background_images/mute.svg" : "img/button_background_images/soundon.svg";
    muteIcon.src = iconPath;
  }

  /**
   * Updates runtime mute icon.
   * @param {boolean} isMuted - Current mute state.
   */
  updateRuntimeMuteIcon(isMuted) {
    const runtimeMuteIcon = document.getElementById("runtime-mute-icon");
    if (!runtimeMuteIcon) return;
    const iconPath = isMuted ? "img/button_background_images/mute.svg" : "img/button_background_images/soundon.svg";
    runtimeMuteIcon.src = iconPath;
  }

  /**
   * Toggles fullscreen mode for canvas shell.
   */
  toggleFullscreen() {
    const canvasShell = document.querySelector(".canvas-shell");
    if (!canvasShell) return;
    if (!document.fullscreenElement) return canvasShell.requestFullscreen?.();
    document.exitFullscreen?.();
  }

  /**
   * Toggles the startscreen controls panel.
   * @param {"controls"} panelName - Panel to toggle.
   */
  toggleInfoPanel(panelName) {
    const controlsInfo = document.getElementById("controls-info");
    if (!controlsInfo || panelName !== "controls") return;
    const isOpen = !controlsInfo.classList.contains("hidden");
    this.setInfoPanelVisibility(!isOpen, false);
  }

  /**
   * Applies startscreen panel visibility and aria states.
   * @param {boolean} controlsOpen - Controls visible state.
   * @param {boolean} imprintOpen - Imprint modal visible state.
   */
  setInfoPanelVisibility(controlsOpen, imprintOpen) {
    this.togglePanel("controls-info", controlsOpen);
    this.togglePanel("imprint-modal", imprintOpen);
    this.setImprintAria(imprintOpen);
    this.setButtonAria("controls", controlsOpen);
    this.setButtonAria("impressum", imprintOpen);
  }

  /**
   * Opens the imprint modal and binds escape key.
   * @param {Function} closeHandler - Close callback.
   */
  openImprintModal(closeHandler) {
    this.setInfoPanelVisibility(false, true);
    this.bindImprintEscape(closeHandler);
    document.getElementById("imprint-close")?.focus();
  }

  /**
   * Closes imprint modal and optionally restores focus.
   * @param {boolean} restoreFocus - Restore focus to imprint button.
   */
  closeImprintModal(restoreFocus = true) {
    this.setInfoPanelVisibility(false, false);
    this.unbindImprintEscape();
    if (!restoreFocus) return;
    document.getElementById("impressum")?.focus();
  }

  /**
   * Binds escape key while imprint modal is open.
   * @param {Function} closeHandler - Close callback.
   */
  bindImprintEscape(closeHandler) {
    if (this.imprintEscapeHandler) return;
    this.imprintEscapeHandler = (event) => {
      if (event.key !== "Escape") return;
      closeHandler();
    };
    document.addEventListener("keydown", this.imprintEscapeHandler);
  }

  /**
   * Removes escape key listener for imprint modal.
   */
  unbindImprintEscape() {
    if (!this.imprintEscapeHandler) return;
    document.removeEventListener("keydown", this.imprintEscapeHandler);
    this.imprintEscapeHandler = null;
  }

  /**
   * Toggles one panel by hidden class.
   * @param {string} panelId - Panel element id.
   * @param {boolean} isOpen - Open state.
   */
  togglePanel(panelId, isOpen) {
    document.getElementById(panelId)?.classList.toggle("hidden", !isOpen);
  }

  /**
   * Sets aria-hidden for imprint modal.
   * @param {boolean} imprintOpen - Open state.
   */
  setImprintAria(imprintOpen) {
    const modal = document.getElementById("imprint-modal");
    if (!modal) return;
    modal.setAttribute("aria-hidden", `${!imprintOpen}`);
  }

  /**
   * Sets aria-expanded on one button.
   * @param {string} buttonId - Target button id.
   * @param {boolean} isExpanded - Expanded state.
   */
  setButtonAria(buttonId, isExpanded) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    button.setAttribute("aria-expanded", `${isExpanded}`);
  }
}

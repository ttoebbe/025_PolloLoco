let canvas;
let world;
let keyboard = new Keyboard();
let screenManager;

/**
 * Initializes the game runtime.
 */
function init() {
  if (!window.audioManager) {
    window.audioManager = new AudioManager();
  }
  canvas = document.getElementById("canvas");
  world = null;
  screenManager = new ScreenManager();
  setGameUiState("start");
  bindMobileControls();
  bindContextMenuBlocker();
  bindRuntimeMuteButton();
  bindRuntimePauseButton();
  screenManager.showStartScreen();
}

/**
 * Starts game.
 */
function startGame() {
  if (!world) {
    world = new World(canvas, keyboard);
    return;
  }
  world.restart();
}

/**
 * Sets game UI State.
 * @param {*} state - Value for state.
 */
function setGameUiState(state) {
  document.body.setAttribute("data-game-state", state);
}

/**
 * Binds mobile Controls.
 */
function bindMobileControls() {
  bindPointerControl("mobile-left", "left");
  bindPointerControl("mobile-right", "right");
  bindPointerControl("mobile-jump", "space");
  bindPointerControl("mobile-throw", "d");
}

/**
 * Binds context Menu Blocker.
 */
function bindContextMenuBlocker() {
  document.addEventListener("contextmenu", handleContextMenuBlock, { capture: true });
}

/**
 * Checks whether context Menu Block Active is true.
 * @returns {boolean} True when the condition is met.
 */
function isContextMenuBlockActive() {
  const gameState = document.body?.getAttribute("data-game-state");
  return gameState === "running" || gameState === "paused";
}

/**
 * Checks whether gameplay Touch Target is true.
 * @param {EventTarget|Element|null} target - Event target element.
 * @returns {boolean} True when the condition is met.
 */
function isGameplayTouchTarget(target) {
  if (!(target instanceof Element)) return false;
  if (target.id === "canvas") return true;
  return target.closest("#mobile-controls button") !== null;
}

/**
 * Handles context Menu Block.
 * @param {Event} event - Event object.
 */
function handleContextMenuBlock(event) {
  if (!isContextMenuBlockActive()) return;
  if (!isGameplayTouchTarget(event.target)) return;
  event.preventDefault();
}

/**
 * Binds pointer Control.
 * @param {string} buttonId - Value for button Id.
 * @param {*} keyName - Value for key Name.
 */
function bindPointerControl(buttonId, keyName) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  button.addEventListener("pointerdown", (event) => setPointerState(event, keyName, true));
  button.addEventListener("pointerup", (event) => setPointerState(event, keyName, false));
  button.addEventListener("pointercancel", (event) => setPointerState(event, keyName, false));
  button.addEventListener("pointerleave", (event) => setPointerState(event, keyName, false));
}

/**
 * Sets pointer State.
 * @param {Event} event - Event object.
 * @param {*} keyName - Value for key Name.
 * @param {boolean} isPressed - Boolean flag for is Pressed.
 */
function setPointerState(event, keyName, isPressed) {
  event.preventDefault();
  if (isPressed) markAudioActivity();
  keyboard[keyName] = isPressed;
}

/**
 * Sets arrow Key State.
 * @param {Event} eventKey - Event object.
 * @param {boolean} isPressed - Boolean flag for is Pressed.
 */
function setArrowKeyState(eventKey, isPressed) {
  if (isPressed) markAudioActivity();
  if (eventKey === "ArrowRight") keyboard.right = isPressed;
  if (eventKey === "ArrowLeft") keyboard.left = isPressed;
  if (eventKey === "ArrowUp") keyboard.up = isPressed;
  if (eventKey === "ArrowDown") keyboard.down = isPressed;
}

/**
 * Checks whether repeated Action Key is true.
 * @param {Event} event - Event object.
 * @returns {boolean} True when the condition is met.
 */
function isRepeatedActionKey(event) {
  if (!event.repeat) return false;
  if (event.key === " ") return true;
  return event.key.toLowerCase() === "d";
}

/**
 * Handles key Down.
 * @param {Event} event - Event object.
 */
function handleKeyDown(event) {
  if (isRepeatedActionKey(event)) return;
  markAudioActivity();
  setArrowKeyState(event.key, true);
  if (event.key === " ") {
    event.preventDefault();
    keyboard.space = true;
  }
  if (event.key.toLowerCase() === "d") keyboard.d = true;
}

/**
 * Handles key Up.
 * @param {Event} event - Event object.
 */
function handleKeyUp(event) {
  setArrowKeyState(event.key, false);
  if (event.key === " ") keyboard.space = false;
  if (event.key.toLowerCase() === "d") keyboard.d = false;
}

/**
 * Binds runtime Mute Button.
 */
function bindRuntimeMuteButton() {
  const button = document.getElementById("runtime-mute");
  if (!button) return;
  button.addEventListener("click", () => toggleAudioMute());
  document.addEventListener("audioMuteChanged", (event) => syncRuntimeMuteIcon(event));
  syncRuntimeMuteIcon();
}

/**
 * Binds runtime Pause Button.
 */
function bindRuntimePauseButton() {
  const button = document.getElementById("runtime-pause");
  if (!button) return;
  button.addEventListener("click", () => togglePause());
  button.textContent = "Pause";
  button.setAttribute("aria-pressed", "false");
}

/**
 * Toggles audio Mute.
 */
function toggleAudioMute() {
  if (!window.audioManager) return;
  window.audioManager.toggleMute();
}

/**
 * Synchronizes runtime Mute Icon.
 * @param {Event} event - Event object.
 */
function syncRuntimeMuteIcon(event) {
  const fallbackState = window.audioManager ? window.audioManager.isMuted : false;
  const isMuted = event?.detail?.isMuted ?? fallbackState;
  const icon = document.getElementById("runtime-mute-icon");
  if (!icon) return;
  icon.src = isMuted ? "img/button_background_images/mute.svg" : "img/button_background_images/soundon.svg";
}

/**
 * Marks audio Activity.
 */
function markAudioActivity() {
  if (!window.audioManager) return;
  window.audioManager.markActivity();
}

/**
 * Toggles pause.
 */
function togglePause() {
  if (!world?.gameStateManager) return;
  const gameState = world.gameStateManager;
  if (gameState.isRunning()) {
    pauseGame(gameState);
    return;
  }
  if (!gameState.isPaused()) return;
  resumeGame(gameState);
}

/**
 * Pause Game.
 * @param {GameStateManager} gameState - Value for game State.
 */
function pauseGame(gameState) {
  gameState.setState(GameStateManager.STATES.PAUSED);
  setPauseUi(true);
  resetKeyboardState();
  window.audioManager?.hardStopAll();
}

/**
 * Resume Game.
 * @param {GameStateManager} gameState - Value for game State.
 */
function resumeGame(gameState) {
  gameState.setState(GameStateManager.STATES.RUNNING);
  setPauseUi(false);
  window.audioManager?.startBackgroundMusic();
}

/**
 * Sets pause UI.
 * @param {boolean} isPaused - Boolean flag for is Paused.
 */
function setPauseUi(isPaused) {
  const pauseButton = document.getElementById("runtime-pause");
  if (!pauseButton) return;
  pauseButton.textContent = isPaused ? "Resume" : "Pause";
  pauseButton.setAttribute("aria-pressed", `${isPaused}`);
  setGameUiState(isPaused ? "paused" : "running");
}

/**
 * Resets keyboard State.
 */
function resetKeyboardState() {
  keyboard.left = false;
  keyboard.right = false;
  keyboard.up = false;
  keyboard.down = false;
  keyboard.space = false;
  keyboard.d = false;
}

document.addEventListener("gameStart", () => {
  startGame();
  setPauseUi(false);
  window.audioManager?.startBackgroundMusic();
});

document.addEventListener("gameRestart", () => {
  window.audioManager?.hardStopAll();
  setPauseUi(false);
  window.audioManager?.startBackgroundMusic();
});

document.addEventListener("gameEnded", () => {
  setGameUiState("ended");
  window.audioManager?.hardStopAll();
});

document.addEventListener("gameBackToMenu", () => {
  setGameUiState("start");
  resetKeyboardState();
  window.audioManager?.hardStopAll();
  screenManager.showStartScreen();
});

window.addEventListener("keydown", handleKeyDown);

window.addEventListener("keyup", handleKeyUp);

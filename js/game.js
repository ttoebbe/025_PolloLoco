let canvas;
let world;
let keyboard = new Keyboard();
let screenManager;

function init() {
  if (!window.audioManager) {
    window.audioManager = new AudioManager();
  }
  canvas = document.getElementById("canvas");
  world = null;
  screenManager = new ScreenManager();
  setGameUiState("start");
  bindMobileControls();
  bindRuntimeMuteButton();
  bindRuntimePauseButton();
  screenManager.showStartScreen();
}

function startGame() {
  if (world) return;
  world = new World(canvas, keyboard);
}

function setGameUiState(state) {
  document.body.setAttribute("data-game-state", state);
}

function bindMobileControls() {
  bindPointerControl("mobile-left", "left");
  bindPointerControl("mobile-right", "right");
  bindPointerControl("mobile-jump", "space");
  bindPointerControl("mobile-throw", "d");
}

function bindPointerControl(buttonId, keyName) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  button.addEventListener("pointerdown", (event) => setPointerState(event, keyName, true));
  button.addEventListener("pointerup", (event) => setPointerState(event, keyName, false));
  button.addEventListener("pointercancel", (event) => setPointerState(event, keyName, false));
  button.addEventListener("pointerleave", (event) => setPointerState(event, keyName, false));
}

function setPointerState(event, keyName, isPressed) {
  event.preventDefault();
  if (isPressed) markAudioActivity();
  keyboard[keyName] = isPressed;
}

function setArrowKeyState(eventKey, isPressed) {
  if (isPressed) markAudioActivity();
  if (eventKey === "ArrowRight") keyboard.right = isPressed;
  if (eventKey === "ArrowLeft") keyboard.left = isPressed;
  if (eventKey === "ArrowUp") keyboard.up = isPressed;
  if (eventKey === "ArrowDown") keyboard.down = isPressed;
}

function handleKeyDown(event) {
  markAudioActivity();
  setArrowKeyState(event.key, true);
  if (event.key === " ") {
    event.preventDefault();
    keyboard.space = true;
  }
  if (event.key.toLowerCase() === "d") keyboard.d = true;
}

function handleKeyUp(event) {
  setArrowKeyState(event.key, false);
  if (event.key === " ") keyboard.space = false;
  if (event.key.toLowerCase() === "d") keyboard.d = false;
}

function bindRuntimeMuteButton() {
  const button = document.getElementById("runtime-mute");
  if (!button) return;
  button.addEventListener("click", () => toggleAudioMute());
  document.addEventListener("audioMuteChanged", (event) => syncRuntimeMuteIcon(event));
  syncRuntimeMuteIcon();
}

function bindRuntimePauseButton() {
  const button = document.getElementById("runtime-pause");
  if (!button) return;
  button.addEventListener("click", () => togglePause());
  button.textContent = "Pause";
  button.setAttribute("aria-pressed", "false");
}

function toggleAudioMute() {
  if (!window.audioManager) return;
  window.audioManager.toggleMute();
}

function syncRuntimeMuteIcon(event) {
  const fallbackState = window.audioManager ? window.audioManager.isMuted : false;
  const isMuted = event?.detail?.isMuted ?? fallbackState;
  const icon = document.getElementById("runtime-mute-icon");
  if (!icon) return;
  icon.src = isMuted ? "img/button_background_images/mute.svg" : "img/button_background_images/soundon.svg";
}

function markAudioActivity() {
  if (!window.audioManager) return;
  window.audioManager.markActivity();
}

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

function pauseGame(gameState) {
  gameState.setState(GameStateManager.STATES.PAUSED);
  setPauseUi(true);
  resetKeyboardState();
  window.audioManager?.hardStopAll();
}

function resumeGame(gameState) {
  gameState.setState(GameStateManager.STATES.RUNNING);
  setPauseUi(false);
  window.audioManager?.startBackgroundMusic();
}

function setPauseUi(isPaused) {
  const pauseButton = document.getElementById("runtime-pause");
  if (!pauseButton) return;
  pauseButton.textContent = isPaused ? "Resume" : "Pause";
  pauseButton.setAttribute("aria-pressed", `${isPaused}`);
  setGameUiState(isPaused ? "paused" : "running");
}

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

window.addEventListener("keydown", handleKeyDown);

window.addEventListener("keyup", handleKeyUp);

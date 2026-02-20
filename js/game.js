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
  bindPointerControl("mobile-left", "LEFT");
  bindPointerControl("mobile-right", "RIGHT");
  bindPointerControl("mobile-jump", "SPACE");
  bindPointerControl("mobile-throw", "D");
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
  if (eventKey === "ArrowRight") keyboard.RIGHT = isPressed;
  if (eventKey === "ArrowLeft") keyboard.LEFT = isPressed;
  if (eventKey === "ArrowUp") keyboard.UP = isPressed;
  if (eventKey === "ArrowDown") keyboard.DOWN = isPressed;
}

function handleKeyDown(event) {
  markAudioActivity();
  setArrowKeyState(event.key, true);
  if (event.key === " ") {
    event.preventDefault();
    keyboard.SPACE = true;
  }
  if (event.key.toLowerCase() === "d") keyboard.D = true;
}

function handleKeyUp(event) {
  setArrowKeyState(event.key, false);
  if (event.key === " ") keyboard.SPACE = false;
  if (event.key.toLowerCase() === "d") keyboard.D = false;
}

function bindRuntimeMuteButton() {
  const button = document.getElementById("runtime-mute");
  if (!button) return;
  button.addEventListener("click", () => toggleAudioMute());
  document.addEventListener("audioMuteChanged", (event) => syncRuntimeMuteIcon(event));
  syncRuntimeMuteIcon();
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

document.addEventListener("gameStart", () => {
  startGame();
  setGameUiState("running");
  window.audioManager?.startBackgroundMusic();
});

document.addEventListener("gameRestart", () => {
  window.audioManager?.hardStopAll();
  setGameUiState("running");
  window.audioManager?.startBackgroundMusic();
});

document.addEventListener("gameEnded", () => {
  setGameUiState("ended");
  window.audioManager?.hardStopAll();
});

window.addEventListener("keydown", handleKeyDown);

window.addEventListener("keyup", handleKeyUp);

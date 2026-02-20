let canvas;
let world;
let keyboard = new Keyboard();
let screenManager;

function init() {
  canvas = document.getElementById("canvas");
  world = null;
  screenManager = new ScreenManager();
  setGameUiState("start");
  bindMobileControls();
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
  keyboard[keyName] = isPressed;
}

function setArrowKeyState(eventKey, isPressed) {
  if (eventKey === "ArrowRight") keyboard.RIGHT = isPressed;
  if (eventKey === "ArrowLeft") keyboard.LEFT = isPressed;
  if (eventKey === "ArrowUp") keyboard.UP = isPressed;
  if (eventKey === "ArrowDown") keyboard.DOWN = isPressed;
}

function handleKeyDown(event) {
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

document.addEventListener("gameStart", () => {
  startGame();
  setGameUiState("running");
});

document.addEventListener("gameRestart", () => {
  setGameUiState("running");
});

document.addEventListener("gameEnded", () => {
  setGameUiState("ended");
});

window.addEventListener("keydown", handleKeyDown);

window.addEventListener("keyup", handleKeyUp);

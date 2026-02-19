let canvas;
let world;
let keyboard = new Keyboard();
let screenManager;

function init() {
  canvas = document.getElementById("canvas");
  world = null;
  screenManager = new ScreenManager();
  screenManager.showStartScreen();
}

function startGame() {
  if (world) return;
  world = new World(canvas, keyboard);
}

document.addEventListener("gameStart", () => {
  startGame();
});

window.addEventListener("keydown", (e) => {

  if (e.key === "ArrowRight") {
    keyboard.RIGHT = true;
  }
  if (e.key === "ArrowLeft") {
    keyboard.LEFT = true;
  }
  if (e.key === "ArrowUp") {
    keyboard.UP = true;
  }
  if (e.key === "ArrowDown") {
    keyboard.DOWN = true;
  }
  if (e.key === " ") {
    e.preventDefault();
    keyboard.SPACE = true;
  }
  if (e.keyCode == 68) {
    keyboard.D = true;

  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") {
    keyboard.RIGHT = false;
  }
  if (e.key === "ArrowLeft") {
    keyboard.LEFT = false;
  }
  if (e.key === "ArrowUp") {
    keyboard.UP = false;
  }
  if (e.key === "ArrowDown") {
    keyboard.DOWN = false;
  }
});

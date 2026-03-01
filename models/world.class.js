/**
 * Represents the world.
 */
class World {
  character = new Character();
  level = createLevel1();
  canvas;
  ctx;
  keyboard;
  cameraX = 0;
  renderer;
  statusBar = new StatusBar();
  coinBar = new CoinStatusBar();
  bottleBar = new BottleStatusBar();
  endbossBar = new EndbossStatusBar();
  throwableObjects = [];
  collectedCoins = 0;
  collectedBottles = 0;
  totalCoins = 0;
  maxBottles = 0;
  endbossNearby = false;
  gameStateManager = new GameStateManager();
  screenManager = new ScreenManager();
  endbossDefeatedTime = 0;
  throwCooldownMs = 500;
  lastThrowTime = 0;
  activeEnemyContacts = new Set();
  contactDamageIntervalMs = 500;
  enemyContactDamageTimes = new Map();
  statusController;
  collisionController;

  /**
   * Creates a new World instance.
   * @param {HTMLCanvasElement} canvas - Canvas element.
   * @param {Keyboard} keyboard - Keyboard instance.
   */
  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.initializeControllers();
    this.initializeCollectibleTotals();
    this.updateCoinBar();
    this.updateBottleBar();
    this.setupGameStateManager();
    this.renderer = new WorldRenderer(this);
    this.draw();
    this.setWorld();
    this.run();
  }

  /**
   * Creates world helper controllers.
   */
  initializeControllers() {
    this.statusController = new WorldStatusController(this);
    this.collisionController = new WorldCollisionController(this);
  }

  /**
   * Initializes total collectible counts.
   */
  initializeCollectibleTotals() {
    this.totalCoins = this.level.coins.length;
    this.maxBottles = this.level.bottles.length;
  }

  /**
   * Sets world.
   */
  setWorld() {
    this.character.world = this;
    this.character.startAnimations(this.gameStateManager);
    this.startEnemyAnimations();
    this.startCloudAnimations();
  }

  /**
   * Starts enemy animations.
   */
  startEnemyAnimations() {
    this.level.enemies.forEach((enemy) => {
      if (typeof enemy.startAnimations !== "function") return;
      enemy.startAnimations(this.gameStateManager, this.character);
    });
  }

  /**
   * Starts cloud animations.
   */
  startCloudAnimations() {
    this.level.clouds.forEach((cloud) => {
      if (typeof cloud.startAnimations !== "function") return;
      cloud.startAnimations(this.gameStateManager);
    });
  }

  /**
   * Runs the update loop.
   */
  run() {
    this.gameStateManager.registerInterval(() => {
      this.checkCollisions();
      this.checkThrowableObject();
      this.checkEndbossProximity();
      this.checkGameOver();
      this.checkWinCondition();
      this.cleanupDeadEnemies();
    }, 1000 / 60);
  }

  /**
   * Checks if player wants to throw a bottle.
   */
  checkThrowableObject() {
    this.collisionController.checkThrowableObject();
  }

  /**
   * Checks collisions.
   */
  checkCollisions() {
    this.collisionController.checkCollisions();
  }

  /**
   * Checks if endboss is nearby.
   */
  checkEndbossProximity() {
    this.statusController.checkEndbossProximity();
  }

  /**
   * Updates endboss status bar percentage.
   */
  updateEndbossBar() {
    this.statusController.updateEndbossBar();
  }

  /**
   * Updates character health status bar.
   */
  updateHealthBar() {
    this.statusController.updateHealthBar();
  }

  /**
   * Updates coin bar.
   */
  updateCoinBar() {
    this.statusController.updateCoinBar();
  }

  /**
   * Updates bottle bar.
   */
  updateBottleBar() {
    this.statusController.updateBottleBar();
  }

  /**
   * Removes dead enemies after delay.
   */
  cleanupDeadEnemies() {
    this.collisionController.cleanupDeadEnemies();
  }

  /**
   * Draws the current frame.
   */
  draw() {
    this.renderer.drawFrame();
    requestAnimationFrame(() => this.draw());
  }

  /**
   * Sets up game state manager and screen event listeners.
   */
  setupGameStateManager() {
    MovableObject.setGameStateManager(this.gameStateManager);
    document.addEventListener("gameRestart", () => {
      this.restart();
    });
  }

  /**
   * Checks if game over condition is met.
   */
  checkGameOver() {
    if (!this.character.isDead() || !this.gameStateManager.isRunning()) return;
    window.audioManager?.playCharacterDead();
    this.gameStateManager.setState(GameStateManager.STATES.GAME_OVER);
    this.screenManager.showGameOver();
    document.dispatchEvent(new CustomEvent("gameEnded", { detail: { result: "lose" } }));
  }

  /**
   * Checks if win condition is met.
   */
  checkWinCondition() {
    const endboss = this.level.enemies.find((enemy) => enemy instanceof Endboss);
    if (!endboss || !endboss.isDead()) return;
    if (this.endbossDefeatedTime === 0) this.endbossDefeatedTime = Date.now();
    const timeSinceDefeat = (Date.now() - this.endbossDefeatedTime) / 1000;
    if (timeSinceDefeat < 3 || !this.gameStateManager.isRunning()) return;
    this.gameStateManager.setState(GameStateManager.STATES.WON);
    this.screenManager.showWinScreen();
    document.dispatchEvent(new CustomEvent("gameEnded", { detail: { result: "win" } }));
  }

  /**
   * Restarts the game to initial state.
   */
  restart() {
    this.clearGameState();
    this.resetGameObjects();
    this.resetUIBars();
    this.reinitializeGame();
  }

  /**
   * Clears current game state and screens.
   */
  clearGameState() {
    this.gameStateManager.clearAll();
    this.screenManager.hideScreens();
    this.gameStateManager.setState(GameStateManager.STATES.RUNNING);
  }

  /**
   * Resets all game objects to initial state.
   */
  resetGameObjects() {
    this.character = new Character();
    this.level = createLevel1();
    this.cameraX = 0;
    this.throwableObjects = [];
    this.activeEnemyContacts = new Set();
    this.enemyContactDamageTimes = new Map();
    this.lastThrowTime = 0;
    this.endbossNearby = false;
    this.endbossDefeatedTime = 0;
    this.resetCollectibleState();
  }

  /**
   * Resets collectible counters and totals.
   */
  resetCollectibleState() {
    this.collectedCoins = 0;
    this.collectedBottles = 0;
    this.initializeCollectibleTotals();
  }

  /**
   * Resets all UI status bars.
   */
  resetUIBars() {
    this.updateHealthBar();
    this.updateCoinBar();
    this.updateBottleBar();
    this.endbossBar.setPercentage(100);
    this.endbossBar.setStock(100, 100);
  }

  /**
   * Reinitializes game systems and starts new game.
   */
  reinitializeGame() {
    MovableObject.setGameStateManager(this.gameStateManager);
    this.setWorld();
    this.run();
  }
}

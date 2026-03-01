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

  /**
   * Creates a new World instance.
   * @param {HTMLCanvasElement} canvas - Canvas element.
   * @param {Keyboard} keyboard - Value for keyboard.
   */
  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.totalCoins = this.level.coins.length;
    this.maxBottles = this.level.bottles.length;
    this.updateCoinBar();
    this.updateBottleBar();
    this.setupGameStateManager();
    this.renderer = new WorldRenderer(this);
    this.draw();
    this.setWorld();
    this.run();
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
   * Starts enemy Animations.
   */
  startEnemyAnimations() {
    this.level.enemies.forEach((enemy) => {
      if (typeof enemy.startAnimations !== "function") return;
      enemy.startAnimations(this.gameStateManager, this.character);
    });
  }

  /**
   * Starts cloud Animations.
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
   * Checks if player wants to throw a bottle
   */
  checkThrowableObject() {
    if (!this.keyboard.d) return;
    window.audioManager?.markActivity();
    if (!this.canThrowBottle()) {
      this.keyboard.d = false;
      return;
    }
    this.throwBottle();
    this.keyboard.d = false;
  }

  /**
   * Checks if a bottle throw is currently allowed
   * @returns {boolean} True when throw is allowed
   */
  canThrowBottle() {
    if (this.collectedBottles <= 0) return false;
    return !this.isThrowCooldownActive();
  }

  /**
   * Checks if throw cooldown is still active
   * @returns {boolean} True while throw is blocked
   */
  isThrowCooldownActive() {
    return Date.now() - this.lastThrowTime < this.throwCooldownMs;
  }

  /**
   * Creates and throws a bottle in character direction
   */
  throwBottle() {
    const isThrownLeft = this.character.otherDirection;
    const offsetX = isThrownLeft ? -20 : 100;
    const bottle = new ThrowableObject(
      this.character.x + offsetX,
      this.character.y + 100,
      isThrownLeft,
    );
    this.throwableObjects.push(bottle);
    this.lastThrowTime = Date.now();
    this.collectedBottles = Math.max(0, this.collectedBottles - 1);
    this.updateBottleBar();
    window.audioManager?.playThrow();
  }

  /**
   * Checks collisions.
   */
  checkCollisions() {
    this.checkEnemyCollisions();
    this.checkCoinCollisions();
    this.checkBottleCollisions();
    this.checkThrowableCollisions();
  }

  /**
   * Checks enemy Collisions.
   */
  checkEnemyCollisions() {
    const collidingNow = this.getCollidingEnemies();
    this.handleNewEnemyContacts(collidingNow);
    this.handleActiveEnemyContacts(collidingNow);
    this.releaseInactiveEnemyContacts(collidingNow);
  }

  /**
   * Returns colliding Enemies.
   * @returns {*} Computed result value.
   */
  getCollidingEnemies() {
    const collidingNow = new Set();
    this.level.enemies.forEach((enemy) => {
      if (!this.character.isColliding(enemy)) return;
      if (enemy.isDead()) return;
      collidingNow.add(enemy);
    });
    return collidingNow;
  }

  /**
   * Handles new Enemy Contacts.
   * @param {*} collidingNow - Value for colliding Now.
   */
  handleNewEnemyContacts(collidingNow) {
    collidingNow.forEach((enemy) => {
      if (this.activeEnemyContacts.has(enemy)) return;
      this.resolveEnemyContact(enemy);
    });
  }

  /**
   * Handles active Enemy Contacts.
   * @param {*} collidingNow - Value for colliding Now.
   */
  handleActiveEnemyContacts(collidingNow) {
    collidingNow.forEach((enemy) => {
      if (!this.activeEnemyContacts.has(enemy)) return;
      if (enemy.isDead()) return;
      if (!this.character.isCollidingFromSide(enemy)) return;
      this.handleSideCollisionWithEnemy(enemy);
    });
  }

  /**
   * Resolve Enemy Contact.
   * @param {*} enemy - Value for enemy.
   */
  resolveEnemyContact(enemy) {
    if (this.character.isCollidingFromAbove(enemy)) {
      this.handleJumpOnEnemy(enemy);
      this.activeEnemyContacts.add(enemy);
      return;
    }
    if (!this.character.isCollidingFromSide(enemy)) return;
    this.handleSideCollisionWithEnemy(enemy);
    this.activeEnemyContacts.add(enemy);
  }

  /**
   * Release Inactive Enemy Contacts.
   * @param {*} collidingNow - Value for colliding Now.
   */
  releaseInactiveEnemyContacts(collidingNow) {
    this.activeEnemyContacts.forEach((enemy) => {
      const enemyExists = this.level.enemies.includes(enemy);
      if (enemyExists && collidingNow.has(enemy)) return;
      this.activeEnemyContacts.delete(enemy);
      this.enemyContactDamageTimes.delete(enemy);
    });
  }

  /**
   * Checks coin Collisions.
   */
  checkCoinCollisions() {
    for (let i = this.level.coins.length - 1; i >= 0; i--) {
      if (!this.character.isColliding(this.level.coins[i])) continue;
      this.level.coins.splice(i, 1);
      this.collectedCoins++;
      this.updateCoinBar();
      window.audioManager?.playCoinCollect();
    }
  }

  /**
   * Checks bottle Collisions.
   */
  checkBottleCollisions() {
    for (let i = this.level.bottles.length - 1; i >= 0; i--) {
      if (!this.character.isColliding(this.level.bottles[i])) continue;
      this.level.bottles.splice(i, 1);
      this.collectedBottles++;
      this.updateBottleBar();
      window.audioManager?.playBottleCollect();
    }
  }

  /**
   * Handles character jumping on enemy
   * @param {MovableObject} enemy - The enemy being jumped on
   */
  handleJumpOnEnemy(enemy) {
    if (enemy instanceof Endboss) return;
    enemy.hit();
    this.character.triggerStompRebound();
  }

  /**
   * Handles side collision with enemy
   * @param {MovableObject} enemy - The enemy colliding with
   */
  handleSideCollisionWithEnemy(enemy) {
    const now = Date.now();
    if (!this.shouldApplySideContactDamage(enemy, now)) return;
    this.applyEnemyContactDamage(enemy);
    this.setSideContactDamageTime(enemy, now);
    this.updateHealthBar();
    window.audioManager?.playCharacterHurt();
  }

  /**
   * Checks whether apply Side Contact Damage applies.
   * @param {*} enemy - Value for enemy.
   * @param {*} now - Value for now.
   * @returns {boolean} True when the condition is met.
   */
  shouldApplySideContactDamage(enemy, now) {
    const lastDamageTime = this.enemyContactDamageTimes.get(enemy);
    if (lastDamageTime === undefined) return true;
    return now - lastDamageTime >= this.contactDamageIntervalMs;
  }

  /**
   * Sets side Contact Damage Time.
   * @param {*} enemy - Value for enemy.
   * @param {*} now - Value for now.
   */
  setSideContactDamageTime(enemy, now) {
    this.enemyContactDamageTimes.set(enemy, now);
  }

  /**
   * Apply Enemy Contact Damage.
   * @param {*} enemy - Value for enemy.
   */
  applyEnemyContactDamage(enemy) {
    if (!(enemy instanceof Endboss)) {
      this.character.hit();
      return;
    }
    this.character.hit();
    this.character.hit();
  }

  /**
   * Checks collisions between throwable objects and enemies
   */
  checkThrowableCollisions() {
    for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
      const bottle = this.throwableObjects[i];
      if (bottle.shouldRemove()) {
        this.throwableObjects.splice(i, 1);
        continue;
      }
      if (this.checkBottleHitEnemies(bottle)) continue;
      this.checkBottleGroundImpact(bottle);
    }
  }

  /**
   * Checks if bottle hits any enemy
   * @param {ThrowableObject} bottle - The bottle to check
   * @returns {boolean} True if bottle hit an enemy
   */
  checkBottleHitEnemies(bottle) {
    if (bottle.isSplashing) return false;
    let bottleHit = false;
    this.level.enemies.forEach((enemy) => {
      if (bottleHit) return;
      if (!bottle.isColliding(enemy) || enemy.isDead()) return;
      this.handleBottleEnemyHit(enemy, bottle);
      bottleHit = true;
    });
    return bottleHit;
  }

  /**
   * Handles bottle hitting an enemy
   * @param {MovableObject} enemy - The enemy that was hit
   * @param {ThrowableObject} bottle - The bottle that caused the hit
   */
  handleBottleEnemyHit(enemy, bottle) {
    bottle.startSplash();
    window.audioManager?.playBottleBreak();
    if (!(enemy instanceof Endboss)) return enemy.hit();
    const didDamage = enemy.tryTakeBottleHit();
    if (didDamage) this.updateEndbossBar();
  }

  /**
   * Triggers splash when bottle impacts the ground.
   * @param {ThrowableObject} bottle - The bottle to inspect
   */
  checkBottleGroundImpact(bottle) {
    if (bottle.isSplashing || !bottle.hasGroundImpact()) return;
    bottle.startSplash();
    window.audioManager?.playBottleBreak();
  }

  /**
   * Checks if endboss is nearby and updates proximity flag
   */
  checkEndbossProximity() {
    let previousState = this.endbossNearby;
    let endboss = this.level.enemies.find((enemy) => enemy instanceof Endboss);
    this.endbossNearby = !!(endboss && endboss.chaseActivated);

    if (this.endbossNearby && !previousState) {
      this.updateEndbossBar();
    }
  }

  /**
   * Updates endboss status bar percentage
   */
  updateEndbossBar() {
    let endboss = this.level.enemies.find(enemy => enemy instanceof Endboss);
    if (endboss) {
      let percentage = (endboss.energy / endboss.maxEnergy) * 100;
      this.endbossBar.setPercentage(percentage);
      this.endbossBar.setStock(endboss.energy, endboss.maxEnergy);
    }
  }

  /**
   * Updates character health status bar
   */
  updateHealthBar() {
    this.statusBar.setPercentage(this.character.energy);
    this.statusBar.setStock(this.character.energy, 100);
  }

  /**
   * Removes dead enemies after 3 seconds (except Endboss)
   */
  cleanupDeadEnemies() {
    let currentTime = Date.now();
    for (let i = this.level.enemies.length - 1; i >= 0; i--) {
      let enemy = this.level.enemies[i];
      if (!this.shouldRemoveEnemy(enemy, currentTime)) continue;
      this.level.enemies.splice(i, 1);
    }
  }

  /**
   * Checks whether remove Enemy applies.
   * @param {*} enemy - Value for enemy.
   * @param {number} currentTime - Value for current Time.
   * @returns {boolean} True when the condition is met.
   */
  shouldRemoveEnemy(enemy, currentTime) {
    if (enemy instanceof Endboss) return false;
    if (!enemy.isDead() || enemy.deathTime <= 0) return false;
    return (currentTime - enemy.deathTime) / 1000 >= 3;
  }

  /**
   * Updates coin Bar.
   */
  updateCoinBar() {
    if (this.totalCoins === 0) {
      this.coinBar.setPercentage(0);
      this.coinBar.setStock(0, 0);
      return;
    }
    const percentage = (this.collectedCoins / this.totalCoins) * 100;
    this.coinBar.setPercentage(percentage);
    this.coinBar.setStock(this.collectedCoins, this.totalCoins);
  }

  /**
   * Updates bottle Bar.
   */
  updateBottleBar() {
    if (this.maxBottles === 0) {
      this.bottleBar.setPercentage(0);
      this.bottleBar.setStock(0, 0);
      return;
    }
    const percentage = (this.collectedBottles / this.maxBottles) * 100;
    this.bottleBar.setPercentage(percentage);
    this.bottleBar.setStock(this.collectedBottles, this.maxBottles);
  }

  /**
   * Draws the current frame.
   */
  draw() {
    this.renderer.drawFrame();
    requestAnimationFrame(() => this.draw());
  }

  /**
   * Sets up game state manager and screen event listeners
   */
  setupGameStateManager() {
    MovableObject.setGameStateManager(this.gameStateManager);
    document.addEventListener('gameRestart', () => {
      this.restart();
    });
  }

  /**
   * Checks if game over condition is met
   */
  checkGameOver() {
    if (this.character.isDead() && this.gameStateManager.isRunning()) {
      window.audioManager?.playCharacterDead();
      this.gameStateManager.setState(GameStateManager.STATES.GAME_OVER);
      this.screenManager.showGameOver();
      document.dispatchEvent(new CustomEvent("gameEnded", { detail: { result: "lose" } }));
    }
  }

  /**
   * Checks if win condition is met (endboss defeated)
   */
  checkWinCondition() {
    let endboss = this.level.enemies.find((enemy) => enemy instanceof Endboss);
    if (!endboss || !endboss.isDead()) return;
    if (this.endbossDefeatedTime === 0) this.endbossDefeatedTime = Date.now();
    let timeSinceDefeat = (Date.now() - this.endbossDefeatedTime) / 1000;
    if (timeSinceDefeat < 3 || !this.gameStateManager.isRunning()) return;
    this.gameStateManager.setState(GameStateManager.STATES.WON);
    this.screenManager.showWinScreen();
    document.dispatchEvent(new CustomEvent("gameEnded", { detail: { result: "win" } }));
  }

  /**
   * Restarts the game to initial state
   */
  restart() {
    this.clearGameState();
    this.resetGameObjects();
    this.resetUIBars();
    this.reinitializeGame();
  }

  /**
   * Clears current game state and screens
   */
  clearGameState() {
    this.gameStateManager.clearAll();
    this.screenManager.hideScreens();
    this.gameStateManager.setState(GameStateManager.STATES.RUNNING);
  }

  /**
   * Resets all game objects to initial state
   */
  resetGameObjects() {
    this.character = new Character();
    this.level = createLevel1();
    this.cameraX = 0;
    this.throwableObjects = [];
    this.activeEnemyContacts = new Set();
    this.enemyContactDamageTimes = new Map();
    this.lastThrowTime = 0;
    this.collectedCoins = 0;
    this.collectedBottles = 0;
    this.totalCoins = this.level.coins.length;
    this.maxBottles = this.level.bottles.length;
    this.endbossNearby = false;
    this.endbossDefeatedTime = 0;
  }

  /**
   * Resets all UI status bars
   */
  resetUIBars() {
    this.updateHealthBar();
    this.updateCoinBar();
    this.updateBottleBar();
    this.endbossBar.setPercentage(100);
    this.endbossBar.setStock(100, 100);
  }

  /**
   * Reinitializes game systems and starts new game
   */
  reinitializeGame() {
    MovableObject.setGameStateManager(this.gameStateManager);
    this.setWorld();
    this.run();
  }
}

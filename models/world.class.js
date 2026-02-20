class World {
  character = new Character();
  level = createLevel1();
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
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

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.totalCoins = this.level.coins.length;
    this.maxBottles = this.level.bottles.length;
    this.updateCoinBar();
    this.updateBottleBar();
    this.setupGameStateManager();
    this.draw();
    this.setWorld();
    this.run();
  }

  setWorld() {
    this.character.world = this;
    this.character.startAnimations(this.gameStateManager);
    
    // Start animations for all enemies that support it
    this.level.enemies.forEach(enemy => {
      if (typeof enemy.startAnimations === 'function') {
        enemy.startAnimations(this.gameStateManager, this.character);
      }
    });
    
    // Start animations for clouds
    this.level.clouds.forEach(cloud => {
      if (typeof cloud.startAnimations === 'function') {
        cloud.startAnimations(this.gameStateManager);
      }
    });
  }

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
    if (!this.keyboard.D) return;
    if (this.collectedBottles <= 0) {
      this.keyboard.D = false;
      return;
    }
    this.throwBottle();
    this.keyboard.D = false;
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
    this.collectedBottles = Math.max(0, this.collectedBottles - 1);
    this.updateBottleBar();
  }

  checkCollisions() {
    this.checkEnemyCollisions();
    this.checkCoinCollisions();
    this.checkBottleCollisions();
    this.checkThrowableCollisions();
  }

  checkEnemyCollisions() {
    this.level.enemies.forEach((enemy) => {
      if (!this.character.isColliding(enemy)) return;
      if (enemy.isDead()) return;
      
      if (this.character.isCollidingFromAbove(enemy)) {
        this.handleJumpOnEnemy(enemy);
      } else if (this.character.isCollidingFromSide(enemy)) {
        this.handleSideCollisionWithEnemy(enemy);
      }
    });
  }

  checkCoinCollisions() {
    for (let i = this.level.coins.length - 1; i >= 0; i--) {
      if (!this.character.isColliding(this.level.coins[i])) continue;
      this.level.coins.splice(i, 1);
      this.collectedCoins++;
      this.updateCoinBar();
    }
  }

  checkBottleCollisions() {
    for (let i = this.level.bottles.length - 1; i >= 0; i--) {
      if (!this.character.isColliding(this.level.bottles[i])) continue;
      this.level.bottles.splice(i, 1);
      this.collectedBottles++;
      this.updateBottleBar();
    }
  }

  /**
   * Handles character jumping on enemy
   * @param {MovableObject} enemy - The enemy being jumped on
   */
  handleJumpOnEnemy(enemy) {
    if (enemy instanceof Endboss) {
      this.character.jump(); // Bounce off endboss
    } else {
      enemy.hit();
      this.character.jump();
    }
  }

  /**
   * Handles side collision with enemy
   * @param {MovableObject} enemy - The enemy colliding with
   */
  handleSideCollisionWithEnemy(enemy) {
    if (this.character.isHurt()) return;
    
    if (enemy instanceof Endboss) {
      this.character.hit();
      this.character.hit(); // Double damage for endboss
    } else {
      this.character.hit();
    }
    this.updateHealthBar();
  }

  /**
   * Checks collisions between throwable objects and enemies
   */
  /**
   * Checks collisions between throwable objects and enemies
   */
  checkThrowableCollisions() {
    for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
      let bottle = this.throwableObjects[i];
      let bottleHit = this.checkBottleHitEnemies(bottle);
      
      if (bottleHit) {
        this.throwableObjects.splice(i, 1);
      }
    }
  }

  /**
   * Checks if bottle hits any enemy
   * @param {ThrowableObject} bottle - The bottle to check
   * @returns {boolean} True if bottle hit an enemy
   */
  checkBottleHitEnemies(bottle) {
    let bottleHit = false;
    
    this.level.enemies.forEach((enemy) => {
      if (bottleHit) return;
      if (!bottle.isColliding(enemy)) return;
      if (enemy.isDead()) return;
      
      this.handleBottleEnemyHit(enemy);
      bottleHit = true;
    });
    
    return bottleHit;
  }

  /**
   * Handles bottle hitting an enemy
   * @param {MovableObject} enemy - The enemy that was hit
   */
  handleBottleEnemyHit(enemy) {
    enemy.hit();
    
    if (enemy instanceof Endboss) {
      enemy.applyStun();
      this.updateEndbossBar();
    }
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
      let percentage = (endboss.energy / 10) * 100;
      this.endbossBar.setPercentage(percentage);
    }
  }

  /**
   * Updates character health status bar
   */
  updateHealthBar() {
    this.statusBar.setPercentage(this.character.energy);
  }

  /**
   * Removes dead enemies after 3 seconds (except Endboss)
   */
  cleanupDeadEnemies() {
    let currentTime = new Date().getTime();
    
    for (let i = this.level.enemies.length - 1; i >= 0; i--) {
      let enemy = this.level.enemies[i];
      
      // Don't remove Endboss - player should see it when they win
      if (enemy instanceof Endboss) continue;
      
      if (enemy.isDead() && enemy.deathTime > 0) {
        let timeSinceDeath = (currentTime - enemy.deathTime) / 1000;
        
        if (timeSinceDeath >= 3) {
          this.level.enemies.splice(i, 1);
        }
      }
    }
  }

  updateCoinBar() {
    if (this.totalCoins === 0) {
      this.coinBar.setPercentage(0);
      return;
    }
    let percentage = (this.collectedCoins / this.totalCoins) * 100;
    this.coinBar.setPercentage(percentage);
  }

  updateBottleBar() {
    if (this.maxBottles === 0) {
      this.bottleBar.setPercentage(0);
      return;
    }
    let percentage = (this.collectedBottles / this.maxBottles) * 100;
    this.bottleBar.setPercentage(percentage);
  }

  draw() {
    if (this.gameStateManager.isRunning()) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.translate(this.camera_x, 0);
      this.addObjectsToMap(this.level.backgroundObjects);
      this.addObjectsToMap(this.level.clouds);
      this.addObjectsToMap(this.level.coins);
      this.addObjectsToMap(this.level.bottles);
      this.addToMap(this.character);
      this.addObjectsToMap(this.level.enemies);
      this.addObjectsToMap(this.throwableObjects);
      this.ctx.translate(-this.camera_x, 0);
      this.addToMap(this.statusBar);
      this.addToMap(this.coinBar);
      this.addToMap(this.bottleBar);
      if (this.endbossNearby) {
        this.addToMap(this.endbossBar);
      }
    }
    requestAnimationFrame(() => this.draw());
  }

  addObjectsToMap(objects) {
    objects.forEach((object) => {
      this.addToMap(object);
    });
  }

  addToMap(movableObject) {
    if (movableObject.otherDirection) {
      this.flipImage(movableObject);
    }
    movableObject.draw(this.ctx);
    // movableObject.drawFrame(this.ctx);
    if (movableObject.otherDirection) {
      this.flipImageBack(movableObject);
    }
  }

  flipImage(movableObject) {
    this.ctx.save();
    this.ctx.translate(movableObject.width, 0);
    this.ctx.scale(-1, 1);
    movableObject.x = movableObject.x * -1;
  }

  flipImageBack(movableObject) {
    movableObject.x = movableObject.x * -1;
    this.ctx.restore();
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
      this.gameStateManager.setState(GameStateManager.STATES.GAME_OVER);
      this.screenManager.showGameOver();
      this.dispatchGameEnded("lose");
    }
  }

  /**
   * Dispatches an ended event with result info
   * @param {string} result - End result value
   */
  dispatchGameEnded(result) {
    const endedEvent = new CustomEvent("gameEnded", { detail: { result } });
    document.dispatchEvent(endedEvent);
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
    this.dispatchGameEnded("win");
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
    this.camera_x = 0;
    this.throwableObjects = [];
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

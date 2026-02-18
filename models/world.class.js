class World {
  character = new Character();
  level = level1;
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

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.totalCoins = this.level.coins.length;
    this.maxBottles = this.level.bottles.length;
    this.updateCoinBar();
    this.updateBottleBar();
    this.draw();
    this.setWorld();
    this.run();
  }

  setWorld() {
    this.character.world = this;
  }

  run() {
    setInterval(() => {
      this.checkCollisions();
      this.checkThrowableObject();
      this.checkEndbossProximity();
      this.cleanupDeadEnemies();
    }, 200);
  }

  checkThrowableObject() {
    if (!this.keyboard.D) return;
    if (this.collectedBottles <= 0) {
      this.keyboard.D = false;
      return;
    }
    let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
    this.throwableObjects.push(bottle);
    this.collectedBottles = Math.max(0, this.collectedBottles - 1);
    this.updateBottleBar();
    this.keyboard.D = false;
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
    this.statusBar.setPercentage(this.character.energy);
  }

  /**
   * Checks collisions between throwable objects and enemies
   */
  checkThrowableCollisions() {
    for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
      let bottle = this.throwableObjects[i];
      let bottleHit = false;
      
      this.level.enemies.forEach((enemy) => {
        if (bottleHit) return;
        if (!bottle.isColliding(enemy)) return;
        if (enemy.isDead()) return;
        
        enemy.hit();
        bottleHit = true;
        
        if (enemy instanceof Endboss) {
          this.updateEndbossBar();
        }
      });
      
      if (bottleHit) {
        this.throwableObjects.splice(i, 1);
      }
    }
  }

  /**
   * Checks if endboss is nearby and updates proximity flag
   */
  checkEndbossProximity() {
    let previousState = this.endbossNearby;
    this.endbossNearby = this.character.x > 2200;
    
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
   * Removes dead enemies after 3 seconds
   */
  cleanupDeadEnemies() {
    let currentTime = new Date().getTime();
    
    for (let i = this.level.enemies.length - 1; i >= 0; i--) {
      let enemy = this.level.enemies[i];
      
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
    movableObject.drawFrame(this.ctx);
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
}

class World {
  character = new Character();
  level = level1;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  statusBar = new StatusBar();
  coinBar = new CoinStatusBar();
  throwableObjects = [];
  collectedCoins = 0;
  totalCoins = 0;

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.totalCoins = this.level.coins.length;
    this.updateCoinBar();
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
    }, 200);
  }

  checkThrowableObject() {
    if (!this.keyboard.D) return;
    let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
    this.throwableObjects.push(bottle);
    this.keyboard.D = false;
  }

  checkCollisions() {
    this.checkEnemyCollisions();
    this.checkCoinCollisions();
  }

  checkEnemyCollisions() {
    this.level.enemies.forEach((enemy) => {
      if (!this.character.isColliding(enemy)) return;
      this.character.hit();
      this.statusBar.setPercentage(this.character.energy);
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

  updateCoinBar() {
    if (this.totalCoins === 0) {
      this.coinBar.setPercentage(0);
      return;
    }
    let percentage = (this.collectedCoins / this.totalCoins) * 100;
    this.coinBar.setPercentage(percentage);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.level.coins);
    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.throwableObjects);
    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.statusBar);
    this.addToMap(this.coinBar);
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

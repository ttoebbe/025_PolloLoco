class MovableObject extends DrawableObject {
  speed = 0.1;
  otherDirection = false;
  speedY = 0;
  acceleration = 1.3;
  energy = 100;
  lastHit = 0;
  
  static gameStateManager = null;

  /**
   * Sets the static game state manager reference
   * @param {GameStateManager} gameStateManager - The game state manager instance
   */
  static setGameStateManager(gameStateManager) {
    MovableObject.gameStateManager = gameStateManager;
  }

  applyGravity() {
    if (MovableObject.gameStateManager) {
      MovableObject.gameStateManager.registerInterval(() => {
        if (this.isAboveGround() || this.speedY > 0) {
          this.y -= this.speedY;
          this.speedY -= this.acceleration;
        }
      }, 1000 / 25);
    }
  }

  isAboveGround() {
    if (this instanceof ThrowableObject) {
      return true;
    } else {
      return this.y < 180;
    }
  }

  isColliding(movableObject) {
    const selfBounds = this.getCollisionBounds();
    const otherBounds = movableObject.getCollisionBounds();

    return (
      selfBounds.right > otherBounds.left &&
      selfBounds.bottom > otherBounds.top &&
      selfBounds.left < otherBounds.right &&
      selfBounds.top < otherBounds.bottom
    );
  }

  /**
   * Checks if collision is from the side (horizontal)
   * @param {MovableObject} movableObject - Object to check collision with
   * @returns {boolean} True if collision is from side
   */
  isCollidingFromSide(movableObject) {
    if (!this.isColliding(movableObject)) return false;
    const selfBounds = this.getCollisionBounds();
    const otherBounds = movableObject.getCollisionBounds();
    
    // Character bottom should be more than 30px below enemy top for side collision
    return selfBounds.bottom > (otherBounds.top + 30);
  }

  /**
   * Checks if collision is from above (character jumping on enemy)
   * @param {MovableObject} movableObject - Object to check collision with
   * @returns {boolean} True if collision is from above
   */
  isCollidingFromAbove(movableObject) {
    if (!this.isColliding(movableObject)) return false;
    const selfBounds = this.getCollisionBounds();
    const otherBounds = movableObject.getCollisionBounds();

    // Only count when falling onto the enemy
    if (this.speedY >= 0) return false;

    // Character bottom should be close to or above enemy top (within 30px)
    return selfBounds.bottom <= (otherBounds.top + 30);
  }

  hit() {
    this.energy -= 5;
    this.lastHit = new Date().getTime();
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
    }
  }

  isHurt() {
    let timepassed = new Date().getTime() - this.lastHit;
    timepassed = timepassed / 1000; // in seconds
    return timepassed < 1;
  }

  isDead() {
    return this.energy == 0;
  }

  playAnimation(images) {
    let i = this.currentImageIndex % images.length; // 0, 1, 2, 3, 4, 5 (Modulo-Operator)
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImageIndex++;
  }

  moveRight(pixels) {
    this.x += this.speed;
    // this.otherDirection = false;
  }

  moveLeft() {
    this.x -= this.speed;
    // this.otherDirection = true;
  }

  jump() {
    this.speedY = 18;
    this.world.keyboard.SPACE = false; // Reset after jump
  }
}

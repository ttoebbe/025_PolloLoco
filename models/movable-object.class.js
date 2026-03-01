/**
 * Represents the movable object.
 */
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

  /**
   * Apply Gravity.
   */
  applyGravity() {
    if (!MovableObject.gameStateManager) return;
    MovableObject.gameStateManager.registerInterval(() => {
      this.updateVerticalMovement();
    }, 1000 / 25);
  }

  /**
   * Updates vertical Movement.
   */
  updateVerticalMovement() {
    if (!this.shouldUpdateVerticalMovement()) return;
    this.applyVerticalStep();
    this.snapToGround();
  }

  /**
   * Checks whether update Vertical Movement applies.
   * @returns {boolean} True when the condition is met.
   */
  shouldUpdateVerticalMovement() {
    if (this instanceof ThrowableObject) return this.isAboveGround() || this.speedY !== 0;
    if (this.isAboveGround() || this.speedY > 0) return true;
    return this.isBelowGround();
  }

  /**
   * Apply Vertical Step.
   */
  applyVerticalStep() {
    this.y -= this.speedY;
    this.speedY -= this.acceleration;
  }

  /**
   * Checks whether below Ground is true.
   * @returns {boolean} True when the condition is met.
   */
  isBelowGround() {
    return this.y > this.getGroundY();
  }

  /**
   * Snap To Ground.
   */
  snapToGround() {
    if (this instanceof ThrowableObject) return;
    if (!this.isBelowGround()) return;
    this.y = this.getGroundY();
    this.speedY = 0;
  }

  /**
   * Returns ground Y.
   * @returns {*} Computed result value.
   */
  getGroundY() {
    return 180;
  }

  /**
   * Checks whether above Ground is true.
   * @returns {boolean} True when the condition is met.
   */
  isAboveGround() {
    if (this instanceof ThrowableObject) {
      return true;
    } else {
      return this.y < 180;
    }
  }

  /**
   * Checks whether colliding is true.
   * @param {*} movableObject - Value for movable Object.
   * @returns {boolean} True when the condition is met.
   */
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

  /**
   * Hit.
   */
  hit() {
    this.energy -= 5;
    this.lastHit = new Date().getTime();
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
    }
  }

  /**
   * Checks whether hurt is true.
   * @returns {boolean} True when the condition is met.
   */
  isHurt() {
    let timepassed = new Date().getTime() - this.lastHit;
    timepassed = timepassed / 1000; // in seconds
    return timepassed < 1;
  }

  /**
   * Checks whether dead is true.
   * @returns {boolean} True when the condition is met.
   */
  isDead() {
    return this.energy == 0;
  }

  /**
   * Play Animation.
   * @param {*} images - Value for images.
   */
  playAnimation(images) {
    let i = this.currentImageIndex % images.length; // 0, 1, 2, 3, 4, 5 (Modulo-Operator)
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImageIndex++;
  }

  /**
   * Move Right.
   * @param {*} pixels - Value for pixels.
   */
  moveRight(pixels) {
    this.x += this.speed;
    // this.otherDirection = false;
  }

  /**
   * Move Left.
   */
  moveLeft() {
    this.x -= this.speed;
    // this.otherDirection = true;
  }

  /**
   * Jump.
   */
  jump() {
    this.speedY = 20;
    this.world.keyboard.space = false; // Reset after jump
  }
}

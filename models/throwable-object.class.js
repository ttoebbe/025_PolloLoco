class ThrowableObject extends MovableObject {
  collisionOffsets = { left: 8, right: 8, top: 8 };
  groundY = 360;
  isSplashing = false;
  isRemovable = false;
  splashFrameIndex = 0;
  rotationImages = [
    "img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
    "img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
    "img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
    "img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
  ];
  splashImages = [
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
  ];

  constructor(x, y, isThrownLeft) {
    super().loadImage(this.rotationImages[0]);
    this.loadImages(this.rotationImages);
    this.loadImages(this.splashImages);
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.isThrownLeft = isThrownLeft;
    this.otherDirection = isThrownLeft;
    this.throw();
  }

  /**
   * Starts all loops required for bottle flight.
   */
  throw() {
    this.speedY = 10;
    this.speed = 15;
    this.startHorizontalFlightLoop();
    this.startVerticalFlightLoop();
    this.startAnimationLoop();
  }

  /**
   * Moves bottle horizontally while in flight.
   */
  startHorizontalFlightLoop() {
    if (!MovableObject.gameStateManager) return;
    MovableObject.gameStateManager.registerInterval(() => {
      if (!this.canMoveInFlight()) return;
      this.x += this.isThrownLeft ? -this.speed : this.speed;
    }, 25);
  }

  /**
   * Updates bottle vertical movement with gravity.
   */
  startVerticalFlightLoop() {
    if (!MovableObject.gameStateManager) return;
    MovableObject.gameStateManager.registerInterval(() => {
      if (!this.canMoveInFlight()) return;
      this.y -= this.speedY;
      this.speedY -= this.acceleration;
    }, 1000 / 25);
  }

  /**
   * Handles bottle animation state transitions.
   */
  startAnimationLoop() {
    if (!MovableObject.gameStateManager) return;
    MovableObject.gameStateManager.registerInterval(() => {
      if (this.shouldRemove()) return;
      if (this.isSplashing) return this.playSplashFrame();
      this.playRotationFrame();
    }, 80);
  }

  /**
   * Returns true while bottle can still move in flight.
   * @returns {boolean} True when movement is allowed.
   */
  canMoveInFlight() {
    return !this.isSplashing && !this.shouldRemove();
  }

  /**
   * Plays one rotation frame.
   */
  playRotationFrame() {
    this.playAnimation(this.rotationImages);
  }

  /**
   * Plays splash sequence once and marks object removable.
   */
  playSplashFrame() {
    if (this.splashFrameIndex >= this.splashImages.length) {
      this.isRemovable = true;
      return;
    }
    const path = this.splashImages[this.splashFrameIndex];
    this.img = this.imageCache[path];
    this.splashFrameIndex++;
  }

  /**
   * Starts splash state exactly once.
   */
  startSplash() {
    if (this.isSplashing || this.shouldRemove()) return;
    this.isSplashing = true;
    this.speed = 0;
    this.speedY = 0;
    if (this.hasGroundImpact()) this.y = this.groundY;
    this.splashFrameIndex = 0;
    this.playSplashFrame();
  }

  /**
   * Checks whether bottle reached ground impact height.
   * @returns {boolean} True if bottle hit ground.
   */
  hasGroundImpact() {
    return this.y >= this.groundY;
  }

  /**
   * Indicates if bottle can be removed from world.
   * @returns {boolean} True when removal is allowed.
   */
  shouldRemove() {
    return this.isRemovable;
  }
}

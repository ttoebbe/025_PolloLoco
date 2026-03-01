/**
 * Represents the small chicken.
 */
const SMALL_CHICKEN_HEIGHT = 40;
const SMALL_CHICKEN_ASPECT_RATIO = 236 / 210;
const SMALL_CHICKEN_BASE_Y = 370;
const SMALL_CHICKEN_GROUND_OFFSET = 10;

class SmallChicken extends MovableObject {
  y = SMALL_CHICKEN_BASE_Y + SMALL_CHICKEN_GROUND_OFFSET;
  height = SMALL_CHICKEN_HEIGHT;
  width = Math.round(SMALL_CHICKEN_HEIGHT * SMALL_CHICKEN_ASPECT_RATIO);
  collisionOffsets = { left: 2, right: 2, top: 4 };
  energy = 1;
  isDying = false;
  deathTime = 0;
  hasDeathGroundOffset = false;

  IMAGES_WALKING = [
    "img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
    "img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
    "img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
  ];

  IMAGES_DEAD = ["img/3_enemies_chicken/chicken_small/2_dead/dead.png"];

  /**
   * Creates a new SmallChicken instance.
   */
  constructor() {
    super().loadImage("img/3_enemies_chicken/chicken_small/1_walk/1_w.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_DEAD);
    this.x = 300 + Math.random() * 1500;
    this.speed = 0.22 + Math.random() * 0.28;
  }

  /**
   * Starts small chicken animations using game state manager
   * @param {GameStateManager} gameStateManager - The game state manager instance
   */
  startAnimations(gameStateManager) {
    this.startMovement(gameStateManager);
    this.startWalkingAnimation(gameStateManager);
  }

  /**
   * Starts movement.
   * @param {GameStateManager} gameStateManager - Value for game State Manager.
   */
  startMovement(gameStateManager) {
    gameStateManager.registerInterval(() => {
      if (!this.isDead()) this.x -= this.speed;
    }, 1000 / 60);
  }

  /**
   * Starts walking Animation.
   * @param {GameStateManager} gameStateManager - Value for game State Manager.
   */
  startWalkingAnimation(gameStateManager) {
    gameStateManager.registerInterval(() => {
      if (this.isDead() && !this.isDying) this.playDeathAnimation();
      else if (!this.isDead()) this.playAnimation(this.IMAGES_WALKING);
      if (this.isDead()) this.speed = 0;
    }, 200);
  }

  /**
   * Plays death animation once
   */
  playDeathAnimation() {
    this.isDying = true;
    this.playAnimation(this.IMAGES_DEAD);
  }

  /**
   * Small chicken dies instantly when hit
   */
  hit() {
    if (this.isDead()) return;
    this.energy = 0;
    this.applyDeathGroundOffset();
    this.deathTime = Date.now();
    this.playDeathSound();
  }

  /**
   * Applies one-time vertical offset for death ground alignment.
   */
  applyDeathGroundOffset() {
    if (this.hasDeathGroundOffset) return;
    this.y += 20;
    this.hasDeathGroundOffset = true;
  }

  /**
   * Plays small chicken death sound
   */
  playDeathSound() {
    if (!window.audioManager) return;
    window.audioManager.playChickenDead();
  }
}

class Chicken extends MovableObject {
  y = 360;
  height = 60;
  width = 80;
  collisionOffsets = { left: 2, right: 2, top: 4 };
  energy = 1;
  isDying = false;
  deathTime = 0;
  
  IMAGES_WALKING = [
    "img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
    "img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
    "img/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
  ];

  IMAGES_DEAD = ["img/3_enemies_chicken/chicken_normal/2_dead/dead.png"];

  constructor() {
    super().loadImage("img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_DEAD);
    this.x = 300 + Math.random() * 1500;
    this.speed = 0.15 + Math.random() * 0.25;
  }

  /**
   * Starts chicken animations using game state manager
   * @param {GameStateManager} gameStateManager - The game state manager instance
   */
  startAnimations(gameStateManager) {
    this.startMovement(gameStateManager);
    this.startWalkingAnimation(gameStateManager);
  }

  startMovement(gameStateManager) {
    gameStateManager.registerInterval(() => {
      if (!this.isDead()) {
        this.x -= this.speed;
      }
    }, 1000 / 60);
  }

  startWalkingAnimation(gameStateManager) {
    gameStateManager.registerInterval(() => {
      if (this.isDead() && !this.isDying) {
        this.playDeathAnimation();
      } else if (!this.isDead()) {
        this.playAnimation(this.IMAGES_WALKING);
      }
      // Stop movement when dead
      if (this.isDead()) {
        this.speed = 0;
      }
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
   * Chicken dies instantly when hit
   */
  hit() {
    if (this.isDead()) return;
    this.energy = 0;
    this.deathTime = new Date().getTime();
    this.playDeathSound();
  }

  /**
   * Plays chicken death sound
   */
  playDeathSound() {
    if (!window.audioManager) return;
    window.audioManager.playChickenDead();
  }
}

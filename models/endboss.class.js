class Endboss extends MovableObject {
  height = 400;
  width = 300;
  y = 50;
  collisionOffsets = { left: 90, right: 8, top: 20 };
  energy = 10;
  isDying = false;
  deathTime = 0;
  deathAnimationIndex = 0;
  deathAnimationFinished = false;
  lastDeathFrameTime = 0;
  deathFrameDuration = 200;

  IMAGES_WALKING = [
    "img/4_enemie_boss_chicken/2_alert/G5.png",
    "img/4_enemie_boss_chicken/2_alert/G6.png",
    "img/4_enemie_boss_chicken/2_alert/G7.png",
    "img/4_enemie_boss_chicken/2_alert/G8.png",
    "img/4_enemie_boss_chicken/2_alert/G9.png",
    "img/4_enemie_boss_chicken/2_alert/G10.png",
    "img/4_enemie_boss_chicken/2_alert/G11.png",
    "img/4_enemie_boss_chicken/2_alert/G12.png",
  ];

  IMAGES_HURT = [
    "img/4_enemie_boss_chicken/4_hurt/G21.png",
    "img/4_enemie_boss_chicken/4_hurt/G22.png",
    "img/4_enemie_boss_chicken/4_hurt/G23.png",
  ];

  IMAGES_DEAD = [
    "img/4_enemie_boss_chicken/5_dead/G24.png",
    "img/4_enemie_boss_chicken/5_dead/G25.png",
    "img/4_enemie_boss_chicken/5_dead/G26.png",
  ];
  constructor() {
    super().loadImage("img/4_enemie_boss_chicken/2_alert/G5.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.x = 2500;
  }

  /**
   * Starts endboss animations using game state manager
   * @param {GameStateManager} gameStateManager - The game state manager instance
   */
  startAnimations(gameStateManager) {
    gameStateManager.registerInterval(() => {
      if (this.isDead()) {
        this.playDeathAnimation();
        this.speed = 0;
        return;
      }
      if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
        return;
      }
      this.playAnimation(this.IMAGES_WALKING);
    }, 200);
  }

  /**
   * Plays death animation until last frame and keeps it there
   */
  playDeathAnimation() {
    let now = Date.now();
    if (!this.isDying) {
      this.isDying = true;
      this.deathAnimationIndex = 0;
      this.deathAnimationFinished = false;
      this.lastDeathFrameTime = now;
      this.setDeathFrame();
      return;
    }
    if (this.deathAnimationFinished) {
      this.setDeathFrame(this.IMAGES_DEAD.length - 1);
      return;
    }
    if (now - this.lastDeathFrameTime < this.deathFrameDuration) return;
    this.lastDeathFrameTime = now;
    this.deathAnimationIndex++;
    if (this.deathAnimationIndex >= this.IMAGES_DEAD.length - 1) {
      this.deathAnimationIndex = this.IMAGES_DEAD.length - 1;
      this.deathAnimationFinished = true;
    }
    this.setDeathFrame();
  }

  setDeathFrame(index = this.deathAnimationIndex) {
    let path = this.IMAGES_DEAD[index];
    this.img = this.imageCache[path];
  }

  /**
   * Endboss takes 1 damage (1/10 of health)
   */
  hit() {
    if (this.isDead()) return;
    this.energy -= 1;
    this.lastHit = Date.now();
    if (this.energy <= 0) {
      this.energy = 0;
      if (this.deathTime === 0) {
        this.deathTime = Date.now();
      }
    }
  }
}

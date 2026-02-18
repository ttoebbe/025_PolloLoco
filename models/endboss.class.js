class Endboss extends MovableObject {
  height = 400;
  width = 300;
  y = 50;
  collisionOffsets = { left: 90, right: 8, top: 20 };
  energy = 10;
  isDying = false;
  deathTime = 0;

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
    "img/4_enemie_boss_chicken/4_hurt/G21.png",
    "img/4_enemie_boss_chicken/4_hurt/G21.png",
  ];

  IMAGES_DEAD = [
    "img/4_enemie_boss_chicken/5_dead/G24.png",
    "img/4_enemie_boss_chicken/5_dead/G24.png",
    "img/4_enemie_boss_chicken/5_dead/G24.png",
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
      if (this.isDead() && !this.isDying) {
        this.playDeathAnimation();
      } else if (this.isHurt() && !this.isDead()) {
        this.playAnimation(this.IMAGES_HURT);
      } else if (!this.isDead() && !this.isHurt()) {
        this.playAnimation(this.IMAGES_WALKING);
      }
      // Stop any movement when dead
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
   * Endboss takes 1 damage (1/10 of health)
   */
  hit() {
    this.energy -= 1;
    this.lastHit = new Date().getTime();
    if (this.energy <= 0) {
      this.energy = 0;
      this.deathTime = new Date().getTime();
    }
  }
}

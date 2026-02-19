class Endboss extends MovableObject {
  height = 400;
  width = 300;
  y = 50;
  collisionOffsets = { left: 90, right: 8, top: 20 };
  energy = 10;
  speed = 0;
  targetCharacter = null;
  isMoving = false;
  stunDurationMs = 500;
  stunnedUntil = 0;
  chaseActivated = false;
  chaseActivationDistance = 600;
  baseSpeedFactor = 0.3;
  chaseStopDistance = 4;
  isDying = false;
  deathTime = 0;
  deathAnimationIndex = 0;
  deathAnimationFinished = false;
  lastDeathFrameTime = 0;
  deathFrameDuration = 200;

  IMAGES_WALKING = [
    "img/4_enemie_boss_chicken/1_walk/G1.png",
    "img/4_enemie_boss_chicken/1_walk/G2.png",
    "img/4_enemie_boss_chicken/1_walk/G3.png",
    "img/4_enemie_boss_chicken/1_walk/G4.png",
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
    super().loadImage("img/4_enemie_boss_chicken/1_walk/G1.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.x = 2500;
  }

  /**
   * Starts endboss animations using game state manager
   * @param {GameStateManager} gameStateManager - The game state manager instance
   * @param {Character} targetCharacter - The character to chase
   */
  startAnimations(gameStateManager, targetCharacter) {
    this.setTarget(targetCharacter);

    gameStateManager.registerInterval(() => {
      if (this.isDead()) {
        this.speed = 0;
        this.isMoving = false;
        return;
      }
      this.updateChaseMovement();
    }, 1000 / 60);

    gameStateManager.registerInterval(() => {
      if (this.isDead()) {
        this.playDeathAnimation();
        this.speed = 0;
        this.isMoving = false;
        return;
      }
      if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
        return;
      }
      if (this.isMoving) {
        this.playAnimation(this.IMAGES_WALKING);
      }
    }, 200);
  }

  /**
   * Sets target character for chase behavior
   * @param {Character} character - Target character
   */
  setTarget(character) {
    this.targetCharacter = character || null;
  }

  /**
   * Sets stun duration in milliseconds
   * @param {number} durationMs - Stun duration in ms
   */
  setStunDurationMs(durationMs) {
    if (durationMs <= 0) return;
    this.stunDurationMs = durationMs;
  }

  /**
   * Applies or refreshes stun timer
   */
  applyStun() {
    this.stunnedUntil = Date.now() + this.stunDurationMs;
  }

  /**
   * Checks if endboss is currently stunned
   * @returns {boolean} True when stunned
   */
  isStunned() {
    return Date.now() < this.stunnedUntil;
  }

  /**
   * Sets distance at which chase activates
   * @param {number} distance - Activation distance in px
   */
  setChaseActivationDistance(distance) {
    if (distance <= 0) return;
    this.chaseActivationDistance = distance;
  }

  /**
   * Returns absolute X distance to target character
   * @returns {number} Distance in px
   */
  getDistanceToTarget() {
    if (!this.targetCharacter) return Number.POSITIVE_INFINITY;
    return Math.abs(this.targetCharacter.x - this.x);
  }

  /**
   * Updates horizontal chase movement towards character
   */
  updateChaseMovement() {
    if (!this.targetCharacter || this.isDead()) {
      this.isMoving = false;
      this.speed = 0;
      return;
    }
    if (this.isStunned()) {
      this.isMoving = false;
      this.speed = 0;
      return;
    }
    let deltaX = this.targetCharacter.x - this.x;
    let distanceToTarget = this.getDistanceToTarget();
    if (!this.chaseActivated && distanceToTarget > this.chaseActivationDistance) {
      this.isMoving = false;
      this.speed = 0;
      return;
    }
    if (!this.chaseActivated && distanceToTarget <= this.chaseActivationDistance) {
      this.chaseActivated = true;
    }
    let chaseSpeed = this.targetCharacter.speed * this.baseSpeedFactor;
    if (distanceToTarget <= this.chaseStopDistance) {
      this.isMoving = false;
      this.speed = 0;
      return;
    }
    this.speed = chaseSpeed;
    this.isMoving = true;
    if (deltaX < 0) {
      this.x -= chaseSpeed;
      this.otherDirection = false;
      return;
    }
    this.x += chaseSpeed;
    this.otherDirection = true;
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

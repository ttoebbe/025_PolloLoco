/**
 * Represents the endboss.
 */
class Endboss extends MovableObject {
  height = 400;
  width = 300;
  y = 50;
  collisionOffsets = { left: 90, right: 8, top: 20 };
  maxEnergy = 100;
  energy = 100;
  bottleHitDamage = 10;
  speed = 0;
  targetCharacter = null;
  isMoving = false;
  bottleDamageCooldownMs = 900;
  lastBottleDamageTime = 0;
  stunDurationMs = 220;
  stunCooldownMs = 1800;
  lastBottleStunTime = 0;
  stunnedUntil = 0;
  chaseActivated = false;
  chaseActivationDistance = 600;
  baseSpeedFactor = 0.35;
  enragedSpeedFactor = 0.48;
  enrageThresholdEnergy = 50;
  chaseStopDistance = -3;
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

  /**
   * Creates a new Endboss instance.
   */
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
    this.registerMovementLoop(gameStateManager);
    this.registerAnimationLoop(gameStateManager);
  }

  /**
   * Register Movement Loop.
   * @param {GameStateManager} gameStateManager - Value for game State Manager.
   * @returns {*} Computed result value.
   */
  registerMovementLoop(gameStateManager) {
    gameStateManager.registerInterval(() => {
      if (!this.isDead()) return this.updateChaseMovement();
      this.stopMovement();
    }, 1000 / 60);
  }

  /**
   * Register Animation Loop.
   * @param {GameStateManager} gameStateManager - Value for game State Manager.
   */
  registerAnimationLoop(gameStateManager) {
    gameStateManager.registerInterval(() => this.updateAnimationFrame(), 200);
  }

  /**
   * Updates animation Frame.
   * @returns {*} Computed result value.
   */
  updateAnimationFrame() {
    if (this.isDead()) return this.playDeathFrame();
    if (this.isHurt()) return this.playAnimation(this.IMAGES_HURT);
    if (this.isMoving) this.playAnimation(this.IMAGES_WALKING);
  }

  /**
   * Play Death Frame.
   */
  playDeathFrame() {
    this.playDeathAnimation();
    this.stopMovement();
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
   * Returns horizontal gap between endboss and target collision bounds
   * > 0 means separated, 0 means touching, < 0 means overlap
   * @returns {number} Horizontal gap in pixels
   */
  getHorizontalGapToTargetBounds() {
    if (!this.targetCharacter) return Number.POSITIVE_INFINITY;
    const selfBounds = this.getCollisionBounds();
    const targetBounds = this.targetCharacter.getCollisionBounds();
    if (selfBounds.right <= targetBounds.left) return targetBounds.left - selfBounds.right;
    if (targetBounds.right <= selfBounds.left) return selfBounds.left - targetBounds.right;
    const overlap = Math.min(selfBounds.right, targetBounds.right) - Math.max(selfBounds.left, targetBounds.left);
    return -overlap;
  }

  /**
   * Updates horizontal chase movement towards character
   */
  updateChaseMovement() {
    if (this.shouldStopMoving()) {
      this.stopMovement();
      return;
    }
    
    if (!this.shouldStartChase()) {
      this.stopMovement();
      return;
    }
    
    this.executeChaseMovement();
  }

  /**
   * Checks if endboss should stop moving
   * @returns {boolean} True if should stop moving
   */
  shouldStopMoving() {
    return !this.targetCharacter || this.isDead() || this.isStunned();
  }

  /**
   * Checks if chase should start or continue
   * @returns {boolean} True if should chase
   */
  shouldStartChase() {
    let distanceToTarget = this.getDistanceToTarget();
    
    if (!this.chaseActivated && distanceToTarget > this.chaseActivationDistance) {
      return false;
    }
    
    if (!this.chaseActivated && distanceToTarget <= this.chaseActivationDistance) {
      this.chaseActivated = true;
    }

    const horizontalGap = this.getHorizontalGapToTargetBounds();
    return horizontalGap > this.chaseStopDistance;
  }

  /**
   * Stops endboss movement
   */
  stopMovement() {
    this.isMoving = false;
    this.speed = 0;
  }

  /**
   * Executes chase movement towards target
   */
  executeChaseMovement() {
    const direction = this.getChaseDirection();
    const speedFactor = this.getCurrentSpeedFactor();
    const chaseSpeed = this.targetCharacter.speed * speedFactor;
    const step = this.getChaseStep(chaseSpeed);
    if (direction === 0 || step === 0) return this.stopMovement();
    this.speed = chaseSpeed;
    this.isMoving = true;
    this.moveInDirection(direction, step);
  }

  /**
   * Checks whether endboss is in enraged movement phase.
   * @returns {boolean} True when health threshold is reached.
   */
  isEnraged() {
    return this.energy <= this.enrageThresholdEnergy && !this.isDead();
  }

  /**
   * Returns current chase speed factor based on phase.
   * @returns {number} Movement speed factor.
   */
  getCurrentSpeedFactor() {
    return this.isEnraged() ? this.enragedSpeedFactor : this.baseSpeedFactor;
  }

  /**
   * Checks if bottle can currently deal damage.
   * @param {number} now - Current timestamp.
   * @returns {boolean} True when damage window is open.
   */
  isBottleDamageWindowOpen(now) {
    if (!this.chaseActivated) return false;
    return now - this.lastBottleDamageTime >= this.bottleDamageCooldownMs;
  }

  /**
   * Checks whether a new bottle stun can be applied.
   * @param {number} now - Current timestamp.
   * @returns {boolean} True when stun cooldown elapsed.
   */
  canApplyBottleStun(now) {
    return now - this.lastBottleStunTime >= this.stunCooldownMs;
  }

  /**
   * Applies a bottle hit using damage and stun windows.
   * @returns {boolean} True if damage was applied.
   */
  tryTakeBottleHit() {
    const now = Date.now();
    if (this.isDead() || !this.isBottleDamageWindowOpen(now)) return false;
    this.lastBottleDamageTime = now;
    this.hit();
    if (!this.isDead() && this.canApplyBottleStun(now)) {
      this.lastBottleStunTime = now;
      this.applyStun();
    }
    return true;
  }

  /**
   * Returns chase Direction.
   * @returns {*} Computed result value.
   */
  getChaseDirection() {
    const selfBounds = this.getCollisionBounds();
    const targetBounds = this.targetCharacter.getCollisionBounds();
    const selfCenterX = (selfBounds.left + selfBounds.right) / 2;
    const targetCenterX = (targetBounds.left + targetBounds.right) / 2;
    return Math.sign(targetCenterX - selfCenterX);
  }

  /**
   * Returns chase Step.
   * @param {*} chaseSpeed - Value for chase Speed.
   * @returns {*} Computed result value.
   */
  getChaseStep(chaseSpeed) {
    const horizontalGap = this.getHorizontalGapToTargetBounds();
    const remainingDistance = Math.max(0, horizontalGap - this.chaseStopDistance);
    return Math.min(chaseSpeed, remainingDistance);
  }

  /**
   * Move In Direction.
   * @param {*} direction - Value for direction.
   * @param {*} step - Value for step.
   * @returns {*} Computed result value.
   */
  moveInDirection(direction, step) {
    if (direction < 0) return this.moveLeftStep(step);
    this.moveRightStep(step);
  }

  /**
   * Move Left Step.
   * @param {*} step - Value for step.
   */
  moveLeftStep(step) {
    this.x -= step;
    this.otherDirection = false;
  }

  /**
   * Move Right Step.
   * @param {*} step - Value for step.
   */
  moveRightStep(step) {
    this.x += step;
    this.otherDirection = true;
  }

  /**
   * Plays death animation until last frame and keeps it there
   */
  playDeathAnimation() {
    const now = Date.now();
    if (!this.isDying) return this.startDeathAnimation(now);
    if (this.deathAnimationFinished) return this.setDeathFrame(this.IMAGES_DEAD.length - 1);
    if (!this.isNextDeathFrameReady(now)) return;
    this.advanceDeathAnimation(now);
  }

  /**
   * Starts death Animation.
   * @param {*} now - Value for now.
   */
  startDeathAnimation(now) {
    this.isDying = true;
    this.deathAnimationIndex = 0;
    this.deathAnimationFinished = false;
    this.lastDeathFrameTime = now;
    this.setDeathFrame();
  }

  /**
   * Checks whether next Death Frame Ready is true.
   * @param {*} now - Value for now.
   * @returns {boolean} True when the condition is met.
   */
  isNextDeathFrameReady(now) {
    return now - this.lastDeathFrameTime >= this.deathFrameDuration;
  }

  /**
   * Advance Death Animation.
   * @param {*} now - Value for now.
   * @returns {*} Computed result value.
   */
  advanceDeathAnimation(now) {
    this.lastDeathFrameTime = now;
    this.deathAnimationIndex++;
    if (this.deathAnimationIndex >= this.IMAGES_DEAD.length - 1) return this.finishDeathAnimation();
    this.setDeathFrame();
  }

  /**
   * Finish Death Animation.
   */
  finishDeathAnimation() {
    this.deathAnimationIndex = this.IMAGES_DEAD.length - 1;
    this.deathAnimationFinished = true;
    this.setDeathFrame();
  }

  /**
   * Sets death Frame.
   * @param {number} index - Value for index.
   */
  setDeathFrame(index = this.deathAnimationIndex) {
    let path = this.IMAGES_DEAD[index];
    this.img = this.imageCache[path];
  }

  /**
   * Endboss takes bottle hit damage.
   */
  hit() {
    if (this.isDead()) return;
    this.energy -= this.bottleHitDamage;
    this.lastHit = Date.now();
    if (this.energy <= 0) {
      this.energy = 0;
      this.setDeathTimestamp();
      this.playDeadSound();
      return;
    }
    this.playHurtSound();
  }

  /**
   * Sets death timestamp once
   */
  setDeathTimestamp() {
    if (this.deathTime !== 0) return;
    this.deathTime = Date.now();
  }

  /**
   * Plays endboss hurt sound
   */
  playHurtSound() {
    if (!window.audioManager) return;
    window.audioManager.playEndbossHurt();
  }

  /**
   * Plays endboss death sound
   */
  playDeadSound() {
    if (!window.audioManager) return;
    window.audioManager.playEndbossDead();
  }
}

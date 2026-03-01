/**
 * Represents the endboss.
 */
class Endboss extends MovableObject {
  height = 400;
  width = 300;
  y = 50;
  collisionOffsets = { left: 90, right: 90, top: 20 };
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
  chaseController;
  animationController;

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
    this.chaseController = new EndbossChaseController(this);
    this.animationController = new EndbossAnimationController(this);
    this.x = 2500;
  }

  /**
   * Starts endboss animations using game state manager.
   * @param {GameStateManager} gameStateManager - Game state manager instance.
   * @param {Character} targetCharacter - Character to chase.
   */
  startAnimations(gameStateManager, targetCharacter) {
    this.setTarget(targetCharacter);
    this.registerMovementLoop(gameStateManager);
    this.registerAnimationLoop(gameStateManager);
  }

  /**
   * Registers movement loop.
   * @param {GameStateManager} gameStateManager - Game state manager instance.
   */
  registerMovementLoop(gameStateManager) {
    gameStateManager.registerInterval(() => {
      if (!this.isDead()) return this.updateChaseMovement();
      this.stopMovement();
    }, 1000 / 60);
  }

  /**
   * Registers animation loop.
   * @param {GameStateManager} gameStateManager - Game state manager instance.
   */
  registerAnimationLoop(gameStateManager) {
    gameStateManager.registerInterval(() => this.updateAnimationFrame(), 200);
  }

  /**
   * Sets target character for chase behavior.
   * @param {Character} character - Target character.
   */
  setTarget(character) {
    this.chaseController.setTarget(character);
  }

  /**
   * Sets stun duration in milliseconds.
   * @param {number} durationMs - Stun duration in ms.
   */
  setStunDurationMs(durationMs) {
    this.chaseController.setStunDurationMs(durationMs);
  }

  /**
   * Applies or refreshes stun timer.
   */
  applyStun() {
    this.chaseController.applyStun();
  }

  /**
   * Checks if endboss is currently stunned.
   * @returns {boolean} True when stunned.
   */
  isStunned() {
    return this.chaseController.isStunned();
  }

  /**
   * Sets distance at which chase activates.
   * @param {number} distance - Activation distance in px.
   */
  setChaseActivationDistance(distance) {
    this.chaseController.setChaseActivationDistance(distance);
  }

  /**
   * Returns absolute X distance to target character.
   * @returns {number} Distance in px.
   */
  getDistanceToTarget() {
    return this.chaseController.getDistanceToTarget();
  }

  /**
   * Returns horizontal gap between collision bounds.
   * @returns {number} Horizontal gap in pixels.
   */
  getHorizontalGapToTargetBounds() {
    return this.chaseController.getHorizontalGapToTargetBounds();
  }

  /**
   * Updates horizontal chase movement towards character.
   */
  updateChaseMovement() {
    this.chaseController.updateChaseMovement();
  }

  /**
   * Checks if endboss should stop moving.
   * @returns {boolean} True if should stop moving.
   */
  shouldStopMoving() {
    return this.chaseController.shouldStopMoving();
  }

  /**
   * Checks if chase should start or continue.
   * @returns {boolean} True if should chase.
   */
  shouldStartChase() {
    return this.chaseController.shouldStartChase();
  }

  /**
   * Stops endboss movement.
   */
  stopMovement() {
    this.chaseController.stopMovement();
  }

  /**
   * Executes chase movement towards target.
   */
  executeChaseMovement() {
    this.chaseController.executeChaseMovement();
  }

  /**
   * Checks whether endboss is enraged.
   * @returns {boolean} True when enraged.
   */
  isEnraged() {
    return this.chaseController.isEnraged();
  }

  /**
   * Returns current chase speed factor.
   * @returns {number} Movement speed factor.
   */
  getCurrentSpeedFactor() {
    return this.chaseController.getCurrentSpeedFactor();
  }

  /**
   * Checks if bottle can currently deal damage.
   * @param {number} now - Current timestamp.
   * @returns {boolean} True when damage window is open.
   */
  isBottleDamageWindowOpen(now) {
    return this.chaseController.isBottleDamageWindowOpen(now);
  }

  /**
   * Checks whether a new bottle stun can be applied.
   * @param {number} now - Current timestamp.
   * @returns {boolean} True when stun cooldown elapsed.
   */
  canApplyBottleStun(now) {
    return this.chaseController.canApplyBottleStun(now);
  }

  /**
   * Applies bottle hit using damage and stun windows.
   * @returns {boolean} True if damage was applied.
   */
  tryTakeBottleHit() {
    return this.chaseController.tryTakeBottleHit();
  }

  /**
   * Returns chase direction.
   * @returns {number} Direction as -1, 0 or 1.
   */
  getChaseDirection() {
    return this.chaseController.getChaseDirection();
  }

  /**
   * Returns chase step.
   * @param {number} chaseSpeed - Computed chase speed.
   * @returns {number} Pixel step for this frame.
   */
  getChaseStep(chaseSpeed) {
    return this.chaseController.getChaseStep(chaseSpeed);
  }

  /**
   * Moves endboss in one horizontal direction.
   * @param {number} direction - Direction as -1 or 1.
   * @param {number} step - Pixel step.
   */
  moveInDirection(direction, step) {
    this.chaseController.moveInDirection(direction, step);
  }

  /**
   * Moves endboss one step left.
   * @param {number} step - Pixel step.
   */
  moveLeftStep(step) {
    this.chaseController.moveLeftStep(step);
  }

  /**
   * Moves endboss one step right.
   * @param {number} step - Pixel step.
   */
  moveRightStep(step) {
    this.chaseController.moveRightStep(step);
  }

  /**
   * Updates animation frame based on state.
   */
  updateAnimationFrame() {
    this.animationController.updateAnimationFrame();
  }

  /**
   * Plays one death animation frame.
   */
  playDeathFrame() {
    this.animationController.playDeathFrame();
  }

  /**
   * Plays death animation until last frame.
   */
  playDeathAnimation() {
    this.animationController.playDeathAnimation();
  }

  /**
   * Starts death animation.
   * @param {number} now - Current timestamp.
   */
  startDeathAnimation(now) {
    this.animationController.startDeathAnimation(now);
  }

  /**
   * Checks if next death frame is ready.
   * @param {number} now - Current timestamp.
   * @returns {boolean} True when next frame should render.
   */
  isNextDeathFrameReady(now) {
    return this.animationController.isNextDeathFrameReady(now);
  }

  /**
   * Advances death animation by one frame.
   * @param {number} now - Current timestamp.
   */
  advanceDeathAnimation(now) {
    this.animationController.advanceDeathAnimation(now);
  }

  /**
   * Completes death animation.
   */
  finishDeathAnimation() {
    this.animationController.finishDeathAnimation();
  }

  /**
   * Sets one death frame image.
   * @param {number} index - Target frame index.
   */
  setDeathFrame(index = this.deathAnimationIndex) {
    this.animationController.setDeathFrame(index);
  }

  /**
   * Endboss takes bottle hit damage.
   */
  hit() {
    if (this.isDead()) return;
    this.energy -= this.bottleHitDamage;
    this.lastHit = Date.now();
    if (this.energy > 0) return this.playHurtSound();
    this.energy = 0;
    this.setDeathTimestamp();
    this.playDeadSound();
  }

  /**
   * Sets death timestamp once.
   */
  setDeathTimestamp() {
    if (this.deathTime !== 0) return;
    this.deathTime = Date.now();
  }

  /**
   * Plays endboss hurt sound.
   */
  playHurtSound() {
    if (!window.audioManager) return;
    window.audioManager.playEndbossHurt();
  }

  /**
   * Plays endboss death sound.
   */
  playDeadSound() {
    if (!window.audioManager) return;
    window.audioManager.playEndbossDead();
  }
}

/**
 * Handles endboss chase, stun and bottle-hit logic.
 */
class EndbossChaseController {
  /**
   * Creates a new chase controller.
   * @param {Endboss} owner - Owning endboss instance.
   */
  constructor(owner) {
    this.owner = owner;
  }

  /**
   * Sets target character for chase behavior.
   * @param {Character} character - Target character.
   */
  setTarget(character) {
    this.owner.targetCharacter = character || null;
  }

  /**
   * Sets stun duration in milliseconds.
   * @param {number} durationMs - Stun duration in ms.
   */
  setStunDurationMs(durationMs) {
    if (durationMs <= 0) return;
    this.owner.stunDurationMs = durationMs;
  }

  /**
   * Applies or refreshes stun timer.
   */
  applyStun() {
    this.owner.stunnedUntil = Date.now() + this.owner.stunDurationMs;
  }

  /**
   * Checks if endboss is currently stunned.
   * @returns {boolean} True when stunned.
   */
  isStunned() {
    return Date.now() < this.owner.stunnedUntil;
  }

  /**
   * Sets distance at which chase activates.
   * @param {number} distance - Activation distance in px.
   */
  setChaseActivationDistance(distance) {
    if (distance <= 0) return;
    this.owner.chaseActivationDistance = distance;
  }

  /**
   * Returns absolute X distance to target character.
   * @returns {number} Distance in px.
   */
  getDistanceToTarget() {
    if (!this.owner.targetCharacter) return Number.POSITIVE_INFINITY;
    return Math.abs(this.owner.targetCharacter.x - this.owner.x);
  }

  /**
   * Returns horizontal gap between collision bounds.
   * @returns {number} Horizontal gap in pixels.
   */
  getHorizontalGapToTargetBounds() {
    if (!this.owner.targetCharacter) return Number.POSITIVE_INFINITY;
    const selfBounds = this.owner.getCollisionBounds();
    const targetBounds = this.owner.targetCharacter.getCollisionBounds();
    if (selfBounds.right <= targetBounds.left) return targetBounds.left - selfBounds.right;
    if (targetBounds.right <= selfBounds.left) return selfBounds.left - targetBounds.right;
    const overlap = Math.min(selfBounds.right, targetBounds.right) - Math.max(selfBounds.left, targetBounds.left);
    return -overlap;
  }

  /**
   * Updates horizontal chase movement towards character.
   */
  updateChaseMovement() {
    if (this.shouldStopMoving()) return this.stopMovement();
    if (!this.shouldStartChase()) return this.stopMovement();
    this.executeChaseMovement();
  }

  /**
   * Checks if endboss should stop moving.
   * @returns {boolean} True if should stop moving.
   */
  shouldStopMoving() {
    return !this.owner.targetCharacter || this.owner.isDead() || this.isStunned();
  }

  /**
   * Checks if chase should start or continue.
   * @returns {boolean} True if should chase.
   */
  shouldStartChase() {
    const distanceToTarget = this.getDistanceToTarget();
    if (!this.owner.chaseActivated && distanceToTarget > this.owner.chaseActivationDistance) return false;
    if (!this.owner.chaseActivated) this.owner.chaseActivated = true;
    const horizontalGap = this.getHorizontalGapToTargetBounds();
    return horizontalGap > this.owner.chaseStopDistance;
  }

  /**
   * Stops endboss movement.
   */
  stopMovement() {
    this.owner.isMoving = false;
    this.owner.speed = 0;
  }

  /**
   * Executes chase movement towards target.
   */
  executeChaseMovement() {
    const direction = this.getChaseDirection();
    const speedFactor = this.getCurrentSpeedFactor();
    const chaseSpeed = this.owner.targetCharacter.speed * speedFactor;
    const step = this.getChaseStep(chaseSpeed);
    if (direction === 0 || step === 0) return this.stopMovement();
    this.owner.speed = chaseSpeed;
    this.owner.isMoving = true;
    this.moveInDirection(direction, step);
  }

  /**
   * Checks whether endboss is enraged.
   * @returns {boolean} True when health threshold is reached.
   */
  isEnraged() {
    return this.owner.energy <= this.owner.enrageThresholdEnergy && !this.owner.isDead();
  }

  /**
   * Returns current chase speed factor.
   * @returns {number} Movement speed factor.
   */
  getCurrentSpeedFactor() {
    return this.isEnraged() ? this.owner.enragedSpeedFactor : this.owner.baseSpeedFactor;
  }

  /**
   * Checks if bottle can currently deal damage.
   * @param {number} now - Current timestamp.
   * @returns {boolean} True when damage window is open.
   */
  isBottleDamageWindowOpen(now) {
    if (!this.owner.chaseActivated) return false;
    return now - this.owner.lastBottleDamageTime >= this.owner.bottleDamageCooldownMs;
  }

  /**
   * Checks whether a new bottle stun can be applied.
   * @param {number} now - Current timestamp.
   * @returns {boolean} True when stun cooldown elapsed.
   */
  canApplyBottleStun(now) {
    return now - this.owner.lastBottleStunTime >= this.owner.stunCooldownMs;
  }

  /**
   * Applies bottle hit damage and stun windows.
   * @returns {boolean} True if damage was applied.
   */
  tryTakeBottleHit() {
    const now = Date.now();
    if (this.owner.isDead() || !this.isBottleDamageWindowOpen(now)) return false;
    this.owner.lastBottleDamageTime = now;
    this.owner.hit();
    if (!this.owner.isDead() && this.canApplyBottleStun(now)) this.applyBottleStun(now);
    return true;
  }

  /**
   * Returns chase direction.
   * @returns {number} Direction as -1, 0 or 1.
   */
  getChaseDirection() {
    const selfBounds = this.owner.getCollisionBounds();
    const targetBounds = this.owner.targetCharacter.getCollisionBounds();
    const selfCenterX = (selfBounds.left + selfBounds.right) / 2;
    const targetCenterX = (targetBounds.left + targetBounds.right) / 2;
    return Math.sign(targetCenterX - selfCenterX);
  }

  /**
   * Returns chase step for current frame.
   * @param {number} chaseSpeed - Computed chase speed.
   * @returns {number} Pixel step for this frame.
   */
  getChaseStep(chaseSpeed) {
    const horizontalGap = this.getHorizontalGapToTargetBounds();
    const remainingDistance = Math.max(0, horizontalGap - this.owner.chaseStopDistance);
    return Math.min(chaseSpeed, remainingDistance);
  }

  /**
   * Moves endboss in one horizontal direction.
   * @param {number} direction - Direction as -1 or 1.
   * @param {number} step - Pixel step.
   */
  moveInDirection(direction, step) {
    if (direction < 0) return this.moveLeftStep(step);
    this.moveRightStep(step);
  }

  /**
   * Moves endboss one step left.
   * @param {number} step - Pixel step.
   */
  moveLeftStep(step) {
    this.owner.x -= step;
    this.owner.otherDirection = false;
  }

  /**
   * Moves endboss one step right.
   * @param {number} step - Pixel step.
   */
  moveRightStep(step) {
    this.owner.x += step;
    this.owner.otherDirection = true;
  }

  /**
   * Applies bottle stun state and timestamp.
   * @param {number} now - Current timestamp.
   */
  applyBottleStun(now) {
    this.owner.lastBottleStunTime = now;
    this.applyStun();
  }
}

window.EndbossChaseController = EndbossChaseController;

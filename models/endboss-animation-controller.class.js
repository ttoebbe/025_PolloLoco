/**
 * Handles endboss animation flow.
 */
class EndbossAnimationController {
  /**
   * Creates a new animation controller.
   * @param {Endboss} owner - Owning endboss instance.
   */
  constructor(owner) {
    this.owner = owner;
  }

  /**
   * Updates animation frame based on endboss state.
   */
  updateAnimationFrame() {
    if (this.owner.isDead()) return this.playDeathFrame();
    if (this.owner.isHurt()) return this.owner.playAnimation(this.owner.IMAGES_HURT);
    if (this.owner.isMoving) this.owner.playAnimation(this.owner.IMAGES_WALKING);
  }

  /**
   * Plays one death animation frame.
   */
  playDeathFrame() {
    this.playDeathAnimation();
    this.owner.stopMovement();
  }

  /**
   * Plays death animation until last frame.
   */
  playDeathAnimation() {
    const now = Date.now();
    if (!this.owner.isDying) return this.startDeathAnimation(now);
    if (this.owner.deathAnimationFinished) return this.setDeathFrame(this.owner.IMAGES_DEAD.length - 1);
    if (!this.isNextDeathFrameReady(now)) return;
    this.advanceDeathAnimation(now);
  }

  /**
   * Starts death animation.
   * @param {number} now - Current timestamp.
   */
  startDeathAnimation(now) {
    this.owner.isDying = true;
    this.owner.deathAnimationIndex = 0;
    this.owner.deathAnimationFinished = false;
    this.owner.lastDeathFrameTime = now;
    this.setDeathFrame();
  }

  /**
   * Checks whether next death frame is ready.
   * @param {number} now - Current timestamp.
   * @returns {boolean} True when next frame should render.
   */
  isNextDeathFrameReady(now) {
    return now - this.owner.lastDeathFrameTime >= this.owner.deathFrameDuration;
  }

  /**
   * Advances death animation by one frame.
   * @param {number} now - Current timestamp.
   */
  advanceDeathAnimation(now) {
    this.owner.lastDeathFrameTime = now;
    this.owner.deathAnimationIndex++;
    if (this.owner.deathAnimationIndex >= this.owner.IMAGES_DEAD.length - 1) return this.finishDeathAnimation();
    this.setDeathFrame();
  }

  /**
   * Completes death animation.
   */
  finishDeathAnimation() {
    this.owner.deathAnimationIndex = this.owner.IMAGES_DEAD.length - 1;
    this.owner.deathAnimationFinished = true;
    this.setDeathFrame();
  }

  /**
   * Sets one death frame image.
   * @param {number} index - Target frame index.
   */
  setDeathFrame(index = this.owner.deathAnimationIndex) {
    const path = this.owner.IMAGES_DEAD[index];
    this.owner.img = this.owner.imageCache[path];
  }
}

window.EndbossAnimationController = EndbossAnimationController;

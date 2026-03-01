/**
 * Handles character animation state logic.
 */
class CharacterAnimationController {
  /**
   * Creates a new animation controller.
   * @param {Character} owner - Owning character instance.
   */
  constructor(owner) {
    this.owner = owner;
  }

  /**
   * Starts character animation logic.
   * @param {GameStateManager} gameStateManager - The game state manager.
   */
  startAnimationLoop(gameStateManager) {
    gameStateManager.registerInterval(() => this.animateCharacter(), 50);
  }

  /**
   * Handles the full animation state machine.
   */
  animateCharacter() {
    if (this.handleDeadAnimation()) return;
    if (this.handleHurtAnimation()) return;
    if (this.handleJumpAnimation()) return;
    if (this.handleLongIdleAnimation()) return;
    if (this.handleIdleAnimation()) return;
    this.playGroundAnimation();
  }

  /**
   * Plays dead animation when character is dead.
   * @returns {boolean} True when handled.
   */
  handleDeadAnimation() {
    if (!this.owner.isDead()) return false;
    this.owner.playAnimation(this.owner.IMAGES_DEAD);
    this.updateIdleAudio(false);
    return true;
  }

  /**
   * Plays hurt animation when character is hurt.
   * @returns {boolean} True when handled.
   */
  handleHurtAnimation() {
    if (!this.owner.isHurt()) return false;
    this.owner.playAnimation(this.owner.IMAGES_HURT);
    this.updateIdleAudio(false);
    return true;
  }

  /**
   * Plays jump animation while character is airborne.
   * @returns {boolean} True when handled.
   */
  handleJumpAnimation() {
    if (!this.owner.isAboveGround()) return this.resetJumpAndSkip();
    if (this.owner.jumpPhase === "none") this.startJumpCycle();
    this.setJumpPhaseByVelocity();
    if (this.owner.jumpPhase === "up") this.playJumpUpFrame();
    if (this.owner.jumpPhase === "down") this.playJumpDownFrame();
    this.updateIdleAudio(false);
    return true;
  }

  /**
   * Initializes jump animation state for a new jump cycle.
   */
  startJumpCycle() {
    this.owner.jumpPhase = "up";
    this.owner.jumpUpFrameIndex = 0;
    this.owner.jumpDownFrameIndex = 0;
  }

  /**
   * Sets jump phase based on current vertical velocity.
   */
  setJumpPhaseByVelocity() {
    if (this.owner.speedY > 0) {
      this.owner.jumpPhase = "up";
      return;
    }
    this.owner.jumpPhase = "down";
  }

  /**
   * Plays upward jump frames J-31 to J-34.
   */
  playJumpUpFrame() {
    const maxIndex = this.owner.jumpUpImages.length - 1;
    const frameIndex = Math.min(this.owner.jumpUpFrameIndex, maxIndex);
    const path = this.owner.jumpUpImages[frameIndex];
    this.owner.img = this.owner.imageCache[path];
    if (this.owner.jumpUpFrameIndex < maxIndex) this.owner.jumpUpFrameIndex++;
  }

  /**
   * Plays downward jump frames J-35 to J-39.
   */
  playJumpDownFrame() {
    const maxIndex = this.owner.jumpDownImages.length - 1;
    const frameIndex = Math.min(this.owner.jumpDownFrameIndex, maxIndex);
    const path = this.owner.jumpDownImages[frameIndex];
    this.owner.img = this.owner.imageCache[path];
    if (this.owner.jumpDownFrameIndex < maxIndex) this.owner.jumpDownFrameIndex++;
  }

  /**
   * Resets jump cycle after landing for next jump.
   */
  resetJumpCycle() {
    if (this.owner.jumpPhase === "none") return;
    this.owner.jumpPhase = "none";
    this.owner.jumpUpFrameIndex = 0;
    this.owner.jumpDownFrameIndex = 0;
  }

  /**
   * Plays long idle animation when idle delay elapsed.
   * @returns {boolean} True when handled.
   */
  handleLongIdleAnimation() {
    if (!this.isGroundIdleState()) return false;
    const isLongIdle = window.audioManager?.isLongIdleActive?.();
    if (!isLongIdle) return false;
    this.owner.playAnimation(this.owner.IMAGES_LONG_IDLE);
    this.updateIdleAudio(true);
    return true;
  }

  /**
   * Plays normal idle animation while grounded and inactive.
   * @returns {boolean} True when handled.
   */
  handleIdleAnimation() {
    if (!this.isGroundIdleState()) return false;
    this.owner.playAnimation(this.owner.IMAGES_IDLE);
    this.updateIdleAudio(true);
    return true;
  }

  /**
   * Plays walking animation on ground movement.
   */
  playGroundAnimation() {
    const keyboard = this.owner.world.keyboard;
    if (!keyboard.right && !keyboard.left) return;
    this.owner.playAnimation(this.owner.IMAGES_WALKING);
    this.updateIdleAudio(false);
  }

  /**
   * Checks if character is currently idle.
   * @returns {boolean} True when idle.
   */
  isIdleState() {
    const keyboard = this.owner.world.keyboard;
    return !keyboard.right && !keyboard.left;
  }

  /**
   * Checks whether character is grounded and idle.
   * @returns {boolean} True when idle on ground.
   */
  isGroundIdleState() {
    if (this.owner.isAboveGround()) return false;
    return this.isIdleState();
  }

  /**
   * Updates idle audio state.
   * @param {boolean} isIdle - True if character is idle.
   */
  updateIdleAudio(isIdle) {
    const audioManager = window.audioManager;
    if (!audioManager) return;
    audioManager.setCharacterIdle(isIdle);
  }

  /**
   * Resets jump cycle and returns false for state machine.
   * @returns {boolean} Always false.
   */
  resetJumpAndSkip() {
    this.resetJumpCycle();
    return false;
  }
}

window.CharacterAnimationController = CharacterAnimationController;

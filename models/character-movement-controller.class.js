/**
 * Handles character movement and input logic.
 */
class CharacterMovementController {
  /**
   * Creates a new movement controller.
   * @param {Character} owner - Owning character instance.
   */
  constructor(owner) {
    this.owner = owner;
  }

  /**
   * Starts character movement and camera logic.
   * @param {GameStateManager} gameStateManager - The game state manager.
   */
  startMovementLoop(gameStateManager) {
    gameStateManager.registerInterval(() => this.tickMovement(), 1000 / 60);
  }

  /**
   * Executes one movement tick.
   */
  tickMovement() {
    this.updateAirPhaseState();
    this.handleHorizontalMovement();
    this.handleJumpInput();
    this.updateWalkingSound();
    this.owner.world.cameraX = -this.owner.x + 100;
  }

  /**
   * Handles left and right movement input.
   */
  handleHorizontalMovement() {
    this.handleMoveRight();
    this.handleMoveLeft();
  }

  /**
   * Moves character to the right when allowed.
   */
  handleMoveRight() {
    const canMove = this.owner.world.keyboard.right;
    if (!canMove || this.owner.x >= this.owner.world.level.levelEndX) return;
    this.owner.moveRight();
    this.clampAirDrift();
    this.owner.otherDirection = false;
    this.markAudioActivity();
  }

  /**
   * Moves character to the left when allowed.
   */
  handleMoveLeft() {
    const canMove = this.owner.world.keyboard.left;
    if (!canMove || this.owner.x <= 0) return;
    this.owner.moveLeft();
    this.clampAirDrift();
    this.owner.otherDirection = true;
    this.markAudioActivity();
  }

  /**
   * Handles jump input and sound.
   */
  handleJumpInput() {
    const wantsJump = this.owner.world.keyboard.space;
    if (!wantsJump || this.owner.isAboveGround()) return;
    this.owner.jump();
    this.owner.startJumpCycle();
    this.startAirPhase();
    this.playJumpSound();
    this.markAudioActivity();
  }

  /**
   * Triggers rebound after stomping an enemy.
   */
  triggerStompRebound() {
    this.owner.speedY = 6.5;
    this.owner.startJumpCycle();
    this.startAirPhase();
  }

  /**
   * Updates walking sound state.
   */
  updateWalkingSound() {
    const audioManager = window.audioManager;
    if (!audioManager) return;
    audioManager.setWalkActive(this.isMovingOnGround());
  }

  /**
   * Checks if character moves on the ground.
   * @returns {boolean} True when walking.
   */
  isMovingOnGround() {
    const isMoving = this.owner.world.keyboard.right || this.owner.world.keyboard.left;
    return isMoving && !this.owner.isAboveGround() && !this.owner.isDead();
  }

  /**
   * Keeps air-phase state in sync with ground contact.
   */
  updateAirPhaseState() {
    if (this.isAirborneForDriftControl()) return;
    this.endAirPhase();
  }

  /**
   * Checks if character is airborne for drift control.
   * @returns {boolean} True when drift clamp stays active.
   */
  isAirborneForDriftControl() {
    if (this.owner.isAboveGround()) return true;
    return this.owner.speedY > 0;
  }

  /**
   * Starts a new air-phase and stores drift boundaries.
   */
  startAirPhase() {
    this.owner.isAirPhaseActive = true;
    this.owner.airPhaseStartX = this.owner.x;
    this.owner.maxAirDriftPx = this.owner.width + this.owner.airDriftBufferPx;
  }

  /**
   * Ends current air-phase and clears drift boundaries.
   */
  endAirPhase() {
    if (!this.owner.isAirPhaseActive) return;
    this.owner.isAirPhaseActive = false;
    this.owner.airPhaseStartX = 0;
    this.owner.maxAirDriftPx = 0;
  }

  /**
   * Clamps horizontal movement during an active air-phase.
   */
  clampAirDrift() {
    if (!this.owner.isAirPhaseActive) return;
    const minX = this.owner.airPhaseStartX - this.owner.maxAirDriftPx;
    const maxX = this.owner.airPhaseStartX + this.owner.maxAirDriftPx;
    this.owner.x = Math.max(minX, Math.min(this.owner.x, maxX));
  }

  /**
   * Plays jump sound effect.
   */
  playJumpSound() {
    if (!window.audioManager) return;
    window.audioManager.playJump();
  }

  /**
   * Marks one gameplay activity for audio manager.
   */
  markAudioActivity() {
    if (!window.audioManager) return;
    window.audioManager.markActivity();
  }
}

window.CharacterMovementController = CharacterMovementController;

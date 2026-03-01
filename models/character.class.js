/**
 * Represents the character.
 */
class Character extends MovableObject {
  height = 250;
  y = 80;
  speed = 10;
  collisionOffsets = { left: 12, right: 12, top: 120, bottom: 15 };
  IMAGES_WALKING = [
    "img/2_character_pepe/2_walk/W-21.png",
    "img/2_character_pepe/2_walk/W-22.png",
    "img/2_character_pepe/2_walk/W-23.png",
    "img/2_character_pepe/2_walk/W-24.png",
    "img/2_character_pepe/2_walk/W-25.png",
    "img/2_character_pepe/2_walk/W-26.png",
  ];

  IMAGES_JUMPING = [
    "img/2_character_pepe/3_jump/J-31.png",
    "img/2_character_pepe/3_jump/J-32.png",
    "img/2_character_pepe/3_jump/J-33.png",
    "img/2_character_pepe/3_jump/J-34.png",
    "img/2_character_pepe/3_jump/J-35.png",
    "img/2_character_pepe/3_jump/J-36.png",
    "img/2_character_pepe/3_jump/J-37.png",
    "img/2_character_pepe/3_jump/J-38.png",
    "img/2_character_pepe/3_jump/J-39.png",
  ];

  IMAGES_DEAD = [
    "img/2_character_pepe/5_dead/D-51.png",
    "img/2_character_pepe/5_dead/D-52.png",
    "img/2_character_pepe/5_dead/D-53.png",
    "img/2_character_pepe/5_dead/D-54.png",
    "img/2_character_pepe/5_dead/D-55.png",
    "img/2_character_pepe/5_dead/D-56.png",
    "img/2_character_pepe/5_dead/D-57.png",
  ];

  IMAGES_HURT = [
    "img/2_character_pepe/4_hurt/H-41.png",
    "img/2_character_pepe/4_hurt/H-42.png",
    "img/2_character_pepe/4_hurt/H-43.png",
  ];

  IMAGES_IDLE = [
    "img/2_character_pepe/1_idle/idle/I-1.png",
    "img/2_character_pepe/1_idle/idle/I-2.png",
    "img/2_character_pepe/1_idle/idle/I-3.png",
    "img/2_character_pepe/1_idle/idle/I-4.png",
    "img/2_character_pepe/1_idle/idle/I-5.png",
    "img/2_character_pepe/1_idle/idle/I-6.png",
    "img/2_character_pepe/1_idle/idle/I-7.png",
    "img/2_character_pepe/1_idle/idle/I-8.png",
    "img/2_character_pepe/1_idle/idle/I-9.png",
    "img/2_character_pepe/1_idle/idle/I-10.png",
  ];

  IMAGES_LONG_IDLE = [
    "img/2_character_pepe/1_idle/long_idle/I-11.png",
    "img/2_character_pepe/1_idle/long_idle/I-12.png",
    "img/2_character_pepe/1_idle/long_idle/I-13.png",
    "img/2_character_pepe/1_idle/long_idle/I-14.png",
    "img/2_character_pepe/1_idle/long_idle/I-15.png",
    "img/2_character_pepe/1_idle/long_idle/I-16.png",
    "img/2_character_pepe/1_idle/long_idle/I-17.png",
    "img/2_character_pepe/1_idle/long_idle/I-18.png",
    "img/2_character_pepe/1_idle/long_idle/I-19.png",
    "img/2_character_pepe/1_idle/long_idle/I-20.png",
  ];

  world;
  jumpPhase = "none";
  jumpUpFrameIndex = 0;
  jumpDownFrameIndex = 0;
  jumpUpImages = this.IMAGES_JUMPING.slice(0, 4);
  jumpDownImages = this.IMAGES_JUMPING.slice(4);
  isAirPhaseActive = false;
  airPhaseStartX = 0;
  maxAirDriftPx = 0;
  airDriftBufferPx = 500;


  /**
   * Creates a new Character instance.
   */
  constructor() {
    super().loadImage("img/2_character_pepe/2_walk/W-21.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_LONG_IDLE);
  }

  /**
   * Starts character animations using game state manager
   * @param {GameStateManager} gameStateManager - The game state manager instance
   */
  startAnimations(gameStateManager) {
    this.applyGravity();
    this.startMovementLoop(gameStateManager);
    this.startAnimationLoop(gameStateManager);
  }

  /**
   * Starts character movement and camera logic
   * @param {GameStateManager} gameStateManager - The game state manager instance
   */
  startMovementLoop(gameStateManager) {
    gameStateManager.registerInterval(() => {
      this.updateAirPhaseState();
      this.handleHorizontalMovement();
      this.handleJumpInput();
      this.updateWalkingSound();
      this.world.cameraX = -this.x + 100;
    }, 1000 / 60);
  }

  /**
   * Handles left and right movement input
   */
  handleHorizontalMovement() {
    this.handleMoveRight();
    this.handleMoveLeft();
  }

  /**
   * Moves character to the right when allowed
   */
  handleMoveRight() {
    if (!this.world.keyboard.right || this.x >= this.world.level.levelEndX) return;
    this.moveRight();
    this.clampAirDrift();
    this.otherDirection = false;
    this.markAudioActivity();
  }

  /**
   * Moves character to the left when allowed
   */
  handleMoveLeft() {
    if (!this.world.keyboard.left || this.x <= 0) return;
    this.moveLeft();
    this.clampAirDrift();
    this.otherDirection = true;
    this.markAudioActivity();
  }

  /**
   * Handles jump input and sound
   */
  handleJumpInput() {
    if (!this.world.keyboard.space || this.isAboveGround()) return;
    this.jump();
    this.startJumpCycle();
    this.startAirPhase();
    this.playJumpSound();
    this.markAudioActivity();
  }

  /**
   * Triggers rebound after stomping an enemy.
   */
  triggerStompRebound() {
    this.speedY = 6.5;
    this.startJumpCycle();
    this.startAirPhase();
  }

  /**
   * Updates walking sound state
   */
  updateWalkingSound() {
    const audioManager = window.audioManager;
    if (!audioManager) return;
    audioManager.setWalkActive(this.isMovingOnGround());
  }

  /**
   * Checks if character moves on the ground
   * @returns {boolean} True when walking
   */
  isMovingOnGround() {
    const isMoving = this.world.keyboard.right || this.world.keyboard.left;
    return isMoving && !this.isAboveGround() && !this.isDead();
  }

  /**
   * Starts character animation logic
   * @param {GameStateManager} gameStateManager - The game state manager instance
   */
  startAnimationLoop(gameStateManager) {
    gameStateManager.registerInterval(() => this.animateCharacter(), 50);
  }

  /**
   * Handles the full animation state machine
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
   * Plays dead animation when character is dead
   * @returns {boolean} True when handled
   */
  handleDeadAnimation() {
    if (!this.isDead()) return false;
    this.playAnimation(this.IMAGES_DEAD);
    this.updateIdleAudio(false);
    return true;
  }

  /**
   * Plays hurt animation when character is hurt
   * @returns {boolean} True when handled
   */
  handleHurtAnimation() {
    if (!this.isHurt()) return false;
    this.playAnimation(this.IMAGES_HURT);
    this.updateIdleAudio(false);
    return true;
  }

  /**
   * Plays jump animation while character is airborne
   * @returns {boolean} True when handled
   */
  handleJumpAnimation() {
    if (!this.isAboveGround()) {
      this.resetJumpCycle();
      return false;
    }
    if (this.jumpPhase === "none") this.startJumpCycle();
    this.setJumpPhaseByVelocity();
    if (this.jumpPhase === "up") this.playJumpUpFrame();
    if (this.jumpPhase === "down") this.playJumpDownFrame();
    this.updateIdleAudio(false);
    return true;
  }

  /**
   * Initializes jump animation state for a new jump cycle
   */
  startJumpCycle() {
    this.jumpPhase = "up";
    this.jumpUpFrameIndex = 0;
    this.jumpDownFrameIndex = 0;
  }

  /**
   * Sets jump phase based on current vertical velocity
   */
  setJumpPhaseByVelocity() {
    if (this.speedY > 0) {
      this.jumpPhase = "up";
      return;
    }
    this.jumpPhase = "down";
  }

  /**
   * Plays upward jump frames J-31 to J-34
   */
  playJumpUpFrame() {
    const maxIndex = this.jumpUpImages.length - 1;
    const frameIndex = Math.min(this.jumpUpFrameIndex, maxIndex);
    const path = this.jumpUpImages[frameIndex];
    this.img = this.imageCache[path];
    if (this.jumpUpFrameIndex < maxIndex) this.jumpUpFrameIndex++;
  }

  /**
   * Plays downward jump frames J-35 to J-39
   */
  playJumpDownFrame() {
    const maxIndex = this.jumpDownImages.length - 1;
    const frameIndex = Math.min(this.jumpDownFrameIndex, maxIndex);
    const path = this.jumpDownImages[frameIndex];
    this.img = this.imageCache[path];
    if (this.jumpDownFrameIndex < maxIndex) this.jumpDownFrameIndex++;
  }

  /**
   * Resets jump cycle after landing for the next jump
   */
  resetJumpCycle() {
    if (this.jumpPhase === "none") return;
    this.jumpPhase = "none";
    this.jumpUpFrameIndex = 0;
    this.jumpDownFrameIndex = 0;
  }

  /**
   * Keeps air-phase state in sync with ground contact.
   */
  updateAirPhaseState() {
    if (this.isAirborneForDriftControl()) return;
    this.endAirPhase();
  }

  /**
   * Checks if character is currently airborne for drift control.
   * @returns {boolean} True when drift clamp should stay active.
   */
  isAirborneForDriftControl() {
    if (this.isAboveGround()) return true;
    return this.speedY > 0;
  }

  /**
   * Starts a new air-phase and stores drift boundaries.
   */
  startAirPhase() {
    this.isAirPhaseActive = true;
    this.airPhaseStartX = this.x;
    this.maxAirDriftPx = this.width + this.airDriftBufferPx;
  }

  /**
   * Ends current air-phase and clears drift boundaries.
   */
  endAirPhase() {
    if (!this.isAirPhaseActive) return;
    this.isAirPhaseActive = false;
    this.airPhaseStartX = 0;
    this.maxAirDriftPx = 0;
  }

  /**
   * Clamps horizontal movement during an active air-phase.
   */
  clampAirDrift() {
    if (!this.isAirPhaseActive) return;
    const minX = this.airPhaseStartX - this.maxAirDriftPx;
    const maxX = this.airPhaseStartX + this.maxAirDriftPx;
    this.x = Math.max(minX, Math.min(this.x, maxX));
  }

  /**
   * Plays long idle animation when idle delay has elapsed
   * @returns {boolean} True when handled
   */
  handleLongIdleAnimation() {
    if (!this.isGroundIdleState()) return false;
    const audioManager = window.audioManager;
    if (!audioManager?.isLongIdleActive?.()) return false;
    this.playAnimation(this.IMAGES_LONG_IDLE);
    this.updateIdleAudio(true);
    return true;
  }

  /**
   * Plays normal idle animation while grounded and inactive
   * @returns {boolean} True when handled
   */
  handleIdleAnimation() {
    if (!this.isGroundIdleState()) return false;
    this.playAnimation(this.IMAGES_IDLE);
    this.updateIdleAudio(true);
    return true;
  }

  /**
   * Plays walking animation on ground movement
   */
  playGroundAnimation() {
    if (!this.world.keyboard.right && !this.world.keyboard.left) return;
    this.playAnimation(this.IMAGES_WALKING);
    this.updateIdleAudio(false);
  }

  /**
   * Checks if character is currently idle
   * @returns {boolean} True when idle
   */
  isIdleState() {
    return !this.world.keyboard.right && !this.world.keyboard.left;
  }

  /**
   * Checks whether character is grounded and idle
   * @returns {boolean} True when idle on ground
   */
  isGroundIdleState() {
    if (this.isAboveGround()) return false;
    return this.isIdleState();
  }

  /**
   * Updates idle audio state
   * @param {boolean} isIdle - True if character is idle
   */
  updateIdleAudio(isIdle) {
    const audioManager = window.audioManager;
    if (!audioManager) return;
    audioManager.setCharacterIdle(isIdle);
  }

  /**
   * Plays jump sound effect
   */
  playJumpSound() {
    if (!window.audioManager) return;
    window.audioManager.playJump();
  }

  /**
   * Marks one gameplay activity for audio manager
   */
  markAudioActivity() {
    if (!window.audioManager) return;
    window.audioManager.markActivity();
  }
}

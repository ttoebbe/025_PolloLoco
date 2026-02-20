class Character extends MovableObject {
  height = 250;
  y = 80;
  speed = 10;
  collisionOffsets = { left: 12, right: 12, top: 120 };
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

  world;
  //   currentImageIndex = 0;

  constructor() {
    super().loadImage("img/2_character_pepe/2_walk/W-21.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
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
      this.handleHorizontalMovement();
      this.handleJumpInput();
      this.updateWalkingSound();
      this.world.camera_x = -this.x + 100;
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
    if (!this.world.keyboard.RIGHT || this.x >= this.world.level.level_end_x) return;
    this.moveRight();
    this.otherDirection = false;
    this.markAudioActivity();
  }

  /**
   * Moves character to the left when allowed
   */
  handleMoveLeft() {
    if (!this.world.keyboard.LEFT || this.x <= 0) return;
    this.moveLeft();
    this.otherDirection = true;
    this.markAudioActivity();
  }

  /**
   * Handles jump input and sound
   */
  handleJumpInput() {
    if (!this.world.keyboard.SPACE || this.isAboveGround()) return;
    this.jump();
    this.playJumpSound();
    this.markAudioActivity();
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
    const isMoving = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
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
    this.playGroundAnimation();
    this.updateIdleAudio(this.isIdleState());
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
    if (!this.isAboveGround()) return false;
    this.playAnimation(this.IMAGES_JUMPING);
    this.updateIdleAudio(false);
    return true;
  }

  /**
   * Plays walking animation on ground movement
   */
  playGroundAnimation() {
    if (!this.world.keyboard.RIGHT && !this.world.keyboard.LEFT) return;
    this.playAnimation(this.IMAGES_WALKING);
  }

  /**
   * Checks if character is currently idle
   * @returns {boolean} True when idle
   */
  isIdleState() {
    return !this.world.keyboard.RIGHT && !this.world.keyboard.LEFT;
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

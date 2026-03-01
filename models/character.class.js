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
  movementController;
  animationController;

  /**
   * Creates a new Character instance.
   */
  constructor() {
    super().loadImage("img/2_character_pepe/2_walk/W-21.png");
    this.loadAllCharacterImages();
    this.initializeControllers();
  }

  /**
   * Starts character animations using game state manager.
   * @param {GameStateManager} gameStateManager - The game state manager.
   */
  startAnimations(gameStateManager) {
    this.applyGravity();
    this.startMovementLoop(gameStateManager);
    this.startAnimationLoop(gameStateManager);
  }

  /**
   * Starts character movement and camera logic.
   * @param {GameStateManager} gameStateManager - The game state manager.
   */
  startMovementLoop(gameStateManager) {
    this.movementController.startMovementLoop(gameStateManager);
  }

  /**
   * Starts character animation logic.
   * @param {GameStateManager} gameStateManager - The game state manager.
   */
  startAnimationLoop(gameStateManager) {
    this.animationController.startAnimationLoop(gameStateManager);
  }

  /**
   * Triggers rebound after stomping an enemy.
   */
  triggerStompRebound() {
    this.movementController.triggerStompRebound();
  }

  /**
   * Initializes jump animation state for a new jump cycle.
   */
  startJumpCycle() {
    this.animationController.startJumpCycle();
  }

  /**
   * Loads all character animation images.
   */
  loadAllCharacterImages() {
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_LONG_IDLE);
  }

  /**
   * Creates character helper controllers.
   */
  initializeControllers() {
    this.movementController = new CharacterMovementController(this);
    this.animationController = new CharacterAnimationController(this);
  }
}

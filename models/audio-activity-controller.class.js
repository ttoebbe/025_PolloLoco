/**
 * Controls activity-based audio behavior.
 */
export default class AudioActivityController {
  /**
   * Creates a new activity controller.
   * @param {AudioSoundRegistry} soundRegistry - Sound registry.
   * @param {Function} isMutedProvider - Returns current mute state.
   * @param {Function} playSound - Plays one sound by key.
   */
  constructor(soundRegistry, isMutedProvider, playSound) {
    this.soundRegistry = soundRegistry;
    this.isMutedProvider = isMutedProvider;
    this.playSound = playSound;
    this.initializeState();
    this.initializeDelays();
  }

  /**
   * Initializes runtime state values.
   */
  initializeState() {
    this.lastActivityTime = Date.now();
    this.isCharacterIdle = false;
    this.walkIntervalId = null;
    this.idleIntervalId = null;
  }

  /**
   * Initializes timing defaults.
   */
  initializeDelays() {
    this.walkLoopDelayMs = 140;
    this.idleDelayMs = 6000;
    this.idleCheckDelayMs = 250;
  }

  /**
   * Marks recent gameplay activity.
   */
  markActivity() {
    this.lastActivityTime = Date.now();
    this.isCharacterIdle = false;
    this.stopIdleSnore();
  }

  /**
   * Updates character idle state.
   * @param {boolean} isIdle - True if character is idle.
   */
  setCharacterIdle(isIdle) {
    this.isCharacterIdle = isIdle;
    if (isIdle) return;
    this.stopIdleSnore();
  }

  /**
   * Starts periodic idle checks.
   */
  startIdleMonitor() {
    if (this.idleIntervalId) return;
    this.idleIntervalId = setInterval(() => {
      this.handleIdleCheck();
    }, this.idleCheckDelayMs);
  }

  /**
   * Evaluates idle conditions for snore playback.
   */
  handleIdleCheck() {
    if (!this.isCharacterIdle || this.isMutedProvider()) return;
    if (!this.hasReachedIdleDelay()) return;
    this.playSound("idleSnore", this.idleDelayMs);
  }

  /**
   * Checks whether idle delay has elapsed.
   * @returns {boolean} True when idle delay elapsed.
   */
  hasReachedIdleDelay() {
    return Date.now() - this.lastActivityTime >= this.idleDelayMs;
  }

  /**
   * Returns whether character is currently in long-idle state.
   * @returns {boolean} True when idle delay elapsed while character is idle.
   */
  isLongIdleActive() {
    return this.isCharacterIdle && this.hasReachedIdleDelay();
  }

  /**
   * Enables or disables walking loop sound.
   * @param {boolean} isActive - True while character is moving.
   */
  setWalkActive(isActive) {
    if (!isActive) return this.stopWalkLoop();
    if (this.walkIntervalId) return;
    this.playWalkStep();
    this.walkIntervalId = setInterval(() => this.playWalkStep(), this.walkLoopDelayMs);
  }

  /**
   * Plays one walking step sound.
   */
  playWalkStep() {
    this.playSound("walk");
  }

  /**
   * Stops walking loop and resets step sound.
   */
  stopWalkLoop() {
    if (!this.walkIntervalId) return;
    clearInterval(this.walkIntervalId);
    this.walkIntervalId = null;
    this.soundRegistry.stopAndReset("walk");
  }

  /**
   * Stops and resets idle snore sound.
   */
  stopIdleSnore() {
    this.soundRegistry.stopAndReset("idleSnore");
  }

  /**
   * Stops all activity loops and resets local state.
   */
  hardStopAll() {
    this.stopWalkLoop();
    this.stopIdleSnore();
    this.isCharacterIdle = false;
    this.lastActivityTime = Date.now();
  }
}

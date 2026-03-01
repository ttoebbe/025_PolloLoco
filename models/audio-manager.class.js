/**
 * @typedef {import("./audio-sound-registry.class.js").default} AudioSoundRegistryType
 * @typedef {import("./audio-activity-controller.class.js").default} AudioActivityControllerType
 */
import AudioSoundRegistry from "./audio-sound-registry.class.js";
import AudioActivityController from "./audio-activity-controller.class.js";

/**
 * Central audio control for music and sound effects.
 */
const AUDIO_MUTE_STORAGE_KEY = "pollo-loco-audio-muted";

/**
 * Represents the audio manager.
 */
export default class AudioManager {
  /**
   * Creates a new audio manager instance.
   */
  constructor() {
    this.initializeState();
    this.restoreMutedState();
    this.setupControllers();
    this.applyMutedState();
    this.setupAutoplayFallback();
    this.activityController.startIdleMonitor();
  }

  /**
   * Initializes runtime state values.
   */
  initializeState() {
    this.isMuted = false;
    this.backgroundMusicStarted = false;
    this.autoplayUnlockHandler = null;
    /** @type {AudioSoundRegistryType | null} */
    this.soundRegistry = null;
    /** @type {AudioActivityControllerType | null} */
    this.activityController = null;
  }

  /**
   * Creates helper instances.
   */
  setupControllers() {
    this.soundRegistry = new AudioSoundRegistry();
    this.activityController = new AudioActivityController(
      this.soundRegistry,
      () => this.isMuted,
      (name, cooldownMs = 0) => this.playSound(name, cooldownMs),
    );
  }

  /**
   * Restores muted state from browser storage.
   */
  restoreMutedState() {
    const storedState = this.readMutedStateFromStorage();
    if (storedState === null) return;
    this.isMuted = storedState;
  }

  /**
   * Reads muted state value from storage.
   * @returns {boolean | null} Stored muted state or null.
   */
  readMutedStateFromStorage() {
    try {
      const value = window.localStorage.getItem(AUDIO_MUTE_STORAGE_KEY);
      if (value === "true") return true;
      if (value === "false") return false;
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Plays jump effect.
   */
  playJump() {
    this.playSound("jump");
  }

  /**
   * Plays throw effect.
   */
  playThrow() {
    this.playSound("throw", 500);
  }

  /**
   * Plays bottle break effect.
   */
  playBottleBreak() {
    this.playSound("bottleBreak");
  }

  /**
   * Plays coin collect effect.
   */
  playCoinCollect() {
    this.playSound("coinCollect");
  }

  /**
   * Plays bottle collect effect.
   */
  playBottleCollect() {
    this.playSound("bottleCollect");
  }

  /**
   * Plays character hurt effect.
   */
  playCharacterHurt() {
    this.playSound("characterHurt", 200);
  }

  /**
   * Plays character dead effect.
   */
  playCharacterDead() {
    this.playSound("characterDead");
  }

  /**
   * Plays chicken dead effect.
   */
  playChickenDead() {
    this.playSound("chickenDead");
  }

  /**
   * Plays endboss hurt effect.
   */
  playEndbossHurt() {
    this.playSound("endbossHurt", 200);
  }

  /**
   * Plays endboss dead effect.
   */
  playEndbossDead() {
    this.playSound("endbossDead");
  }

  /**
   * Starts background music if possible.
   */
  startBackgroundMusic() {
    const music = this.soundRegistry.getSound("backgroundMusic");
    if (!music || this.isMuted) return;
    if (this.backgroundMusicStarted && !music.paused) return;
    this.backgroundMusicStarted = true;
    this.soundRegistry.tryPlay(music);
  }

  /**
   * Toggles the global mute state.
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.applyMutedState();
    this.persistMutedState();
    this.dispatchMuteChanged();
    if (!this.isMuted) this.startBackgroundMusic();
  }

  /**
   * Persists current muted state in browser storage.
   */
  persistMutedState() {
    try {
      window.localStorage.setItem(AUDIO_MUTE_STORAGE_KEY, `${this.isMuted}`);
    } catch {}
  }

  /**
   * Applies the current mute state to all sounds.
   */
  applyMutedState() {
    this.soundRegistry.applyMutedState(this.isMuted);
  }

  /**
   * Emits mute change event for UI sync.
   */
  dispatchMuteChanged() {
    const event = new CustomEvent("audioMuteChanged", {
      detail: { isMuted: this.isMuted },
    });
    document.dispatchEvent(event);
  }

  /**
   * Starts autoplay fallback listeners.
   */
  setupAutoplayFallback() {
    this.autoplayUnlockHandler = () => this.unlockAutoplay();
    window.addEventListener("pointerdown", this.autoplayUnlockHandler);
    window.addEventListener("keydown", this.autoplayUnlockHandler);
  }

  /**
   * Handles first user interaction to unlock music.
   */
  unlockAutoplay() {
    this.markActivity();
    this.startBackgroundMusic();
    this.removeAutoplayFallback();
  }

  /**
   * Removes autoplay fallback listeners.
   */
  removeAutoplayFallback() {
    if (!this.autoplayUnlockHandler) return;
    window.removeEventListener("pointerdown", this.autoplayUnlockHandler);
    window.removeEventListener("keydown", this.autoplayUnlockHandler);
    this.autoplayUnlockHandler = null;
  }

  /**
   * Plays one sound with optional cooldown.
   * @param {string} name - Sound key.
   * @param {number} cooldownMs - Cooldown in milliseconds.
   */
  playSound(name, cooldownMs = 0) {
    this.soundRegistry.playSound(name, this.isMuted, cooldownMs);
  }

  /**
   * Marks recent gameplay activity.
   */
  markActivity() {
    this.activityController.markActivity();
  }

  /**
   * Updates character idle state.
   * @param {boolean} isIdle - True if character is idle.
   */
  setCharacterIdle(isIdle) {
    this.activityController.setCharacterIdle(isIdle);
  }

  /**
   * Returns whether character is currently in long-idle state.
   * @returns {boolean} True when idle delay elapsed while character is idle.
   */
  isLongIdleActive() {
    return this.activityController.isLongIdleActive();
  }

  /**
   * Enables or disables walking loop sound.
   * @param {boolean} isActive - True while character is moving.
   */
  setWalkActive(isActive) {
    this.activityController.setWalkActive(isActive);
  }

  /**
   * Stops and resets all sounds and timers.
   */
  hardStopAll() {
    this.activityController.hardStopAll();
    this.soundRegistry.stopAllSounds();
    this.soundRegistry.resetPlayTimes();
    this.backgroundMusicStarted = false;
  }
}

window.AudioManager = AudioManager;

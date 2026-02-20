/**
 * Central audio control for music and sound effects.
 */
class AudioManager {
  /**
   * Creates a new audio manager instance.
   */
  constructor() {
    this.isMuted = false;
    this.lastPlayTimes = {};
    this.lastActivityTime = Date.now();
    this.isCharacterIdle = false;
    this.walkIntervalId = null;
    this.idleIntervalId = null;
    this.backgroundMusicStarted = false;
    this.walkLoopDelayMs = 140;
    this.idleDelayMs = 5000;
    this.idleCheckDelayMs = 250;
    this.sounds = {};
    this.registerAllSounds();
    this.applyMutedState();
    this.setupAutoplayFallback();
    this.startIdleMonitor();
  }

  /**
   * Registers all required game sounds.
   */
  registerAllSounds() {
    this.registerBackgroundSounds();
    this.registerCharacterSounds();
    this.registerItemSounds();
    this.registerEnemySounds();
  }

  /**
   * Registers background sounds.
   */
  registerBackgroundSounds() {
    this.addSound("backgroundMusic", "audio/backgroundsound.mp3", {
      loop: true,
      volume: 0.5,
    });
  }

  /**
   * Registers character related sounds.
   */
  registerCharacterSounds() {
    this.addSound("walk", "audio/walking1.mp3");
    this.addSound("jump", "audio/jump.wav");
    this.addSound("characterHurt", "audio/characterhurt.wav");
    this.addSound("characterDead", "audio/characterdead.wav");
    this.addSound("idleSnore", "audio/snore.wav");
  }

  /**
   * Registers item related sounds.
   */
  registerItemSounds() {
    this.addSound("throw", "audio/throw.wav");
    this.addSound("bottleBreak", "audio/bottleBreaksShort.wav");
    this.addSound("coinCollect", "audio/coinCollect.wav");
    this.addSound("bottleCollect", "audio/bottleCollect.ogg");
  }

  /**
   * Registers enemy related sounds.
   */
  registerEnemySounds() {
    this.addSound("chickenDead", "audio/chickenhurt.wav");
    this.addSound("endbossHurt", "audio/endbosshurt.wav");
    this.addSound("endbossDead", "audio/endbossdead.wav");
  }

  /**
   * Adds one sound to the sound map.
   * @param {string} name - Sound key.
   * @param {string} path - Audio file path.
   * @param {{loop?: boolean, volume?: number}} options - Audio options.
   */
  addSound(name, path, options = {}) {
    const audio = new Audio(path);
    audio.loop = options.loop || false;
    audio.volume = options.volume ?? 1;
    audio.preload = "auto";
    this.sounds[name] = audio;
  }

  /**
   * Starts background music if possible.
   */
  startBackgroundMusic() {
    const music = this.sounds.backgroundMusic;
    if (!music || this.isMuted) return;
    if (this.backgroundMusicStarted && !music.paused) return;
    this.backgroundMusicStarted = true;
    this.tryPlay(music);
  }

  /**
   * Toggles the global mute state.
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.applyMutedState();
    this.dispatchMuteChanged();
    if (!this.isMuted) this.startBackgroundMusic();
  }

  /**
   * Applies the current mute state to all sounds.
   */
  applyMutedState() {
    Object.values(this.sounds).forEach((sound) => {
      sound.muted = this.isMuted;
    });
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
    const sound = this.sounds[name];
    if (!sound || this.isMuted) return;
    if (this.isOnCooldown(name, cooldownMs)) return;
    this.lastPlayTimes[name] = Date.now();
    this.restartAndPlay(sound);
  }

  /**
   * Checks if a sound is on cooldown.
   * @param {string} name - Sound key.
   * @param {number} cooldownMs - Cooldown in milliseconds.
   * @returns {boolean} True when cooldown is active.
   */
  isOnCooldown(name, cooldownMs) {
    if (cooldownMs <= 0) return false;
    const lastTime = this.lastPlayTimes[name] || 0;
    return Date.now() - lastTime < cooldownMs;
  }

  /**
   * Tries to play one audio instance.
   * @param {HTMLAudioElement} sound - Target audio.
   */
  tryPlay(sound) {
    const playPromise = sound.play();
    if (!playPromise || typeof playPromise.catch !== "function") return;
    playPromise.catch(() => {});
  }

  /**
   * Restarts and plays one sound.
   * @param {HTMLAudioElement} sound - Target audio.
   */
  restartAndPlay(sound) {
    sound.pause();
    sound.currentTime = 0;
    this.tryPlay(sound);
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
    this.idleIntervalId = setInterval(() => {
      this.handleIdleCheck();
    }, this.idleCheckDelayMs);
  }

  /**
   * Evaluates idle conditions for snore playback.
   */
  handleIdleCheck() {
    if (!this.isCharacterIdle || this.isMuted) return;
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
   * Enables or disables walking loop sound.
   * @param {boolean} isActive - True while character is moving.
   */
  setWalkActive(isActive) {
    if (!isActive) {
      this.stopWalkLoop();
      return;
    }
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
    this.stopAndReset("walk");
  }

  /**
   * Stops and resets idle snore sound.
   */
  stopIdleSnore() {
    this.stopAndReset("idleSnore");
  }

  /**
   * Stops and resets one sound by key.
   * @param {string} name - Sound key.
   */
  stopAndReset(name) {
    const sound = this.sounds[name];
    if (!sound) return;
    sound.pause();
    sound.currentTime = 0;
  }

  /**
   * Stops and resets all sounds and timers.
   */
  hardStopAll() {
    this.stopWalkLoop();
    this.stopIdleSnore();
    Object.keys(this.sounds).forEach((name) => this.stopAndReset(name));
    this.lastPlayTimes = {};
    this.backgroundMusicStarted = false;
    this.isCharacterIdle = false;
    this.lastActivityTime = Date.now();
  }

  /**
   * Plays jump sound.
   */
  playJump() {
    this.playSound("jump");
  }

  /**
   * Plays throw sound with cooldown.
   */
  playThrow() {
    this.playSound("throw", 500);
  }

  /**
   * Plays bottle break sound.
   */
  playBottleBreak() {
    this.playSound("bottleBreak");
  }

  /**
   * Plays coin collect sound.
   */
  playCoinCollect() {
    this.playSound("coinCollect");
  }

  /**
   * Plays bottle collect sound.
   */
  playBottleCollect() {
    this.playSound("bottleCollect");
  }

  /**
   * Plays character hurt sound with cooldown.
   */
  playCharacterHurt() {
    this.playSound("characterHurt", 200);
  }

  /**
   * Plays character dead sound.
   */
  playCharacterDead() {
    this.playSound("characterDead");
  }

  /**
   * Plays chicken dead sound.
   */
  playChickenDead() {
    this.playSound("chickenDead");
  }

  /**
   * Plays endboss hurt sound with cooldown.
   */
  playEndbossHurt() {
    this.playSound("endbossHurt", 200);
  }

  /**
   * Plays endboss dead sound.
   */
  playEndbossDead() {
    this.playSound("endbossDead");
  }
}

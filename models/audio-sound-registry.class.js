/**
 * Stores and controls all audio elements.
 */
export default class AudioSoundRegistry {
  /**
   * Creates a new sound registry.
   */
  constructor() {
    this.sounds = {};
    this.lastPlayTimes = {};
    this.registerAllSounds();
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
   * Registers character sounds.
   */
  registerCharacterSounds() {
    this.addSound("walk", "audio/walking1.mp3");
    this.addSound("jump", "audio/jump.wav");
    this.addSound("characterHurt", "audio/characterhurt.wav");
    this.addSound("characterDead", "audio/characterdead.wav");
    this.addSound("idleSnore", "audio/snore.wav");
  }

  /**
   * Registers item sounds.
   */
  registerItemSounds() {
    this.addSound("throw", "audio/throw.wav");
    this.addSound("bottleBreak", "audio/bottleBreaksShort.wav");
    this.addSound("coinCollect", "audio/coinCollect.wav");
    this.addSound("bottleCollect", "audio/bottleCollect.ogg");
  }

  /**
   * Registers enemy sounds.
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
   * Returns one sound by key.
   * @param {string} name - Sound key.
   * @returns {HTMLAudioElement|null} Audio element or null.
   */
  getSound(name) {
    return this.sounds[name] || null;
  }

  /**
   * Plays one sound with optional cooldown.
   * @param {string} name - Sound key.
   * @param {boolean} isMuted - Global mute flag.
   * @param {number} cooldownMs - Cooldown in milliseconds.
   */
  playSound(name, isMuted, cooldownMs = 0) {
    const sound = this.getSound(name);
    if (!sound || isMuted) return;
    const now = Date.now();
    if (this.isOnCooldown(name, cooldownMs, now)) return;
    this.lastPlayTimes[name] = now;
    this.restartAndPlay(sound);
  }

  /**
   * Checks if a sound is on cooldown.
   * @param {string} name - Sound key.
   * @param {number} cooldownMs - Cooldown in milliseconds.
   * @param {number} now - Current timestamp.
   * @returns {boolean} True when cooldown is active.
   */
  isOnCooldown(name, cooldownMs, now) {
    if (cooldownMs <= 0) return false;
    const lastTime = this.lastPlayTimes[name] || 0;
    return now - lastTime < cooldownMs;
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
   * Applies one mute state to all sounds.
   * @param {boolean} isMuted - Global mute flag.
   */
  applyMutedState(isMuted) {
    Object.values(this.sounds).forEach((sound) => {
      sound.muted = isMuted;
    });
  }

  /**
   * Stops and resets one sound by key.
   * @param {string} name - Sound key.
   */
  stopAndReset(name) {
    const sound = this.getSound(name);
    if (!sound) return;
    sound.pause();
    sound.currentTime = 0;
  }

  /**
   * Stops and resets all sounds.
   */
  stopAllSounds() {
    Object.keys(this.sounds).forEach((name) => this.stopAndReset(name));
  }

  /**
   * Clears all recorded play timestamps.
   */
  resetPlayTimes() {
    this.lastPlayTimes = {};
  }
}

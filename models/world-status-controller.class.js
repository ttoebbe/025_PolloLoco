/**
 * Handles world status bars and endboss proximity state.
 */
class WorldStatusController {
  /**
   * Creates a new world status controller.
   * @param {World} world - Owning world instance.
   */
  constructor(world) {
    this.world = world;
  }

  /**
   * Checks if endboss is nearby and updates proximity flag.
   */
  checkEndbossProximity() {
    const previousState = this.world.endbossNearby;
    const endboss = this.world.level.enemies.find((enemy) => enemy instanceof Endboss);
    this.world.endbossNearby = !!(endboss && endboss.chaseActivated);
    if (this.world.endbossNearby && !previousState) this.updateEndbossBar();
  }

  /**
   * Updates endboss status bar percentage.
   */
  updateEndbossBar() {
    const endboss = this.world.level.enemies.find((enemy) => enemy instanceof Endboss);
    if (!endboss) return;
    const percentage = (endboss.energy / endboss.maxEnergy) * 100;
    this.world.endbossBar.setPercentage(percentage);
    this.world.endbossBar.setStock(endboss.energy, endboss.maxEnergy);
  }

  /**
   * Updates character health status bar.
   */
  updateHealthBar() {
    this.world.statusBar.setPercentage(this.world.character.energy);
    this.world.statusBar.setStock(this.world.character.energy, 100);
  }

  /**
   * Updates coin bar.
   */
  updateCoinBar() {
    if (this.world.totalCoins === 0) return this.setCoinBarEmpty();
    const percentage = (this.world.collectedCoins / this.world.totalCoins) * 100;
    this.world.coinBar.setPercentage(percentage);
    this.world.coinBar.setStock(this.world.collectedCoins, this.world.totalCoins);
  }

  /**
   * Updates bottle bar.
   */
  updateBottleBar() {
    if (this.world.maxBottles === 0) return this.setBottleBarEmpty();
    const percentage = (this.world.collectedBottles / this.world.maxBottles) * 100;
    this.world.bottleBar.setPercentage(percentage);
    this.world.bottleBar.setStock(this.world.collectedBottles, this.world.maxBottles);
  }

  /**
   * Sets coin bar to empty state.
   */
  setCoinBarEmpty() {
    this.world.coinBar.setPercentage(0);
    this.world.coinBar.setStock(0, 0);
  }

  /**
   * Sets bottle bar to empty state.
   */
  setBottleBarEmpty() {
    this.world.bottleBar.setPercentage(0);
    this.world.bottleBar.setStock(0, 0);
  }
}

window.WorldStatusController = WorldStatusController;

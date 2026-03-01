/**
 * Represents the level.
 */
class Level {
  enemies;
  clouds;
  backgroundObjects;
  coins;
  bottles;
  levelEndX = 720 * 3.5;

  /**
   * Creates a new Level instance.
   * @param {*} enemies - Value for enemies.
   * @param {*} clouds - Value for clouds.
   * @param {*} backgroundObjects - Value for background Objects.
   * @param {*} coins - Value for coins.
   * @param {*} bottles - Value for bottles.
   */
  constructor(enemies, clouds, backgroundObjects, coins = [], bottles = []) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgroundObjects = backgroundObjects;
    this.coins = coins;
    this.bottles = bottles;
  }
}

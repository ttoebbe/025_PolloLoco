const COIN_POSITIONS = [
  [300, 260],
  [460, 220],
  [620, 260],
  [780, 180],
  [940, 260],
  [1100, 220],
  [1260, 260],
  [1420, 180],
  [1580, 260],
  [1740, 220],
  [1900, 260],
  [2060, 180],
];

const BOTTLE_POSITIONS = [
  [360, 350],
  [520, 330],
  [700, 350],
  [920, 330],
  [360, 80],
  [520, 180],
  [700, 280],
  [920, 180],
  [1080, 350],
  [1300, 330],
  [1500, 350],
  [1720, 330],
  [1940, 350],
  [2160, 330],
];

const BACKGROUND_SEGMENTS = [
  [-719, "2"],
  [0, "1"],
  [719, "2"],
  [719 * 2, "1"],
  [719 * 3, "2"],
  [719 * 4, "1"],
];

const level1 = createLevel1();

/**
 * Creates a new level1 instance with fresh objects.
 * @returns {Level} New level instance.
 */
function createLevel1() {
  return new Level(
    createLevelEnemies(),
    createLevelClouds(),
    createBackgroundObjects(),
    createLevelCoins(),
    createLevelBottles(),
  );
}

function createLevelEnemies() {
  return [
    new Chicken(),
    new Chicken(),
    new Chicken(),
    new Chicken(),
    new Chicken(),
    new Chicken(),
    new Endboss(),
  ];
}

function createLevelClouds() {
  return [new Cloud()];
}

function createBackgroundObjects() {
  return BACKGROUND_SEGMENTS.flatMap(([x, variant]) => createBackgroundSegment(x, variant));
}

function createBackgroundSegment(x, variant) {
  return [
    new BackgroundObject("img/5_background/layers/air.png", x),
    new BackgroundObject(`img/5_background/layers/3_third_layer/${variant}.png`, x),
    new BackgroundObject(`img/5_background/layers/2_second_layer/${variant}.png`, x),
    new BackgroundObject(`img/5_background/layers/1_first_layer/${variant}.png`, x),
  ];
}

function createLevelCoins() {
  return COIN_POSITIONS.map(([x, y]) => new Coin(x, y));
}

function createLevelBottles() {
  return BOTTLE_POSITIONS.map(([x, y]) => new Bottle(x, y));
}

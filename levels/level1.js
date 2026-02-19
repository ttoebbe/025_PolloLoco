const level1 = createLevel1();


const level1Coins = [
  new Coin(300, 260),
  new Coin(460, 220),
  new Coin(620, 260),
  new Coin(780, 180),
  new Coin(940, 260),
  new Coin(1100, 220),
  new Coin(1260, 260),
  new Coin(1420, 180),
  new Coin(1580, 260),
  new Coin(1740, 220),
  new Coin(1900, 260),
  new Coin(2060, 180),
];

const level1Bottles = [
  new Bottle(360, 350),
  new Bottle(520, 330),
  new Bottle(700, 350),
  new Bottle(920, 330),
  new Bottle(1080, 350),
  new Bottle(1300, 330),
  new Bottle(1500, 350),
  new Bottle(1720, 330),
  new Bottle(1940, 350),
  new Bottle(2160, 330),
];

/**
 * Creates a new level1 instance with fresh objects
 * @returns {Level} New level instance
 */
/**
 * Creates a new level1 instance with fresh objects
 * @returns {Level} New level instance
 */
function createLevel1() {
  return new Level(
    [
      new Chicken(),
      new Chicken(),
      new Chicken(),
      new Chicken(),
      new Chicken(),
      new Chicken(),
      new Endboss(),
    ],
    [new Cloud()],
    [
      new BackgroundObject("img/5_background/layers/air.png", -719),
      new BackgroundObject("img/5_background/layers/3_third_layer/2.png", -719),
      new BackgroundObject(
        "img/5_background/layers/2_second_layer/2.png",
        -719,
      ),
      new BackgroundObject("img/5_background/layers/1_first_layer/2.png", -719),

      new BackgroundObject("img/5_background/layers/air.png", 0),
      new BackgroundObject("img/5_background/layers/3_third_layer/1.png", 0),
      new BackgroundObject("img/5_background/layers/2_second_layer/1.png", 0),
      new BackgroundObject("img/5_background/layers/1_first_layer/1.png", 0),

      new BackgroundObject("img/5_background/layers/air.png", 719),
      new BackgroundObject("img/5_background/layers/3_third_layer/2.png", 719),
      new BackgroundObject("img/5_background/layers/2_second_layer/2.png", 719),
      new BackgroundObject("img/5_background/layers/1_first_layer/2.png", 719),

      new BackgroundObject("img/5_background/layers/air.png", 719 * 2),
      new BackgroundObject(
        "img/5_background/layers/3_third_layer/1.png",
        719 * 2,
      ),
      new BackgroundObject(
        "img/5_background/layers/2_second_layer/1.png",
        719 * 2,
      ),
      new BackgroundObject(
        "img/5_background/layers/1_first_layer/1.png",
        719 * 2,
      ),

      new BackgroundObject("img/5_background/layers/air.png", 719 * 3),
      new BackgroundObject(
        "img/5_background/layers/3_third_layer/2.png",
        719 * 3,
      ),
      new BackgroundObject(
        "img/5_background/layers/2_second_layer/2.png",
        719 * 3,
      ),
      new BackgroundObject(
        "img/5_background/layers/1_first_layer/2.png",
        719 * 3,
      ),
      new BackgroundObject("img/5_background/layers/air.png", 719 * 4),
      new BackgroundObject(
        "img/5_background/layers/3_third_layer/1.png",
        719 * 4,
      ),
      new BackgroundObject(
        "img/5_background/layers/2_second_layer/1.png",
        719 * 4,
      ),
      new BackgroundObject(
        "img/5_background/layers/1_first_layer/1.png",
        719 * 4,
      ),
    ],
    [
      new Coin(300, 260),
      new Coin(460, 220),
      new Coin(620, 260),
      new Coin(780, 180),
      new Coin(940, 260),
      new Coin(1100, 220),
      new Coin(1260, 260),
      new Coin(1420, 180),
      new Coin(1580, 260),
      new Coin(1740, 220),
      new Coin(1900, 260),
      new Coin(2060, 180),
    ],
    [
      new Bottle(360, 350),
      new Bottle(520, 330),
      new Bottle(700, 350),
      new Bottle(920, 330),
      new Bottle(360, 80),
      new Bottle(520, 180),
      new Bottle(700, 280),
      new Bottle(920, 180),
      new Bottle(1080, 350),
      new Bottle(1300, 330),
      new Bottle(1500, 350),
      new Bottle(1720, 330),
      new Bottle(1940, 350),
      new Bottle(2160, 330),
    ],
  );
}


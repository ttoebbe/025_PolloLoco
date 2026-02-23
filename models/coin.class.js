class Coin extends DrawableObject {
  width = 100;
  height = 100;
  collisionOffsets = { left: 32, right: 32, top: 32, bottom: 32 };

  constructor(x, y) {
    super().loadImage("img/8_coin/coin_1.png");
    this.x = x;
    this.y = y;
  }
}

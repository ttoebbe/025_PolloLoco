class Bottle extends DrawableObject {
  width = 80;
  height = 90;
  collisionOffsets = { left: 32, right: 32, top: 14, bottom: 12 };

  constructor(x, y) {
    super().loadImage("img/6_salsa_bottle/salsa_bottle.png");
    this.x = x;
    this.y = y;
  }
}

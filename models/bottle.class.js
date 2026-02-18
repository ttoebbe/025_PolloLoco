class Bottle extends DrawableObject {
  width = 80;
  height = 90;
  collisionOffsets = { left: 24, right: 16, top: 14 };

  constructor(x, y) {
    super().loadImage("img/6_salsa_bottle/salsa_bottle.png");
    this.x = x;
    this.y = y;
  }
}

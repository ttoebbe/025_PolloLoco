class ThrowableObject extends MovableObject {
  constructor() {
    super().loadImage(
      "img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
    );
    this.x = 120;
    this.y = 100;
    this.width = 50;
    this.height = 50;
    this.throw(100, 150);
  }

  throw(x, y) {
    this.x = x;
    this.y = y;
    this.speedY = 10;
    this.speed = 15;
    this.applyGravity();
    setInterval(() => {
      this.x += this.speed;
    }, 25);
  }
}

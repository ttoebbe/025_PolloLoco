class ThrowableObject extends MovableObject {
  constructor(x, y) {
    super().loadImage(
      "img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
    );
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.throw(x, y);
  }

  throw() {
    this.speedY = 10;
    this.speed = 15;
    this.applyGravity();
    setInterval(() => {
      this.x += this.speed;
    }, 25);
  }
}

class MovableObject extends DrawableObject {
  speed = 0.1;
  otherDirection = false;
  speedY = 0;
  acceleration = 0.5;
  energy = 100;
  lastHit = 0;

  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }
    }, 1000 / 25);
  }

  isAboveGround() {
    return this.y < 180;
  }



  drawFrame(ctx) {
    if (this instanceof Character || this instanceof Chicken) {
      ctx.beginPath();
      ctx.lineWidth = "5";
      ctx.strokeStyle = "blue";
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.stroke();
    }
  }

  isColliding(movableObject) {
    return (
      this.x + this.width > movableObject.x &&
      this.y + this.height > movableObject.y &&
      this.x < movableObject.x + movableObject.width &&
      this.y < movableObject.y + movableObject.height
    );
  }

  hit() {
    this.energy -= 5;
    this.lastHit = new Date().getTime();
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
    }
  }

  isHurt() {
    let timepassed = new Date().getTime() - this.lastHit;
    timepassed = timepassed / 1000; // in seconds
    return timepassed < 1;
  }

  isDead() {
    return this.energy == 0;
  }


  playAnimation(images) {
    let i = this.currentImageIndex % images.length; // 0, 1, 2, 3, 4, 5 (Modulo-Operator)
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImageIndex++;
  }

  moveRight(pixels) {
    this.x += this.speed;
    // this.otherDirection = false;
  }

  moveLeft() {
    this.x -= this.speed;
    // this.otherDirection = true;
  }

  jump() {
    this.speedY = 8;
    this.world.keyboard.SPACE = false; // Reset after jump
  }
}

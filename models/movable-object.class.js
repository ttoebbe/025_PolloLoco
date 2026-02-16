class MovableObject {
  x = 120;
  y = 280;
  img;
  height = 150;
  width = 100;
  imageCache = {};
  speed = 0.15;
  currentImageIndex = 0;
  otherDirection = false;
  speedY = 0;
  acceleration = 0.5;
  energy = 100;

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

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
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
    if (this.energy < 0) {
      this.energy = 0;
      console.log("Character is dead!");
    }
  }

  isDead() {
    return this.energy == 0;
  }

  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  playAnimation(images) {
    let i = this.currentImageIndex % this.IMAGES_WALKING.length; // 0, 1, 2, 3, 4, 5 (Modulo-Operator)
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
    this.speedY = 10;
    this.world.keyboard.SPACE = false; // Reset after jump
  }
}

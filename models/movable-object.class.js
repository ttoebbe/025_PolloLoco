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

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
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
    console.log("Moving right");
  }

  moveLeft() {}
}

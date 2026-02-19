class DrawableObject {
  x = 120;
  y = 280;
  img;
  height = 150;
  width = 100;
  imageCache = {};
  currentImageIndex = 0;
  collisionOffsets = { left: 0, right: 0, top: 0 };


  
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }


  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  getCollisionBounds() {
    const leftOffset = Math.max(0, this.collisionOffsets?.left ?? 0);
    const rightOffset = Math.max(0, this.collisionOffsets?.right ?? 0);
    const topOffset = Math.max(0, this.collisionOffsets?.top ?? 0);

    const left = this.x + leftOffset;
    const right = this.x + this.width - rightOffset;
    const top = this.y + topOffset;
    const bottom = this.y + this.height;
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);

    return { left, right, top, bottom, width, height };
  }

  
  // drawFrame(ctx) {
  //   if (this instanceof Character || this instanceof Chicken) {
  //     ctx.beginPath();
  //     ctx.lineWidth = "5";
  //     ctx.strokeStyle = "blue";
  //     ctx.rect(this.x, this.y, this.width, this.height);
  //     ctx.stroke();
  //   }
  // }
  
  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }


}

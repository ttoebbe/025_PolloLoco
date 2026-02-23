class DrawableObject {
  x = 120;
  y = 280;
  img;
  height = 150;
  width = 100;
  imageCache = {};
  currentImageIndex = 0;
  collisionOffsets = { left: 0, right: 0, top: 0, bottom: 0 };

  /**
   * Loads a single image from the given path
   * @param {string} path - Path to the image file
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * Draws the object on the canvas context
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   */
  draw(context) {
    context.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  /**
   * Gets collision bounds considering offsets
   * @returns {Object} Collision bounds with left, right, top, bottom, width, height
   */
  getCollisionBounds() {
    const leftOffset = Math.max(0, this.collisionOffsets?.left ?? 0);
    const rightOffset = Math.max(0, this.collisionOffsets?.right ?? 0);
    const topOffset = Math.max(0, this.collisionOffsets?.top ?? 0);
    const bottomOffset = Math.max(0, this.collisionOffsets?.bottom ?? 0);

    const left = this.x + leftOffset;
    const right = this.x + this.width - rightOffset;
    const top = this.y + topOffset;
    const bottom = this.y + this.height - bottomOffset;
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);

    return { left, right, top, bottom, width, height };
  }

  /**
   * Loads multiple images into cache
   * @param {Array<string>} imageArray - Array of image paths to load
   */
  loadImages(imageArray) {
    imageArray.forEach((path) => {
      let image = new Image();
      image.src = path;
      this.imageCache[path] = image;
    });
  }
}

/**
 * Represents the background object.
 */
class BackgroundObject extends MovableObject {

    width = 720;
    height = 480;


/**
 * Creates a new BackgroundObject instance.
 * @param {*} imagePath - Value for image Path.
 * @param {number} x - Horizontal position.
 * @param {number} y - Vertical position.
 */
constructor(imagePath, x, y) {
    super().loadImage(imagePath);
    this.x = x;
    this.y = 480 - this.height;
}
}

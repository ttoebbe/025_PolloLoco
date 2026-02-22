/**
 * Represents the Endboss status bar that appears when the Endboss is near
 * Shows health with 6 different states from 0% to 100%
 */
class EndbossStatusBar extends DrawableObject {
  IMAGES = [
    "img/7_statusbars/2_statusbar_endboss/blue/blue0.png",
    "img/7_statusbars/2_statusbar_endboss/blue/blue20.png",
    "img/7_statusbars/2_statusbar_endboss/blue/blue40.png",
    "img/7_statusbars/2_statusbar_endboss/blue/blue60.png",
    "img/7_statusbars/2_statusbar_endboss/blue/blue80.png",
    "img/7_statusbars/2_statusbar_endboss/blue/blue100.png",
  ];

  percentage = 100;

  /**
   * Creates Endboss status bar positioned at top right
   */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.x = 520;
    this.y = 10;
    this.width = 200;
    this.height = 50;
    this.setPercentage(100);
  }

  /**
   * Sets the percentage and updates the image
   * @param {number} percentage - Health percentage (0-100)
   */
  setPercentage(percentage) {
    this.percentage = percentage;
    let path = this.IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  /**
   * Returns image index based on percentage value
   * @returns {number} Image index (0-5)
   */
  resolveImageIndex() {
    if (this.percentage === 100) return 5;
    if (this.percentage > 80) return 4;
    if (this.percentage > 60) return 3;
    if (this.percentage > 40) return 2;
    if (this.percentage > 20) return 1;
    return 0;
  }
}

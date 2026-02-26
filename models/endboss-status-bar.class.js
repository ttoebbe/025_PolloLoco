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
  currentStock = 100;
  maxStock = 100;
  counterLabel = "100/100";

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
    this.setStock(100, 100);
  }

  /**
   * Sets the percentage and updates the image
   * @param {number} percentage - Health percentage (0-100)
   */
  setPercentage(percentage) {
    this.percentage = this.normalizePercentage(percentage);
    const path = this.IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  /**
   * Updates exact endboss health values for label rendering.
   * @param {number} currentStock - Current health value.
   * @param {number} maxStock - Maximum health value.
   */
  setStock(currentStock, maxStock) {
    this.maxStock = this.normalizeMaxStock(maxStock);
    this.currentStock = this.normalizeCurrentStock(currentStock, this.maxStock);
    this.counterLabel = this.createCounterLabel();
  }

  /**
   * Draws endboss bar plus exact value label.
   * @param {CanvasRenderingContext2D} context - Canvas render context.
   */
  draw(context) {
    super.draw(context);
    this.drawCounter(context);
  }

  /**
   * Draws centered counter text on the endboss bar.
   * @param {CanvasRenderingContext2D} context - Canvas render context.
   */
  drawCounter(context) {
    const textX = this.x + this.width / 2;
    const textY = this.y + this.height / 2;
    context.save();
    context.font = "bold 20px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineWidth = 4;
    context.strokeStyle = "rgba(0, 0, 0, 0.75)";
    context.fillStyle = "#ffffff";
    context.strokeText(this.counterLabel, textX, textY);
    context.fillText(this.counterLabel, textX, textY);
    context.restore();
  }

  /**
   * Normalizes bar percentage to valid bounds.
   * @param {number} percentage - Raw percentage value.
   * @returns {number} Clamped value between 0 and 100.
   */
  normalizePercentage(percentage) {
    const roundedPercentage = Math.round(percentage || 0);
    return Math.max(0, Math.min(roundedPercentage, 100));
  }

  /**
   * Normalizes max stock to a non-negative integer.
   * @param {number} maxStock - Raw max stock value.
   * @returns {number} Non-negative max stock.
   */
  normalizeMaxStock(maxStock) {
    return Math.max(0, Math.round(maxStock || 0));
  }

  /**
   * Normalizes current stock within valid bounds.
   * @param {number} currentStock - Raw current stock value.
   * @param {number} maxStock - Normalized max stock value.
   * @returns {number} Clamped current stock.
   */
  normalizeCurrentStock(currentStock, maxStock) {
    const roundedStock = Math.round(currentStock || 0);
    return Math.max(0, Math.min(roundedStock, maxStock));
  }

  /**
   * Creates UI label from normalized stock values.
   * @returns {string} Stock label in current/max format.
   */
  createCounterLabel() {
    if (this.maxStock <= 0) return "0/0";
    return `${this.currentStock}/${this.maxStock}`;
  }

  /**
   * Returns image index based on percentage value
   * @returns {number} Image index (0-5)
   */
  resolveImageIndex() {
    if (this.percentage === 100) return 5;
    if (this.percentage >= 80) return 4;
    if (this.percentage >= 60) return 3;
    if (this.percentage >= 40) return 2;
    if (this.percentage > 0) return 1;
    return 0;
  }
}

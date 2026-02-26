class BottleStatusBar extends DrawableObject {
  IMAGES = [
    "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png",
    "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png",
    "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png",
    "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png",
    "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png",
    "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png",
  ];
  percentage = 0;
  currentStock = 0;
  maxStock = 0;
  counterLabel = "0/0";

  /**
   * Creates the bottle status bar.
   */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.x = 30;
    this.y = 110;
    this.width = 200;
    this.height = 50;
    this.setPercentage(0);
    this.setStock(0, 0);
  }

  /**
   * Updates visual percentage and sprite.
   * @param {number} percentage - Current bar percentage.
   */
  setPercentage(percentage) {
    this.percentage = this.normalizePercentage(percentage);
    const path = this.IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  /**
   * Updates exact bottle stock values for label rendering.
   * @param {number} currentStock - Current bottle amount.
   * @param {number} maxStock - Maximum bottle amount.
   */
  setStock(currentStock, maxStock) {
    this.maxStock = this.normalizeMaxStock(maxStock);
    this.currentStock = this.normalizeCurrentStock(currentStock, this.maxStock);
    this.counterLabel = this.createCounterLabel();
  }

  /**
   * Draws bottle bar plus exact stock label.
   * @param {CanvasRenderingContext2D} context - Canvas render context.
   */
  draw(context) {
    super.draw(context);
    this.drawCounter(context);
  }

  /**
   * Draws the counter text on top of the bottle bar.
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
   * Resolves sprite index based on percentage.
   * @returns {number} Image index for current percentage.
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

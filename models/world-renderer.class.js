/**
 * Handles world rendering on the game canvas.
 */
class WorldRenderer {
  /**
   * @param {World} world - Current world instance.
   */
  constructor(world) {
    this.world = world;
  }

  /**
   * Draws one complete frame.
   */
  drawFrame() {
    if (!this.world.gameStateManager.isRunning()) return;
    this.clearCanvas();
    this.drawCameraLayer();
    this.drawUiLayer();
    this.drawCharacterAboveUiIfNeeded();
  }

  /**
   * Clears canvas content before drawing.
   */
  clearCanvas() {
    this.world.ctx.clearRect(0, 0, this.world.canvas.width, this.world.canvas.height);
  }

  /**
   * Draws level objects with camera translation.
   */
  drawCameraLayer() {
    this.world.ctx.translate(this.world.cameraX, 0);
    this.drawLevelObjects();
    this.world.ctx.translate(-this.world.cameraX, 0);
  }

  /**
   * Draws all level related objects.
   */
  drawLevelObjects() {
    this.addObjectsToMap(this.world.level.backgroundObjects);
    this.addObjectsToMap(this.world.level.clouds);
    this.addObjectsToMap(this.world.level.coins);
    this.addObjectsToMap(this.world.level.bottles);
    this.addToMap(this.world.character);
    this.addObjectsToMap(this.world.level.enemies);
    this.addObjectsToMap(this.world.throwableObjects);
  }

  /**
   * Draws fixed UI bars.
   */
  drawUiLayer() {
    this.addToMap(this.world.statusBar);
    this.addToMap(this.world.coinBar);
    this.addToMap(this.world.bottleBar);
    if (this.world.endbossNearby) this.addToMap(this.world.endbossBar);
  }

  /**
   * Draws the character above UI when overlapping HUD space.
   */
  drawCharacterAboveUiIfNeeded() {
    const uiBottom = this.getUiOverlayBottom();
    if (!this.isCharacterOverlappingUi(uiBottom)) return;
    const context = this.world.ctx;
    context.save();
    context.beginPath();
    context.rect(0, 0, this.world.canvas.width, uiBottom);
    context.clip();
    context.translate(this.world.cameraX, 0);
    this.addToMap(this.world.character);
    context.translate(-this.world.cameraX, 0);
    context.restore();
  }

  /**
   * Returns all currently visible UI bars.
   * @returns {Array<DrawableObject>} Visible bars.
   */
  getVisibleUiBars() {
    const bars = [this.world.statusBar, this.world.coinBar, this.world.bottleBar];
    if (this.world.endbossNearby) bars.push(this.world.endbossBar);
    return bars;
  }

  /**
   * Returns the lower edge of the visible HUD bars.
   * @returns {number} Bottom y coordinate of visible bars.
   */
  getUiOverlayBottom() {
    const bars = this.getVisibleUiBars();
    if (bars.length === 0) return 0;
    return Math.max(...bars.map((bar) => bar.y + bar.height));
  }

  /**
   * Checks whether character overlaps the UI area.
   * @param {number} uiBottom - Lower edge of HUD bars.
   * @returns {boolean} True when overlap exists.
   */
  isCharacterOverlappingUi(uiBottom) {
    return this.world.character.y < uiBottom;
  }

  /**
   * Draws an object list.
   * @param {Array<DrawableObject>} objects - Objects to draw.
   */
  addObjectsToMap(objects) {
    objects.forEach((object) => this.addToMap(object));
  }

  /**
   * Draws a single object with optional horizontal flip.
   * @param {DrawableObject} movableObject - Target object.
   */
  addToMap(movableObject) {
    if (movableObject.otherDirection) this.flipImage(movableObject);
    movableObject.draw(this.world.ctx);
    if (movableObject.otherDirection) this.flipImageBack(movableObject);
  }

  /**
   * Flips one object before drawing.
   * @param {DrawableObject} movableObject - Target object.
   */
  flipImage(movableObject) {
    this.world.ctx.save();
    this.world.ctx.translate(movableObject.width, 0);
    this.world.ctx.scale(-1, 1);
    movableObject.x *= -1;
  }

  /**
   * Reverts flip operation after drawing.
   * @param {DrawableObject} movableObject - Target object.
   */
  flipImageBack(movableObject) {
    movableObject.x *= -1;
    this.world.ctx.restore();
  }
}

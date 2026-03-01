/**
 * Handles world collisions and throwable interactions.
 */
class WorldCollisionController {
  /**
   * Creates a new world collision controller.
   * @param {World} world - Owning world instance.
   */
  constructor(world) {
    this.world = world;
  }

  /**
   * Checks if player wants to throw a bottle.
   */
  checkThrowableObject() {
    if (!this.world.keyboard.d) return;
    window.audioManager?.markActivity();
    if (!this.canThrowBottle()) return this.consumeThrowInput();
    this.throwBottle();
    this.consumeThrowInput();
  }

  /**
   * Checks if a bottle throw is currently allowed.
   * @returns {boolean} True when throw is allowed.
   */
  canThrowBottle() {
    if (this.world.collectedBottles <= 0) return false;
    return !this.isThrowCooldownActive();
  }

  /**
   * Checks if throw cooldown is still active.
   * @returns {boolean} True while throw is blocked.
   */
  isThrowCooldownActive() {
    return Date.now() - this.world.lastThrowTime < this.world.throwCooldownMs;
  }

  /**
   * Creates and throws a bottle in character direction.
   */
  throwBottle() {
    const isThrownLeft = this.world.character.otherDirection;
    const offsetX = isThrownLeft ? -20 : 100;
    const bottle = new ThrowableObject(this.world.character.x + offsetX, this.world.character.y + 100, isThrownLeft);
    this.world.throwableObjects.push(bottle);
    this.world.lastThrowTime = Date.now();
    this.world.collectedBottles = Math.max(0, this.world.collectedBottles - 1);
    this.world.updateBottleBar();
    window.audioManager?.playThrow();
  }

  /**
   * Checks collisions.
   */
  checkCollisions() {
    this.checkEnemyCollisions();
    this.checkCoinCollisions();
    this.checkBottleCollisions();
    this.checkThrowableCollisions();
  }

  /**
   * Checks enemy collisions.
   */
  checkEnemyCollisions() {
    const collidingNow = this.getCollidingEnemies();
    this.handleNewEnemyContacts(collidingNow);
    this.handleActiveEnemyContacts(collidingNow);
    this.releaseInactiveEnemyContacts(collidingNow);
  }

  /**
   * Returns currently colliding enemies.
   * @returns {Set<MovableObject>} Set of colliding enemies.
   */
  getCollidingEnemies() {
    const collidingNow = new Set();
    this.world.level.enemies.forEach((enemy) => {
      if (!this.world.character.isColliding(enemy) || enemy.isDead()) return;
      collidingNow.add(enemy);
    });
    return collidingNow;
  }

  /**
   * Handles newly detected enemy contacts.
   * @param {Set<MovableObject>} collidingNow - Current collisions.
   */
  handleNewEnemyContacts(collidingNow) {
    collidingNow.forEach((enemy) => {
      if (this.world.activeEnemyContacts.has(enemy)) return;
      this.resolveEnemyContact(enemy);
    });
  }

  /**
   * Handles active enemy contacts.
   * @param {Set<MovableObject>} collidingNow - Current collisions.
   */
  handleActiveEnemyContacts(collidingNow) {
    collidingNow.forEach((enemy) => {
      if (!this.world.activeEnemyContacts.has(enemy) || enemy.isDead()) return;
      if (!this.world.character.isCollidingFromSide(enemy)) return;
      this.handleSideCollisionWithEnemy(enemy);
    });
  }

  /**
   * Resolves one enemy contact event.
   * @param {MovableObject} enemy - Colliding enemy.
   */
  resolveEnemyContact(enemy) {
    if (this.world.character.isCollidingFromAbove(enemy)) return this.handleJumpCollision(enemy);
    if (!this.world.character.isCollidingFromSide(enemy)) return;
    this.handleSideCollisionWithEnemy(enemy);
    this.world.activeEnemyContacts.add(enemy);
  }

  /**
   * Releases enemy contacts that are no longer active.
   * @param {Set<MovableObject>} collidingNow - Current collisions.
   */
  releaseInactiveEnemyContacts(collidingNow) {
    this.world.activeEnemyContacts.forEach((enemy) => {
      const enemyExists = this.world.level.enemies.includes(enemy);
      if (enemyExists && collidingNow.has(enemy)) return;
      this.world.activeEnemyContacts.delete(enemy);
      this.world.enemyContactDamageTimes.delete(enemy);
    });
  }

  /**
   * Checks coin collisions.
   */
  checkCoinCollisions() {
    for (let i = this.world.level.coins.length - 1; i >= 0; i--) {
      if (!this.world.character.isColliding(this.world.level.coins[i])) continue;
      this.world.level.coins.splice(i, 1);
      this.world.collectedCoins++;
      this.world.updateCoinBar();
      window.audioManager?.playCoinCollect();
    }
  }

  /**
   * Checks bottle collisions.
   */
  checkBottleCollisions() {
    for (let i = this.world.level.bottles.length - 1; i >= 0; i--) {
      if (!this.world.character.isColliding(this.world.level.bottles[i])) continue;
      this.world.level.bottles.splice(i, 1);
      this.world.collectedBottles++;
      this.world.updateBottleBar();
      window.audioManager?.playBottleCollect();
    }
  }

  /**
   * Handles character jumping on enemy.
   * @param {MovableObject} enemy - Enemy being jumped on.
   */
  handleJumpOnEnemy(enemy) {
    if (enemy instanceof Endboss) return;
    enemy.hit();
    this.world.character.triggerStompRebound();
  }

  /**
   * Handles side collision with enemy.
   * @param {MovableObject} enemy - Enemy colliding with character.
   */
  handleSideCollisionWithEnemy(enemy) {
    const now = Date.now();
    if (!this.shouldApplySideContactDamage(enemy, now)) return;
    this.applyEnemyContactDamage(enemy);
    this.setSideContactDamageTime(enemy, now);
    this.world.updateHealthBar();
    window.audioManager?.playCharacterHurt();
  }

  /**
   * Checks if side-contact damage should apply.
   * @param {MovableObject} enemy - Contact enemy.
   * @param {number} now - Current timestamp.
   * @returns {boolean} True when damage should apply.
   */
  shouldApplySideContactDamage(enemy, now) {
    const lastDamageTime = this.world.enemyContactDamageTimes.get(enemy);
    if (lastDamageTime === undefined) return true;
    return now - lastDamageTime >= this.world.contactDamageIntervalMs;
  }

  /**
   * Sets side-contact damage timestamp.
   * @param {MovableObject} enemy - Contact enemy.
   * @param {number} now - Current timestamp.
   */
  setSideContactDamageTime(enemy, now) {
    this.world.enemyContactDamageTimes.set(enemy, now);
  }

  /**
   * Applies enemy contact damage to character.
   * @param {MovableObject} enemy - Contact enemy.
   */
  applyEnemyContactDamage(enemy) {
    if (!(enemy instanceof Endboss)) return this.world.character.hit();
    this.world.character.hit();
    this.world.character.hit();
  }

  /**
   * Checks collisions between throwable objects and enemies.
   */
  checkThrowableCollisions() {
    for (let i = this.world.throwableObjects.length - 1; i >= 0; i--) {
      const bottle = this.world.throwableObjects[i];
      if (bottle.shouldRemove()) {
        this.world.throwableObjects.splice(i, 1);
        continue;
      }
      if (this.checkBottleHitEnemies(bottle)) continue;
      this.checkBottleGroundImpact(bottle);
    }
  }

  /**
   * Checks if bottle hits any enemy.
   * @param {ThrowableObject} bottle - Bottle to check.
   * @returns {boolean} True if bottle hit an enemy.
   */
  checkBottleHitEnemies(bottle) {
    if (bottle.isSplashing) return false;
    let bottleHit = false;
    this.world.level.enemies.forEach((enemy) => {
      if (bottleHit || !bottle.isColliding(enemy) || enemy.isDead()) return;
      this.handleBottleEnemyHit(enemy, bottle);
      bottleHit = true;
    });
    return bottleHit;
  }

  /**
   * Handles bottle hitting an enemy.
   * @param {MovableObject} enemy - Enemy that was hit.
   * @param {ThrowableObject} bottle - Bottle that caused the hit.
   */
  handleBottleEnemyHit(enemy, bottle) {
    bottle.startSplash();
    window.audioManager?.playBottleBreak();
    if (!(enemy instanceof Endboss)) return enemy.hit();
    const didDamage = enemy.tryTakeBottleHit();
    if (didDamage) this.world.updateEndbossBar();
  }

  /**
   * Triggers splash when bottle impacts the ground.
   * @param {ThrowableObject} bottle - Bottle to inspect.
   */
  checkBottleGroundImpact(bottle) {
    if (bottle.isSplashing || !bottle.hasGroundImpact()) return;
    bottle.startSplash();
    window.audioManager?.playBottleBreak();
  }

  /**
   * Removes dead enemies after delay.
   */
  cleanupDeadEnemies() {
    const currentTime = Date.now();
    for (let i = this.world.level.enemies.length - 1; i >= 0; i--) {
      const enemy = this.world.level.enemies[i];
      if (!this.shouldRemoveEnemy(enemy, currentTime)) continue;
      this.world.level.enemies.splice(i, 1);
    }
  }

  /**
   * Checks whether an enemy should be removed.
   * @param {MovableObject} enemy - Enemy to inspect.
   * @param {number} currentTime - Current timestamp.
   * @returns {boolean} True when enemy should be removed.
   */
  shouldRemoveEnemy(enemy, currentTime) {
    if (enemy instanceof Endboss) return false;
    if (!enemy.isDead() || enemy.deathTime <= 0) return false;
    return (currentTime - enemy.deathTime) / 1000 >= 3;
  }

  /**
   * Handles jump collision bookkeeping.
   * @param {MovableObject} enemy - Colliding enemy.
   */
  handleJumpCollision(enemy) {
    this.handleJumpOnEnemy(enemy);
    this.world.activeEnemyContacts.add(enemy);
  }

  /**
   * Resets throw input after processing.
   */
  consumeThrowInput() {
    this.world.keyboard.d = false;
  }
}

window.WorldCollisionController = WorldCollisionController;

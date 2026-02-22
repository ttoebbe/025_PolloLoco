/**
 * Effect-specific AudioManager methods.
 */
AudioManager.prototype.playJump = function playJump() {
  this.playSound("jump");
};

AudioManager.prototype.playThrow = function playThrow() {
  this.playSound("throw", 500);
};

AudioManager.prototype.playBottleBreak = function playBottleBreak() {
  this.playSound("bottleBreak");
};

AudioManager.prototype.playCoinCollect = function playCoinCollect() {
  this.playSound("coinCollect");
};

AudioManager.prototype.playBottleCollect = function playBottleCollect() {
  this.playSound("bottleCollect");
};

AudioManager.prototype.playCharacterHurt = function playCharacterHurt() {
  this.playSound("characterHurt", 200);
};

AudioManager.prototype.playCharacterDead = function playCharacterDead() {
  this.playSound("characterDead");
};

AudioManager.prototype.playChickenDead = function playChickenDead() {
  this.playSound("chickenDead");
};

AudioManager.prototype.playEndbossHurt = function playEndbossHurt() {
  this.playSound("endbossHurt", 200);
};

AudioManager.prototype.playEndbossDead = function playEndbossDead() {
  this.playSound("endbossDead");
};

class Cloud extends MovableObject {
    y = 20;
    height = 250;
    width = 500;

constructor() {
    super().loadImage('img/5_background/layers/4_clouds/1.png');
 
    this.x = Math.random() * 500; 
    }
    
    /**
     * Starts cloud animations using game state manager
     * @param {GameStateManager} gameStateManager - The game state manager instance
     */
    startAnimations(gameStateManager) {
        gameStateManager.registerInterval(() => {
            this.x -= 0.15;
        }, 1000 / 60);
    }
}

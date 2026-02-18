/**
 * Manages game state transitions and centralized timer control
 */
class GameStateManager {
    static STATES = {
        RUNNING: 'RUNNING',
        GAME_OVER: 'GAME_OVER', 
        WON: 'WON'
    };

    /**
     * Creates a new GameStateManager instance
     */
    constructor() {
        this.currentState = GameStateManager.STATES.RUNNING;
        this.intervals = [];
        this.timeouts = [];
        this.animationFrames = [];
        this.eventListeners = {};
    }

    /**
     * Registers an interval for centralized control
     * @param {Function} callback - The callback function
     * @param {number} delay - Delay in milliseconds
     * @returns {number} Interval ID
     */
    registerInterval(callback, delay) {
        const intervalId = setInterval(() => {
            if (this.currentState === GameStateManager.STATES.RUNNING) {
                callback();
            }
        }, delay);
        this.intervals.push(intervalId);
        return intervalId;
    }

    /**
     * Registers a timeout for centralized control
     * @param {Function} callback - The callback function  
     * @param {number} delay - Delay in milliseconds
     * @returns {number} Timeout ID
     */
    registerTimeout(callback, delay) {
        const timeoutId = setTimeout(callback, delay);
        this.timeouts.push(timeoutId);
        return timeoutId;
    }

    /**
     * Changes the game state
     * @param {string} newState - New state from STATES enum
     */
    setState(newState) {
        const oldState = this.currentState;
        this.currentState = newState;
        this.notifyStateChange(oldState, newState);
    }

    /**
     * Adds event listener for state changes
     * @param {Function} callback - Callback function
     */
    onStateChange(callback) {
        if (!this.eventListeners.stateChange) {
            this.eventListeners.stateChange = [];
        }
        this.eventListeners.stateChange.push(callback);
    }

    /**
     * Notifies all listeners about state change
     * @param {string} oldState - Previous state
     * @param {string} newState - New state
     */
    notifyStateChange(oldState, newState) {
        if (this.eventListeners.stateChange) {
            this.eventListeners.stateChange.forEach(callback => {
                callback(oldState, newState);
            });
        }
    }

    /**
     * Clears all registered intervals and timeouts
     */
    clearAll() {
        this.intervals.forEach(id => clearInterval(id));
        this.timeouts.forEach(id => clearTimeout(id));
        this.animationFrames.forEach(id => cancelAnimationFrame(id));
        
        this.intervals = [];
        this.timeouts = [];
        this.animationFrames = [];
    }

    /**
     * Checks if game is currently running
     * @returns {boolean} True if game is running
     */
    isRunning() {
        return this.currentState === GameStateManager.STATES.RUNNING;
    }

    /**
     * Checks if game is in game over state
     * @returns {boolean} True if game over
     */
    isGameOver() {
        return this.currentState === GameStateManager.STATES.GAME_OVER;
    }

    /**
     * Checks if game is in won state
     * @returns {boolean} True if game won
     */
    isWon() {
        return this.currentState === GameStateManager.STATES.WON;
    }
}
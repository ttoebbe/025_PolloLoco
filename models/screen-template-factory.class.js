/**
 * Shared imprint content template.
 */
const IMPRINT_CONTENT_TEMPLATE = `
<div class="imprint-content">
  <p><strong>Impressum</strong></p>
  <p><strong>Angaben gem&auml;&szlig; &sect; 5 DDG (ehemals &sect; 5 TMG)</strong></p>
  <p>Thomas Toebbe-Hoemke<br>Westerodener Stra&szlig;e 33<br>49586 Merzen<br>Deutschland</p>
  <p><strong>Kontakt</strong><br>E-Mail: <a href="mailto:toebbe.thomas@outlook.de">toebbe.thomas@outlook.de</a><br></p>
  <p><strong>Verantwortlich f&uuml;r den Inhalt nach &sect; 18 Abs. 2 MStV</strong><br>Thomas Toebbe-Hoemke<br>Westerodener Stra&szlig;e 33<br>49586 Merzen<br>Deutschland</p>
  <p><strong>Hinweis auf EU-Streitschlichtung</strong><br>Die Europ&auml;ische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">https://ec.europa.eu/consumers/odr</a>.</p>
  <p><strong>Verbraucherstreitbeilegung / Universalschlichtungsstelle</strong><br>Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
</div>
`;

/**
 * Builds all screen templates.
 */
export default class ScreenTemplateFactory {
  /**
   * Returns game over screen template.
   * @returns {string} HTML template string.
   */
  getGameOverTemplate() {
    return `<div class="screen-content game-over-screen">
      <img src="img/9_intro_outro_screens/game_over/game over.png" alt="Game Over" class="screen-image game-over-image">
      ${this.getGameOverActionsTemplate()}
    </div>`;
  }

  /**
   * Returns game over actions template.
   * @returns {string} HTML template string.
   */
  getGameOverActionsTemplate() {
    return `<div class="game-over-actions">
      ${this.getGameOverRestartButtonTemplate()}
      ${this.getBackToMenuButtonTemplate("game-over-menu-button")}
    </div>`;
  }

  /**
   * Returns game over restart button template.
   * @returns {string} HTML template string.
   */
  getGameOverRestartButtonTemplate() {
    return `<button id="game-over-restart-button" class="game-over-restart-button" type="button">Restart</button>`;
  }

  /**
   * Returns one endscreen back-to-menu button template.
   * @param {string} buttonId - Button id.
   * @returns {string} HTML template string.
   */
  getBackToMenuButtonTemplate(buttonId) {
    return `<button id="${buttonId}" class="game-over-restart-button" type="button">Back to Menu</button>`;
  }

  /**
   * Returns win screen template.
   * @returns {string} HTML template string.
   */
  getWinScreenTemplate() {
    return `<div class="screen-content game-over-screen">
      <img src="img/You won, you lost/You Won B.png" alt="You Won" class="screen-image">
      ${this.getWinActionsTemplate()}
    </div>`;
  }

  /**
   * Returns win actions template.
   * @returns {string} HTML template string.
   */
  getWinActionsTemplate() {
    return `<div class="game-over-actions">
      <button id="restart-button" class="game-over-restart-button" type="button">Play Again</button>
      ${this.getBackToMenuButtonTemplate("win-menu-button")}
    </div>`;
  }

  /**
   * Returns start screen template.
   * @returns {string} HTML template string.
   */
  getStartScreenTemplate() {
    return `<div class="screen-content startscreen">
      ${this.getTopRightButtonsTemplate()}
      ${this.getImprintModalTemplate()}
      <img src="img/9_intro_outro_screens/start/startscreen_2.png" alt="Start Screen" class="screen-image startscreen-image">
    </div>`;
  }

  /**
   * Returns top-right buttons wrapper template.
   * @returns {string} HTML template string.
   */
  getTopRightButtonsTemplate() {
    return `<div class="button-container top-right-buttons">
      ${this.getTopRightButtonRowTemplate()}
      ${this.getControlsInfoTemplate()}
    </div>`;
  }

  /**
   * Returns top-right button row template.
   * @returns {string} HTML template string.
   */
  getTopRightButtonRowTemplate() {
    return `<div class="top-right-button-row">
      ${this.getStartButtonTemplate()}
      ${this.getMuteButtonTemplate()}
      ${this.getFullscreenButtonTemplate()}
      ${this.getControlsButtonTemplate()}
      ${this.getImpressumButtonTemplate()}
    </div>`;
  }

  /**
   * Returns controls info template.
   * @returns {string} HTML template string.
   */
  getControlsInfoTemplate() {
    return `<div id="controls-info" class="startscreen-info hidden" aria-live="polite">
      Keyboard: <br>Left/Right Arrow: Move <br>Space: Jump <br>D: Throw
    </div>`;
  }

  /**
   * Returns imprint modal template.
   * @returns {string} HTML template string.
   */
  getImprintModalTemplate() {
    return `<div id="imprint-modal" class="imprint-modal hidden" aria-hidden="true">
      <div id="imprint-backdrop" class="imprint-backdrop"></div>
      ${this.getImprintDialogTemplate()}
    </div>`;
  }

  /**
   * Returns imprint dialog template.
   * @returns {string} HTML template string.
   */
  getImprintDialogTemplate() {
    return `<section class="imprint-dialog" role="dialog" aria-modal="true" aria-labelledby="imprint-title">
      ${this.getImprintHeaderTemplate()}
      ${this.getImprintContentTemplate()}
    </section>`;
  }

  /**
   * Returns imprint dialog header template.
   * @returns {string} HTML template string.
   */
  getImprintHeaderTemplate() {
    return `<header class="imprint-header">
      <h2 id="imprint-title">Imprint</h2>
      <button id="imprint-close" class="imprint-close-button" type="button" aria-label="Close imprint">Close</button>
    </header>`;
  }

  /**
   * Returns imprint dialog content template.
   * @returns {string} HTML template string.
   */
  getImprintContentTemplate() {
    return IMPRINT_CONTENT_TEMPLATE;
  }

  /**
   * Returns start button template.
   * @returns {string} HTML template string.
   */
  getStartButtonTemplate() {
    return `<button id="start-button" type="button">Start</button>`;
  }

  /**
   * Returns mute button template.
   * @returns {string} HTML template string.
   */
  getMuteButtonTemplate() {
    return `<button id="mute" class="icon-button" type="button">
      <img id="mute-icon" src="img/button_background_images/soundon.svg" alt="Toggle sound">
    </button>`;
  }

  /**
   * Returns fullscreen button template.
   * @returns {string} HTML template string.
   */
  getFullscreenButtonTemplate() {
    return `<button id="fullscreen-toggle" type="button">Fullscreen</button>`;
  }

  /**
   * Returns controls button template.
   * @returns {string} HTML template string.
   */
  getControlsButtonTemplate() {
    return `<button id="controls" class="icon-button" type="button" aria-expanded="false" aria-controls="controls-info">
      <img src="img/button_background_images/controls.svg" alt="Controls">
    </button>`;
  }

  /**
   * Returns imprint button template.
   * @returns {string} HTML template string.
   */
  getImpressumButtonTemplate() {
    return `<button id="impressum" class="icon-button" type="button" aria-expanded="false" aria-controls="imprint-modal">
      <img src="img/button_background_images/imprint.svg" alt="Imprint">
    </button>`;
  }
}

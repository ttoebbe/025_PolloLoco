/**
 * Start screen template methods for ScreenManager.
 */
ScreenManager.prototype.getTopRightButtonsTemplate = function getTopRightButtonsTemplate() {
  return `
    <div class="button-container top-right-buttons">
      ${this.getTopRightButtonRowTemplate()}
      ${this.getControlsInfoTemplate()}
      ${this.getImprintInfoTemplate()}
    </div>
  `;
};

ScreenManager.prototype.getTopRightButtonRowTemplate = function getTopRightButtonRowTemplate() {
  return `
    <div class="top-right-button-row">
      ${this.getStartButtonTemplate()}
      ${this.getMuteButtonTemplate()}
      ${this.getFullscreenButtonTemplate()}
      ${this.getControlsButtonTemplate()}
      ${this.getImpressumButtonTemplate()}
    </div>
  `;
};

ScreenManager.prototype.getControlsInfoTemplate = function getControlsInfoTemplate() {
  return `
    <div id="controls-info" class="startscreen-info hidden" aria-live="polite">
      Keyboard: <br>
      Left/Right Arrow: Move <br>
      Space: Jump <br>
      D: Throw
    </div>
  `;
};

ScreenManager.prototype.getImprintInfoTemplate = function getImprintInfoTemplate() {
  return `
    <div id="imprint-info" class="startscreen-info hidden" aria-live="polite">
      This game was created by: Thomas Toebbe-Hoemke <br>
      Mail: toebbe.thomas@outlook.de
    </div>
  `;
};

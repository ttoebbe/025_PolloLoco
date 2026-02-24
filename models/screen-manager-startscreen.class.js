/**
 * Start screen template methods for ScreenManager.
 */
ScreenManager.prototype.getTopRightButtonsTemplate = function getTopRightButtonsTemplate() {
  return `
    <div class="button-container top-right-buttons">
      ${this.getTopRightButtonRowTemplate()}
      ${this.getControlsInfoTemplate()}
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

ScreenManager.prototype.getImprintModalTemplate = function getImprintModalTemplate() {
  return `
    <div id="imprint-modal" class="imprint-modal hidden" aria-hidden="true">
      <div id="imprint-backdrop" class="imprint-backdrop"></div>
      ${this.getImprintDialogTemplate()}
    </div>
  `;
};

ScreenManager.prototype.getImprintDialogTemplate = function getImprintDialogTemplate() {
  return `
    <section class="imprint-dialog" role="dialog" aria-modal="true" aria-labelledby="imprint-title">
      ${this.getImprintHeaderTemplate()}
      ${this.getImprintContentTemplate()}
    </section>
  `;
};

ScreenManager.prototype.getImprintHeaderTemplate = function getImprintHeaderTemplate() {
  return `
    <header class="imprint-header">
      <h2 id="imprint-title">Imprint</h2>
      <button id="imprint-close" class="imprint-close-button" type="button" aria-label="Close imprint">Close</button>
    </header>
  `;
};

ScreenManager.prototype.getImprintContentTemplate = function getImprintContentTemplate() {
  return `
<div class="imprint-content">
  <p><strong>Impressum</strong></p>

  <p><strong>Angaben gemäß § 5 DDG (ehemals § 5 TMG)</strong></p>
  <p>
    Thomas Toebbe-Hoemke<br>
    Westerodener Straße 33<br>
    49586 Merzen<br>
    Deutschland
  </p>

  <p><strong>Kontakt</strong><br>
    E-Mail: <a href="mailto:toebbe.thomas@outlook.de">toebbe.thomas@outlook.de</a><br>
  </p>

  <p><strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</strong><br>
    Thomas Toebbe-Hoemke<br>
    Westerodener Straße 33<br>
    49586 Merzen<br>
    Deutschland
  </p>

  <p><strong>Hinweis auf EU‑Streitschlichtung</strong><br>
    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
    <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">
      https://ec.europa.eu/consumers/odr
    </a>.
  </p>

  <p><strong>Verbraucherstreitbeilegung / Universalschlichtungsstelle</strong><br>
    Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
    Verbraucherschlichtungsstelle teilzunehmen.
  </p>
</div>
  `;
};

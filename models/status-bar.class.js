class StatusBar extends DrawableObject {
  IMAGES = [
    "img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png",
    "img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png",
    "img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png",
    "img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png",
    "img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png",
    "img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png",
  ];

  percentage = 100;

  //ein constructor ist eine Funktion, die automatisch aufgerufen wird, wenn ein neues Objekt der Klasse erstellt wird. Er dient dazu, die Eigenschaften des Objekts zu initialisieren.
  constructor() {
    super(); // Ruft den Konstruktor der übergeordneten Klasse (DrawableObject) auf
    this.loadImages(this.IMAGES); // Lädt die Bilder in den imageCache
  }

  setPercentage(percentage) {
    this.percentage = percentage; // Aktualisiert den Prozentsatz
    let path = this.IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path]; // Aktualisiert das Bild basierend auf dem neuen Prozentsatz
  }

  resolveImageIndex() {
    if (this.percentage == 100) {
      return 5;
    } else if (this.percentage > 80) {
      return 4;
    } else if (this.percentage > 60) {
      return 3;
    } else if (this.percentage > 40) {
      return 2;
    } else if (this.percentage > 20) {
      return 1;
    } else {
      return 0;
    }
  }
}

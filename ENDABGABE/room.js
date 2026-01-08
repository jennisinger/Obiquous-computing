document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen");
  const startBtn = document.getElementById("startBtn");
  const eggs = document.querySelectorAll(".egg");
  const pet = document.getElementById("pet");

  // Start Game → Startscreen ausblenden
  startBtn.addEventListener("click", () => {
    startScreen.style.display = "none";
  });

  // Eier auswählen → Animation abspielen
  eggs.forEach(egg => {
    egg.addEventListener("click", () => {
      const color = egg.dataset.color;

      // Zuerst leeren wir den pet-Bereich
      pet.innerHTML = "";

      // Video-Element erzeugen
      const video = document.createElement("video");
      video.src = `assets/${color}_egg_fox_animation.mp4`; // z. B. green_egg_fox_animation.mp4
      video.autoplay = true;
      video.muted = true; // für Autoplay im Browser wichtig
      video.playsInline = true; // damit es auf Mobilgeräten inline abgespielt wird
      video.width = 300; // Größe kann angepasst werden
      video.style.borderRadius = "12px";
      video.style.transition = "transform 0.5s";
      video.style.transform = "scale(0.5)"; // Start klein
      pet.appendChild(video);

      // Animation: Einblenden & vergrößern
      setTimeout(() => {
        video.style.transform = "scale(1)";
      }, 50);

      // Optional: nach Animation das Video behalten oder ein Bild des Tiers zeigen
      video.addEventListener("ended", () => {
        // Video entfernen und statisches Tierbild anzeigen
        pet.innerHTML = `<img src="assets/pet-${color}.png" alt="Tier">`;
      });

      // Andere Eier ausblenden
      eggs.forEach(e => e.style.display = e === egg ? "block" : "none");

      // Aktionen sichtbar machen (falls vorhanden)
      const actions = document.getElementById("actions");
      if (actions) actions.classList.remove("hidden");
    });
  });
});

// Popup beim Laden
window.addEventListener("DOMContentLoaded", () => {
  alert("Wähle ein Ei aus");
});

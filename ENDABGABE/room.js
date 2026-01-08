document.addEventListener("DOMContentLoaded", () => {
  const egg = document.getElementById("egg");
  const pet = document.getElementById("pet");

  // Pop-Up Hinweis
  alert("Klicke auf das Ei, um dein Tier zu schlüpfen!");

  egg.addEventListener("click", () => {
    console.log("Ei geklickt");

    // 1️⃣ Ei Animation starten
    egg.classList.add("egg-hatching");

    // 2️⃣ Nach Ende der Animation: Ei weg, Tier zeigen
    setTimeout(() => {
      egg.style.display = "none";
      pet.style.display = "block";

      // Optional: weitere Aktionen anzeigen (Füttern, Streicheln)
      // hier kannst du Sidebar oder Buttons einblenden
    }, 1200); // Dauer der CSS Animation
  });
});

// Canvas-Hintergrund erstellen
document.addEventListener("DOMContentLoaded", () => {
  const playArea = document.getElementById("play-area");

  // Canvas erstellen
  const canvas = document.createElement("canvas");
  canvas.id = "bg-canvas";
  canvas.width = playArea.offsetWidth;
  canvas.height = playArea.offsetHeight;
  canvas.style.position = "absolute";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.zIndex = 0; // Hintergrund
  playArea.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  // Resize-Handler, damit Canvas immer die volle Fläche hat
  window.addEventListener("resize", () => {
    canvas.width = playArea.offsetWidth;
    canvas.height = playArea.offsetHeight;
    drawBackground();
  });

  function drawBackground() {
    const w = canvas.width;
    const h = canvas.height;

    // Himmel
    ctx.fillStyle = "#b7e3ff"; // hellblau
    ctx.fillRect(0, 0, w, h * 0.7);

    // Boden
    ctx.fillStyle = "#2e7d32"; // grün
    ctx.fillRect(0, h * 0.7, w, h * 0.3);

    // Wolken
    ctx.fillStyle = "white";
    drawCloud(ctx, w * 0.2, h * 0.1, 60, 40);
    drawCloud(ctx, w * 0.5, h * 0.15, 80, 50);
    drawCloud(ctx, w * 0.8, h * 0.08, 50, 30);

    // Pflanzen/Pilze
    drawPlant(ctx, w * 0.1, h * 0.85, 20, 50);
    drawPlant(ctx, w * 0.3, h * 0.9, 15, 40);
    drawMushroom(ctx, w * 0.7, h * 0.88, 15, 20);
    drawMushroom(ctx, w * 0.85, h * 0.87, 20, 25);
  }

  function drawCloud(ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    ctx.ellipse(x + width * 0.5, y + 10, width * 0.7, height * 0.7, 0, 0, Math.PI * 2);
    ctx.ellipse(x - width * 0.5, y + 10, width * 0.7, height * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlant(ctx, x, y, width, height) {
    ctx.fillStyle = "#1b5e20"; // dunkler grün
    ctx.fillRect(x - width / 8, y - height, width / 4, height);
    ctx.beginPath();
    ctx.arc(x, y - height, width / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#b973ffff"; // Blattfarbe
    ctx.fill();
  }

  function drawMushroom(ctx, x, y, width, height) {
    // Stiel
    ctx.fillStyle = "#fbe9e7";
    ctx.fillRect(x - width / 4, y - height, width / 2, height);

    // Kappe
    ctx.beginPath();
    ctx.arc(x, y - height, width, 0, Math.PI, true);
    ctx.fillStyle = "#d32f2f";
    ctx.fill();
  }

  

  drawBackground();
});

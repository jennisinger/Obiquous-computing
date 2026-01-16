document.addEventListener("DOMContentLoaded", () => {
  const playArea = document.getElementById("play-area");
  const egg = document.getElementById("egg");
  // Falls mehrere Elemente mit id="pet" existieren: nur erstes behalten
  const petNodes = document.querySelectorAll("#pet");
  let pet = petNodes[0] || null;
  if (petNodes.length > 1) {
    for (let i = 1; i < petNodes.length; i++) petNodes[i].remove();
  }

  // Hinweis: Alert optional, daher entfernt (stört Mobile-Tests)
  // Falls pet nicht vorhanden ist, erstelle fallback (img)
  if (!pet) {
    pet = document.createElement("img");
    pet.id = "pet";
    pet.src = "assets/bear.png";
    pet.alt = "Tier";
    pet.classList.add("hidden");
    playArea.appendChild(pet);
  }

  // Hole vorhandene Sidebars oder erstelle nur falls nicht vorhanden
  function getOrCreateSidebar(id, html) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.className = "sidebar";
      el.innerHTML = html;
      playArea.appendChild(el);
    }
    return el;
  }

  const sidebarLeft = getOrCreateSidebar("sidebar-left", `
    <button class="side-btn" id="feed">🍎</button>
    <button class="side-btn" id="petting">💛</button>
    <button class="side-btn" id="sleep">💡</button>
  `);

  const sidebarRight = getOrCreateSidebar("sidebar-right", `
    <button class="side-btn" id="tic-tac-toe" onclick="window.location.href='tictactoe.html'">🎮</button>
    <button class="side-btn" id="sing">🎤</button>
  `);
 
// ==== Einfaches Night-Overlay Toggle ====
const sleepBtn = document.getElementById("sleep");
let nightOverlay = document.getElementById("night-overlay");
if (!nightOverlay) {
  nightOverlay = document.createElement("div");
  nightOverlay.id = "night-overlay";
  document.body.appendChild(nightOverlay); // full-screen overlay
}
// Klick togglet die Verdunkelung
if (sleepBtn) {
  sleepBtn.addEventListener("click", () => {
    nightOverlay.classList.toggle("active");
  });
}
// ...existing code...

// Helfer: Tiredness-Bar anpassen (falls vorhanden)
function adjustTired(delta) {
  const fill = document.getElementById("tiredness-fill");
  if (!fill || !fill.parentElement) return;
  // aktuellen Prozentwert ermitteln (falls dataset nicht gesetzt)
  let pct = Number(fill.dataset.value);
  if (isNaN(pct)) {
    const parentW = fill.parentElement.clientWidth || 100;
    const curW = parseFloat(getComputedStyle(fill).width) || 0;
    pct = Math.round((curW / parentW) * 100);
    if (!pct) pct = 50; // Fallback
  }
  pct = Math.max(0, Math.min(100, pct + delta));
  fill.dataset.value = pct;
  fill.style.width = pct + "%";
}

// Toggle-Funktion: Overlay ein/aus
function toggleSleep() {
  const goingToSleep = !nightOverlay.classList.contains("active");
  nightOverlay.classList.toggle("active", goingToSleep);

  // Beispiel: beim Einschlafen Tiredness +20, beim Aufwachen -5
  if (goingToSleep) adjustTired(20);
  else adjustTired(-5);
}

// Klicks binden
if (sleepBtn) sleepBtn.addEventListener("click", toggleSleep);
// Overlay klick schließt (optional)
nightOverlay.addEventListener("click", () => {
  nightOverlay.classList.remove("active");
  adjustTired(-5);
});
// ...existing code...

  // Stelle sicher, dass Sidebars initial versteckt sind (CSS sollte .sidebar { display:none })
  sidebarLeft.classList.remove("visible");
  sidebarRight.classList.remove("visible");
  pet.classList.add("hidden");
  egg.classList.remove("hidden");

egg.addEventListener("click", () => {
  // Guard: nicht nochmal starten, wenn's schon läuft oder Ei versteckt ist
  if (egg.classList.contains("hidden") || egg.classList.contains("egg-hatching")) return;

  // Starte Wackel-Animation
  egg.classList.add("egg-hatching");

  let finished = false;
  const finishHatch = () => {
    if (finished) return;
    finished = true;

    // Animation beendet → Ei verbergen, Pet zeigen, Sidebars einblenden
    egg.classList.add("hidden");
    egg.classList.remove("egg-hatching");

    if (pet) {
      pet.classList.remove("hidden");
      pet.classList.add("shown");
    }

    if (typeof sidebarLeft !== "undefined" && sidebarLeft) sidebarLeft.classList.add("visible");
    if (typeof sidebarRight !== "undefined" && sidebarRight) sidebarRight.classList.add("visible");
  };

  // Event-driven Ende + WebKit-Fallback
  egg.addEventListener("animationend", finishHatch, { once: true });
  egg.addEventListener("webkitAnimationEnd", finishHatch, { once: true });

  // Sicherheits-Fallback falls animationend nicht kommt
  setTimeout(finishHatch, 1600);
});


  // Canvas-Hintergrund (responsiv)
  const canvas = document.createElement("canvas");
  canvas.id = "bg-canvas";
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "0";
  playArea.prepend(canvas);
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    const w = playArea.offsetWidth;
    const h = playArea.offsetHeight;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    drawBackground();
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function drawBackground() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#b7e3ff";
    ctx.fillRect(0, 0, w, Math.floor(h * 0.7));

    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(0, Math.floor(h * 0.7), w, Math.ceil(h * 0.3));

    ctx.fillStyle = "white";
    drawCloud(ctx, w * 0.2, h * 0.1, 60, 40);
    drawCloud(ctx, w * 0.5, h * 0.15, 80, 50);
    drawCloud(ctx, w * 0.8, h * 0.08, 50, 30);

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
    ctx.fillStyle = "#1b5e20";
    ctx.fillRect(x - width / 8, y - height, width / 4, height);
    ctx.beginPath();
    ctx.arc(x, y - height, width / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#b973ffff";
    ctx.fill();
  }

  function drawMushroom(ctx, x, y, width, height) {
    ctx.fillStyle = "#fbe9e7";
    ctx.fillRect(x - width / 4, y - height, width / 2, height);
    ctx.beginPath();
    ctx.arc(x, y - height, width, 0, Math.PI, true);
    ctx.fillStyle = "#d32f2f";
    ctx.fill();
  }

  // ============= STATS SYSTEM =============
  // Stats-Werte (0-100)
  let stats = {
    hunger: 100,
    energy: 100,
    happiness: 100
  };

  // Funktion zum Aktualisieren der Balken
  function updateStats() {
    document.getElementById("hunger-fill").style.width = stats.hunger + "%";
    document.getElementById("energy-fill").style.width = stats.energy + "%";
    document.getElementById("happiness-fill").style.width = stats.happiness + "%";
  }

  // Funktion zum Ändern eines Stats
  function changeStat(statName, amount) {
    if (stats.hasOwnProperty(statName)) {
      stats[statName] += amount;
      stats[statName] = Math.max(0, Math.min(100, stats[statName])); // Begrenzen auf 0-100
      updateStats();
    }
  }

  // Exponiere changeStat global, damit Buttons darauf zugreifen können
  window.changeStat = changeStat;

  // Initialisiere die Balken
  updateStats();

  // Beispiel: Stats langsam über Zeit verschlechtern
  setInterval(() => {
    changeStat("hunger", -3);   // Hunger sinkt um 3
    changeStat("energy", -2); // Müdigkeit sinkt um 2
    changeStat("happiness", -2); // Glück sinkt um 2
  }, 5000); // Alle 5 Sekunden
});
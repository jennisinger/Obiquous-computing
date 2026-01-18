document.addEventListener("DOMContentLoaded", () => {
  const playArea = document.getElementById("play-area");
  const egg = document.getElementById("egg");

  // Falls mehrere Elemente mit id="pet" existieren: nur erstes behalten
  const petNodes = document.querySelectorAll("#pet");
  let pet = petNodes[0] || null;
  if (petNodes.length > 1) {
    for (let i = 1; i < petNodes.length; i++) petNodes[i].remove();
  }

  // Falls pet nicht vorhanden ist, erstelle fallback (img)
  if (!pet) {
    pet = document.createElement("img");
    pet.id = "pet";
    pet.src = "assets/bear.png";
    pet.alt = "Tier";
    pet.classList.add("hidden");
    playArea.appendChild(pet);
  }

  // Funktion: vorhandene Sidebars holen oder erstellen
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
    <button class="side-btn" id="feed">🍔</button>
    <button class="side-btn" id="petting">💛</button>
    <button class="side-btn" id="energy">💡</button>
  `);

  const sidebarRight = getOrCreateSidebar("sidebar-right", `
    <button class="side-btn" id="tic-tac-toe" onclick="window.location.href='tictactoe.html'">🎮</button>
    <button class="side-btn" id="sing">🎤</button>
  `);

  // Top Sidebar für Stats
  const sidebarTop = document.getElementById("sidebar-top");
  if (sidebarTop) sidebarTop.style.display = "none";

  // Night overlay
  let nightOverlay = document.getElementById('night-overlay');
  if (!nightOverlay) {
    nightOverlay = document.createElement('div');
    nightOverlay.id = 'night-overlay';
    playArea.appendChild(nightOverlay);
  }

  // Stelle sicher, dass Sidebars und Pet initial versteckt sind
  sidebarLeft.classList.remove("visible");
  sidebarRight.classList.remove("visible");
  pet.classList.add("hidden");
  egg.classList.remove("hidden");

  // ============= STATS SYSTEM =============
  let stats = {
    hunger: 100,
    energy: 100
  };

  function updateStats() {
    document.getElementById("hunger-fill").style.width = stats.hunger + "%";
    document.getElementById("energy-fill").style.width = stats.energy + "%";
  }

  function changeStat(statName, amount) {
    if (stats.hasOwnProperty(statName)) {
      stats[statName] += amount;
      stats[statName] = Math.max(0, Math.min(100, stats[statName]));
      updateStats();
    }
  }

  window.changeStat = changeStat;

  let statInterval = null;   // normales Intervall
  let sleepInterval = null;  // Energie-Aufladung

  function initStats() {
    updateStats();
    if (!statInterval) {
      statInterval = setInterval(() => {
        // Nur runterziehen, wenn Tier wach ist
        if (!nightOverlay.classList.contains('active')) {
          changeStat("hunger", -5);
          changeStat("energy", -3);
        }
      }, 5000);
    }
  }

  // ============= EGG HATCHING =============
  egg.addEventListener("click", () => {
    if (egg.classList.contains("hidden") || egg.classList.contains("egg-hatching")) return;

    egg.classList.add("egg-hatching");

    let finished = false;
    const finishHatch = () => {
      if (finished) return;
      finished = true;

      // Ei verstecken, Pet zeigen
      egg.classList.add("hidden");
      egg.classList.remove("egg-hatching");

      if (pet) {
        pet.classList.remove("hidden");
        pet.classList.add("shown");
      }

      localStorage.setItem('petHatched', '1');

      // Sidebars sichtbar machen
      if (sidebarLeft) sidebarLeft.classList.add("visible");
      if (sidebarRight) sidebarRight.classList.add("visible");

      // Stats-Leiste sichtbar machen
      if (sidebarTop) sidebarTop.style.display = "flex";

      // Stats starten
      initStats();
    };

    egg.addEventListener("animationend", finishHatch, { once: true });
    egg.addEventListener("webkitAnimationEnd", finishHatch, { once: true });
    setTimeout(finishHatch, 1600);
  });

  // ============= SLEEP BUTTON =============
  const sleepBtn = document.getElementById('sleep');
  let snoreSound = null;
  if (sleepBtn) {
    sleepBtn.addEventListener('click', () => {
      const isSleeping = nightOverlay.classList.toggle('active');

      if (isSleeping) {
        // Energie-Aufladung starten
        // Schnarch-Sound im Loop abspielen
        if (!snoreSound) {
          snoreSound = new Audio("assets/sound_snoring.mp3");
          snoreSound.loop = true;
        }
        snoreSound.currentTime = 0;
        snoreSound.play();
        if (!sleepInterval) {
          sleepInterval = setInterval(() => {
            changeStat("energy", 5);
          }, 5000);
        }
      } else {
        // Energie-Aufladung stoppen
        if (sleepInterval) {
          clearInterval(sleepInterval);
          sleepInterval = null;
        }
        // Schnarch-Sound stoppen
        if (snoreSound) {
          snoreSound.pause();
          snoreSound.currentTime = 0;
        }
      }
    });
  }

  // ============= CANVAS BACKGROUND =============
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
});

document.addEventListener("DOMContentLoaded", () => {
  const playArea = document.getElementById("play-area");
  const pet = document.getElementById("pet");
  const burgerBtn = document.getElementById("feed"); // Button mit Burger

  if (!burgerBtn || !pet) return;

  // Erstelle ein dragbares Burger-Element
  const dragBurger = document.createElement("span");
  dragBurger.id = "dragging-burger";
  dragBurger.textContent = "🍔"; // Burger Emoji
  dragBurger.style.position = "absolute";
  dragBurger.style.cursor = "grab";
  dragBurger.style.fontSize = "26px";
  dragBurger.style.display = "none";
  dragBurger.style.zIndex = "10";
  playArea.appendChild(dragBurger);

  let isDragging = false;

  // Positionen merken
  let startX, startY;
  let burgerStartX, burgerStartY;

  function getButtonCenter(btn) {
    const rect = btn.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + rect.height / 2 + window.scrollY
    };
  }

  burgerBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const center = getButtonCenter(burgerBtn);
    dragBurger.style.left = center.x - dragBurger.offsetWidth / 2 + "px";
    dragBurger.style.top = center.y - dragBurger.offsetHeight / 2 + "px";
    dragBurger.style.display = "block";
    isDragging = true;

    startX = e.clientX;
    startY = e.clientY;

    burgerStartX = center.x - dragBurger.offsetWidth / 2;
    burgerStartY = center.y - dragBurger.offsetHeight / 2;

    dragBurger.setPointerCapture(e.pointerId);
  });

  dragBurger.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    dragBurger.style.left = burgerStartX + dx + "px";
    dragBurger.style.top = burgerStartY + dy + "px";
  });

  dragBurger.addEventListener("pointerup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    dragBurger.releasePointerCapture(e.pointerId);

    // Prüfen, ob Burger beim Tier ist
    const burgerRect = dragBurger.getBoundingClientRect();
    const petRect = pet.getBoundingClientRect();

    const collision = !(
      burgerRect.right < petRect.left ||
      burgerRect.left > petRect.right ||
      burgerRect.bottom < petRect.top ||
      burgerRect.top > petRect.bottom
    );

    if (collision) {
      // Hunger auffüllen (z.B. +30)
      if (typeof changeStat === "function") changeStat("hunger", 30);

      // Sound abspielen wenn gegessen wird
      const eatSound = new Audio("assets/sound_eating.mp3");
      eatSound.play();

      // Hier kannst du später die Ess-Animation starten
      if (pet.classList.contains("shown")) {
        pet.classList.add("eating"); // Beispiel-Klasse, Animation selbst erstellen
        setTimeout(() => pet.classList.remove("eating"), 1000);
      }
    }

    // Burger wieder zurücksetzen
    dragBurger.style.left = burgerStartX + "px";
    dragBurger.style.top = burgerStartY + "px";
    dragBurger.style.display = "none";
  });

  // optional: touch / mobile scroll fix
  dragBurger.addEventListener("pointercancel", () => {
    isDragging = false;
    dragBurger.style.display = "none";
  });
});

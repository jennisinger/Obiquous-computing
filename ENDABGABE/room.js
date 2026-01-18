document.addEventListener("DOMContentLoaded", () => {
  const playArea = document.getElementById("play-area");
  if (!playArea) {
    console.error("play-area fehlt im DOM");
    return;
  }

  // --- Helpers ---------------------------------------------------------
  function getOrCreateSidebar(id, html) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.className = id === "sidebar-top" ? "sidebar-top" : "sidebar";
      el.innerHTML = html;
      playArea.appendChild(el);
    }
    return el;
  }

  // --- Elements / fallbacks -------------------------------------------
  const eggExisting = document.getElementById("egg");
  let egg = eggExisting || (() => {
    const e = document.createElement("img");
    e.id = "egg";
    e.src = "assets/egg.png";
    e.alt = "Ei";
    e.className = "";
    playArea.appendChild(e);
    return e;
  })();

  // Deduplicate pet
  const petNodes = document.querySelectorAll("#pet");
  let pet = petNodes[0] || null;
  if (petNodes.length > 1) {
    for (let i = 1; i < petNodes.length; i++) petNodes[i].remove();
  }
  if (!pet) {
    pet = document.createElement("img");
    pet.id = "pet";
    pet.src = "assets/bear.png";
    pet.alt = "Tier";
    pet.classList.add("hidden");
    playArea.appendChild(pet);
  }

  // Sidebars
  const sidebarLeft = getOrCreateSidebar("sidebar-left", `
    <button class="side-btn" id="feed">🍔</button>
    <button class="side-btn" id="petting">💛</button>
    <button class="side-btn" id="energy">💡</button>
  `);

  const sidebarRight = getOrCreateSidebar("sidebar-right", `
    <button class="side-btn" id="tic-tac-toe">🎮</button>
    <button class="side-btn" id="sing">🎤</button>
  `);

  const sidebarTop = document.getElementById("sidebar-top") || getOrCreateSidebar("sidebar-top", `
    <div class="stat-item"><div class="stat-label">Hunger</div><div class="stat-bar"><div id="hunger-fill" class="stat-fill"></div></div></div>
    <div class="stat-item"><div class="stat-label">Energie</div><div class="stat-bar"><div id="energy-fill" class="stat-fill"></div></div></div>
    <div class="stat-item"><div class="stat-label">Glück</div><div class="stat-bar"><div id="happiness-fill" class="stat-fill"></div></div></div>
  `);

  // Ensure initial visibility classes
  if (sidebarLeft) sidebarLeft.classList.remove("visible");
  if (sidebarRight) sidebarRight.classList.remove("visible");
  if (sidebarTop) sidebarTop.classList.remove("visible");
  pet.classList.add("hidden");
  egg.classList.remove("hidden");

  // Night overlay (full screen)
  let nightOverlay = document.getElementById("night-overlay");
  if (!nightOverlay) {
    nightOverlay = document.createElement("div");
    nightOverlay.id = "night-overlay";
    document.body.appendChild(nightOverlay);
  }
  nightOverlay.classList.remove("active");

  // --- Stats system (init only when hatched) --------------------------
  const stats = { hunger: 100, energy: 80, happiness: 90 };
  let __statsInterval = null;

  function updateStatsUI() {
    const h = document.getElementById("hunger-fill");
    const e = document.getElementById("energy-fill");
    const g = document.getElementById("happiness-fill");
    if (h) h.style.width = Math.max(0, Math.min(100, stats.hunger)) + "%";
    if (e) e.style.width = Math.max(0, Math.min(100, stats.energy)) + "%";
    if (g) g.style.width = Math.max(0, Math.min(100, stats.happiness)) + "%";
  }

  function changeStat(name, delta) {
    if (!(name in stats)) return;
    stats[name] = Math.max(0, Math.min(100, stats[name] + delta));
    updateStatsUI();
  }
  window.changeStat = changeStat;

  function startStatsInterval() {
    if (__statsInterval) return;
    __statsInterval = setInterval(() => {
      const sleeping = nightOverlay.classList.contains("active");
      if (!sleeping) {
        changeStat("hunger", -2);
        changeStat("energy", -1);
      }
    }, 5000);
  }

  function stopStatsInterval() {
    if (!__statsInterval) return;
    clearInterval(__statsInterval);
    __statsInterval = null;
  }

  function initStats() {
    updateStatsUI();
    startStatsInterval();
    if (sidebarTop) sidebarTop.classList.add("visible");
  }

  // --- Egg hatch logic -----------------------------------------------
  function finishHatchRoutine() {
    egg.classList.add("hidden");
    egg.classList.remove("egg-hatching");
    if (pet) { pet.classList.remove("hidden"); pet.classList.add("shown"); }
    localStorage.setItem("petHatched", "1");
    if (sidebarLeft) sidebarLeft.classList.add("visible");
    if (sidebarRight) sidebarRight.classList.add("visible");
    if (sidebarTop) sidebarTop.classList.add("visible");
    initStats();
  }

  egg.addEventListener("click", () => {
    if (egg.classList.contains("hidden") || egg.classList.contains("egg-hatching")) return;
    egg.classList.add("egg-hatching");

    let finished = false;
    const finishHatch = () => {
      if (finished) return;
      finished = true;
      finishHatchRoutine();
    };

    egg.addEventListener("animationend", finishHatch, { once: true });
    egg.addEventListener("webkitAnimationEnd", finishHatch, { once: true });
    setTimeout(finishHatch, 1600); // fallback
  });

  // If previously hatched, restore state immediately
  if (localStorage.getItem("petHatched") === "1") {
    if (egg) egg.classList.add("hidden");
    if (pet) { pet.classList.remove("hidden"); pet.classList.add("shown"); }
    if (sidebarLeft) sidebarLeft.classList.add("visible");
    if (sidebarRight) sidebarRight.classList.add("visible");
    if (sidebarTop) sidebarTop.classList.add("visible");
    initStats();
  }

  // --- Sleep / night overlay -----------------------------------------
  const sleepBtn = document.getElementById("sleep") || document.getElementById("energy");
  let sleepRechargeInterval = null;
  let snoreSound = null;

  if (sleepBtn) {
    sleepBtn.addEventListener("click", () => {
      const nowSleeping = nightOverlay.classList.toggle("active");
      if (nowSleeping) {
        if (!snoreSound) { snoreSound = new Audio("assets/sound_snoring.mp3"); snoreSound.loop = true; }
        snoreSound.currentTime = 0;
        snoreSound.play().catch(() => {});
        // start slow recharge while sleeping
        if (!sleepRechargeInterval) {
          sleepRechargeInterval = setInterval(() => changeStat("energy", +15), 4000);
        }
      } else {
        if (sleepRechargeInterval) { clearInterval(sleepRechargeInterval); sleepRechargeInterval = null; }
        if (snoreSound) { snoreSound.pause(); snoreSound.currentTime = 0; }
        // small wake bonus
        changeStat("energy", +10);
      }
    });

    // allow tapping overlay to wake up
    nightOverlay.addEventListener("click", () => {
      if (nightOverlay.classList.contains("active")) {
        nightOverlay.classList.remove("active");
        if (sleepRechargeInterval) { clearInterval(sleepRechargeInterval); sleepRechargeInterval = null; }
        if (snoreSound) { snoreSound.pause(); snoreSound.currentTime = 0; }
        changeStat("energy", +10);
      }
    });
  }

  // --- Responsive layout: move sidebars to bottom on small screens ----
  function applyResponsiveLayout() {
    const mobile = window.innerWidth <= 700;
    let bottomBar = document.getElementById("bottom-bar");

    if (mobile) {
      if (!bottomBar) {
        bottomBar = document.createElement("div");
        bottomBar.id = "bottom-bar";
        bottomBar.className = "sidebar";
        document.body.appendChild(bottomBar);
      }
      if (sidebarLeft && sidebarLeft.parentElement !== bottomBar) bottomBar.appendChild(sidebarLeft);
      if (sidebarRight && sidebarRight.parentElement !== bottomBar) bottomBar.appendChild(sidebarRight);
      if (sidebarTop && sidebarTop.parentElement !== document.body) document.body.appendChild(sidebarTop);
      if (nightOverlay && nightOverlay.parentElement !== document.body) document.body.appendChild(nightOverlay);
    } else {
      // restore desktop placement
      if (sidebarLeft && sidebarLeft.parentElement !== playArea) playArea.appendChild(sidebarLeft);
      if (sidebarRight && sidebarRight.parentElement !== playArea) playArea.appendChild(sidebarRight);
      if (sidebarTop && sidebarTop.parentElement !== playArea) playArea.insertBefore(sidebarTop, playArea.firstChild);
      if (bottomBar && bottomBar.childElementCount === 0) bottomBar.remove();
      if (nightOverlay && nightOverlay.parentElement !== document.body) document.body.appendChild(nightOverlay);
    }
  }

  applyResponsiveLayout();
  let __layoutTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(__layoutTimer);
    __layoutTimer = setTimeout(applyResponsiveLayout, 120);
  });

  // --- Navigation handlers -------------------------------------------
  const tttBtn = document.getElementById("tic-tac-toe");
  if (tttBtn) tttBtn.addEventListener("click", () => { localStorage.setItem("petHatched", "1"); window.location.href = "tictactoe.html"; });

  const singBtn = document.getElementById("sing");
  if (singBtn) singBtn.addEventListener("click", () => { localStorage.setItem("petHatched", "1"); window.location.href = "singing_bear.html"; });

  // --- Canvas background ---------------------------------------------
  const canvas = document.createElement("canvas");
  canvas.id = "bg-canvas";
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "0";
  playArea.prepend(canvas);
  const ctx = canvas.getContext ? canvas.getContext("2d") : null;

  function resizeCanvas() {
    const w = playArea.offsetWidth;
    const h = playArea.offsetHeight;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    if (ctx) drawBackground();
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function drawBackground() {
    if (!ctx) return;
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

  // --- Drag to feed (single robust implementation) -------------------
  (function setupDragBurger() {
    const feedBtn = document.getElementById("feed");
    if (!feedBtn || !pet) return;

    let dragBurger = document.getElementById("dragging-burger");
    if (!dragBurger) {
      dragBurger = document.createElement("span");
      dragBurger.id = "dragging-burger";
      dragBurger.textContent = "🍔";
      Object.assign(dragBurger.style, {
        position: "absolute",
        cursor: "grab",
        fontSize: "28px",
        display: "none",
        zIndex: 9999,
        touchAction: "none"
      });
      document.body.appendChild(dragBurger);
    }

    let dragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    function getCenter(el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY };
    }

    feedBtn.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      const c = getCenter(feedBtn);
      dragBurger.style.left = c.x - dragBurger.offsetWidth / 2 + "px";
      dragBurger.style.top = c.y - dragBurger.offsetHeight / 2 + "px";
      dragBurger.style.display = "block";
      dragging = true;
      startX = ev.clientX; startY = ev.clientY;
      startLeft = parseFloat(dragBurger.style.left) || 0;
      startTop = parseFloat(dragBurger.style.top) || 0;
      dragBurger.setPointerCapture(ev.pointerId);
    });

    dragBurger.addEventListener("pointermove", (ev) => {
      if (!dragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      dragBurger.style.left = startLeft + dx + "px";
      dragBurger.style.top = startTop + dy + "px";
    });

    function endDrag(ev) {
      if (!dragging) return;
      dragging = false;
      try { dragBurger.releasePointerCapture(ev.pointerId); } catch (e) {}
      const bR = dragBurger.getBoundingClientRect();
      const pR = pet.getBoundingClientRect();
      const hit = !(bR.right < pR.left || bR.left > pR.right || bR.bottom < pR.top || bR.top > pR.bottom);
      if (hit) {
        changeStat("hunger", 40);
        const eatSound = new Audio("assets/sound_eating.mp3");
        eatSound.play().catch(() => {});
        if (pet.classList.contains("shown")) {
          pet.classList.add("eating");
          setTimeout(() => pet.classList.remove("eating"), 900);
        }
      }
      dragBurger.style.display = "none";
    }

    dragBurger.addEventListener("pointerup", endDrag);
    dragBurger.addEventListener("pointercancel", () => { dragging = false; dragBurger.style.display = "none"; });
  })();
});




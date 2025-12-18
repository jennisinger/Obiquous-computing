const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

function updateCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
  updateCanvasSize();
  createStars();
});

updateCanvasSize();

const stars = [];
const meteors = [];
let lastTime = performance.now();

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function createStars() {
  stars.length = 0;
  const amount = Math.floor((canvas.width * canvas.height) / 9000);
  for (let i = 0; i < amount; i++) {
    stars.push({
      x: rand(0, canvas.width),
      y: rand(0, canvas.height),
      r: rand(0.4, 1.6),
      tw: rand(0, Math.PI * 2),
      twSpeed: rand(0.01, 0.05),
      baseAlpha: rand(0.4, 0.9)
    });
  }
}
createStars();

function spawnMeteor() {
  meteors.push({
    x: rand(-0.2 * canvas.width, 0.2 * canvas.width),
    y: rand(0, canvas.height * 0.3),
    vx: rand(800, 1400),
    vy: rand(400, 900),
    life: 0,
    maxLife: rand(0.4, 1.1),
    len: rand(80, 200)
  });
}

canvas.addEventListener("click", spawnMeteor);

function drawMoon() {
  const x = canvas.width * 0.84;
  const y = canvas.height * 0.18;
  const r = canvas.height * 0.08;

  const g = context.createRadialGradient(x, y, r * 0.3, x, y, r * 1.8);
  g.addColorStop(0, "rgba(255,255,210,0.6)");
  g.addColorStop(1, "rgba(255,255,210,0)");
  context.fillStyle = g;
  context.beginPath();
  context.arc(x, y, r * 1.8, 0, Math.PI * 2);
  context.fill();

  const m = context.createRadialGradient(x, y, r * 0.1, x, y, r);
  m.addColorStop(0, "rgba(255,255,230,1)");
  m.addColorStop(1, "rgba(245,245,210,1)");
  context.fillStyle = m;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2);
  context.fill();
}

function animate(time) {
  const dt = (time - lastTime) / 1000;
  lastTime = time;

  const bg = context.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#001326");
  bg.addColorStop(1, "#00040a");
  context.fillStyle = bg;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMoon();

  for (const s of stars) {
    s.tw += s.twSpeed;
    const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.tw));
    context.fillStyle = `rgba(255,255,255,${alpha})`;
    context.beginPath();
    context.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    context.fill();
  }

  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.life += dt / m.maxLife;
    if (m.life > 1) {
      meteors.splice(i, 1);
      continue;
    }

    m.x += m.vx * dt;
    m.y += m.vy * dt;

    const trail = context.createLinearGradient(
      m.x, m.y,
      m.x - m.len, m.y - m.len * 0.4
    );
    trail.addColorStop(0, "rgba(255,255,255,1)");
    trail.addColorStop(1, "rgba(255,255,255,0)");
    context.strokeStyle = trail;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(m.x, m.y);
    context.lineTo(m.x - m.len, m.y - m.len * 0.4);
    context.stroke();
  }

  requestAnimationFrame(animate);
}

animate(performance.now());

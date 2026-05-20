/**
 * app.js — Controller Utama
 * Menghubungkan semua modul: graph, utils, algoritma, dan UI.
 */

// ── State ─────────────────────────────────────────────────
const adj = buildAdjacency();
let results = {};
let activeTab = "map";

let animProgress = 1;
let animReq = null;

function startAnimation() {
  animProgress = 0;
  if (animReq) cancelAnimationFrame(animReq);
  
  function step() {
    animProgress += 0.001; // Kecepatan gerak animasi (semakin besar semakin cepat)
    if (animProgress > 1) animProgress = 1;
    draw();
    if (animProgress < 1) {
      animReq = requestAnimationFrame(step);
    }
  }
  step();
}

const ALGO_META = {
  dfs: {
    label: "DFS",
    color: "#378ADD",
    dash: [6, 4],
    width: 2.5,
    desc: `<b>Depth-First Search (DFS)</b> menelusuri graf sedalam mungkin menggunakan stack (LIFO).
    Tidak menjamin jalur terpendek — hasilnya bergantung urutan eksplorasi tetangga.
    Cocok untuk mengecek keterjangkauan (reachability), bukan optimasi jarak.
    <br><br><b>Kompleksitas:</b> Waktu O(V+E) · Ruang O(V)`,
  },
  astar: {
    label: "A*",
    color: "#EF9F27",
    dash: [],
    width: 3.5,
    desc: `<b>A* Search</b> menggabungkan biaya aktual g(n) dengan estimasi heuristic h(n)
    menggunakan jarak Haversine (garis lurus). Selama heuristic admissible, A* menjamin jalur optimal.
    <br><br><b>f(n) = g(n) + h(n)</b>
    <br><b>Kompleksitas:</b> Waktu O(E log V) · Ruang O(V)`,
  },
  hc: {
    label: "Hill Climbing",
    color: "#D85A30",
    dash: [3, 3],
    width: 2.5,
    desc: `<b>Steepest-Ascent Hill Climbing</b> memilih tetangga dengan heuristic terkecil secara greedy.
    Sangat efisien dari segi memori O(1), tapi bisa terjebak di local optimum, plateau, atau dead end.
    <br><br><b>Kompleksitas:</b> Waktu O(V·b) · Ruang O(1)`,
  },
};

// ── Jalankan Semua Algoritma ───────────────────────────────
function runAll() {
  const start = document.getElementById("sel-start").value;
  const goal  = document.getElementById("sel-goal").value;

  if (start === goal) {
    document.getElementById("info-panel").innerHTML =
      "<b>Pilih kota asal dan tujuan yang berbeda ya!</b>";
    return;
  }

  // DFS
  let t = performance.now();
  const dfsRes = dfs(start, goal, adj);
  dfsRes.timeMs  = (performance.now() - t).toFixed(3);
  dfsRes.dist    = pathDistance(dfsRes.path);
  results.dfs    = dfsRes;

  // A*
  t = performance.now();
  const astarRes = astar(start, goal, adj, NODES, haversine);
  astarRes.timeMs = (performance.now() - t).toFixed(3);
  astarRes.dist   = pathDistance(astarRes.path);
  results.astar   = astarRes;

  // Hill Climbing
  t = performance.now();
  const hcRes = hillClimbing(start, goal, adj, NODES, haversine);
  hcRes.timeMs = (performance.now() - t).toFixed(3);
  hcRes.dist   = pathDistance(hcRes.path);
  results.hc   = hcRes;

  renderCards();
  activeTab = "compare"; 
  updateInfo();
  startAnimation(); 
}

// ── Render Kartu Hasil ─────────────────────────────────────
function renderCards() {
  const keys = ["dfs", "astar", "hc"];
  const minDist = Math.min(
    ...keys.filter((k) => results[k]?.found).map((k) => results[k].dist)
  );

  document.getElementById("result-cards").innerHTML = keys.map((key) => {
    const r = results[key];
    const m = ALGO_META[key];
    const best = r.found && r.dist === minDist;
    return `
      <div class="res-card${best ? " best" : ""}${r.found ? "" : " failed"}">
        <div class="res-algo-label" style="color:${m.color}">
          ${m.label}
          ${best       ? '<span class="badge-best">Terpendek</span>' : ""}
          ${!r.found   ? '<span class="badge-fail">Gagal</span>'     : ""}
        </div>
        <div class="res-dist">${r.found ? r.dist.toLocaleString() + " km" : "—"}</div>
        <div class="res-meta">${r.explored} node · ${r.timeMs} ms</div>
        <div class="res-path">${
          r.found
            ? formatPath(r.path)
            : r.stuckAt
            ? "Terjebak di: " + r.stuckAt
            : "Tidak ditemukan"
        }</div>
      </div>`;
  }).join("");
}

// ── Tab ────────────────────────────────────────────────────
function setTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".tab-btn").forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.tab === tab)
  );
  updateInfo();
  startAnimation(); 
}

function updateInfo() {
  const map = {
    map:     `Graf rute darat <b>${Object.keys(NODES).length} kota</b> dan <b>${EDGES.length} ruas jalan</b>. Pilih kota dan klik <b>Jalankan Algoritma</b>.`,
    dfs:     ALGO_META.dfs.desc,
    astar:   ALGO_META.astar.desc,
    hc:      ALGO_META.hc.desc,
    compare: `Mode <b>Perbandingan</b>: semua jalur ditampilkan sekaligus. Solid tebal = A* (optimal), putus panjang = DFS, putus pendek = Hill Climbing.`,
  };
  document.getElementById("info-panel").innerHTML = map[activeTab] || map.map;
}

// ── Canvas Drawing ─────────────────────────────────────────
function draw() {
  const canvas = document.getElementById("map-canvas");
  const W = canvas.offsetWidth || 760;
  const H = 400;
  canvas.width  = W * devicePixelRatio;
  canvas.height = H * devicePixelRatio;
  const ctx = canvas.getContext("2d");
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const px = (n) => NODES[n].x * (W - 60) + 30;
  const py = (n) => NODES[n].y * (H - 40) + 20;

  ctx.clearRect(0, 0, W, H);

  // 1. Semua edge (abu-abu tipis)
  for (const [a, b] of EDGES) {
    ctx.beginPath();
    ctx.moveTo(px(a), py(a));
    ctx.lineTo(px(b), py(b));
    ctx.strokeStyle = "rgba(140,140,140,0.15)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([]);
    ctx.stroke();
  }

  // 2. Highlight jalur sesuai tab
  const toHighlight =
    activeTab === "compare"
      ? ["dfs", "astar", "hc"]
      : ALGO_META[activeTab] ? [activeTab] : [];

  for (const key of toHighlight) {
    const r = results[key];
    if (!r || !r.path.length) continue;
    const m = ALGO_META[key];
    
    ctx.beginPath();
    ctx.moveTo(px(r.path[0]), py(r.path[0]));
    
    // Hitung kemajuan segmen rute
    const totalSegments = r.path.length - 1;
    const currentTotalProgress = animProgress * totalSegments;
    const currentSegmentIndex = Math.floor(currentTotalProgress);
    const segmentProgress = currentTotalProgress - currentSegmentIndex;

    // 2a. Gambar garis yang sudah dilewati sepenuhnya
    for (let i = 1; i <= currentSegmentIndex; i++) {
      ctx.lineTo(px(r.path[i]), py(r.path[i]));
    }

    // 2b. Gambar garis parsial yang sedang bergerak
    let currentX = px(r.path[currentSegmentIndex]);
    let currentY = py(r.path[currentSegmentIndex]);

    if (currentSegmentIndex < totalSegments) {
      const nextX = px(r.path[currentSegmentIndex + 1]);
      const nextY = py(r.path[currentSegmentIndex + 1]);
      // Interpolasi koordinat untuk efek meluncur
      currentX = currentX + (nextX - currentX) * segmentProgress;
      currentY = currentY + (nextY - currentY) * segmentProgress;
      ctx.lineTo(currentX, currentY);
    }

    ctx.strokeStyle = m.color;
    ctx.lineWidth   = m.width;
    ctx.setLineDash(m.dash);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2c. Tambahkan indikator titik bulat di ujung rute yang sedang bergerak
    if (animProgress < 1 && totalSegments > 0) {
      ctx.beginPath();
      ctx.arc(currentX, currentY, Math.max(m.width * 1.5, 4), 0, Math.PI * 2);
      ctx.fillStyle = m.color;
      ctx.fill();
    }
  }

  // 3. Semua node
  const startVal = document.getElementById("sel-start").value;
  const goalVal  = document.getElementById("sel-goal").value;

  for (const name in NODES) {
    const x = px(name), y = py(name);
    const isKey = name === startVal || name === goalVal;
    ctx.beginPath();
    ctx.arc(x, y, isKey ? 8 : 5, 0, Math.PI * 2);
    ctx.fillStyle   = isKey ? "#1D9E75" : "#ffffff";
    ctx.strokeStyle = isKey ? "#0F6E56" : "rgba(100,100,100,0.35)";
    ctx.lineWidth   = isKey ? 2 : 1;
    ctx.fill(); ctx.stroke();

    ctx.font      = `${isKey ? 500 : 400} ${isKey ? 11 : 10}px 'DM Sans', sans-serif`;
    ctx.fillStyle = isKey ? "#085041" : "rgba(80,80,80,0.85)";
    ctx.textAlign = "center";
    ctx.fillText(name, x, y - (isKey ? 12 : 9));
  }
}

// ── Init ───────────────────────────────────────────────────
function init() {
  const selStart = document.getElementById("sel-start");
  const selGoal  = document.getElementById("sel-goal");

  for (const name in NODES) {
    const o1 = new Option(name, name);
    const o2 = new Option(name, name);
    if (name === "Medan")     o1.selected = true;
    if (name === "Palembang") o2.selected = true;
    selStart.add(o1);
    selGoal.add(o2);
  }

  document.querySelectorAll(".tab-btn").forEach((btn) =>
    btn.addEventListener("click", () => setTab(btn.dataset.tab))
  );
  document.getElementById("run-btn").addEventListener("click", runAll);
  window.addEventListener("resize", draw);

  updateInfo();
  draw();
}

document.addEventListener("DOMContentLoaded", init);
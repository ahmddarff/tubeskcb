/**
 * app.js — Controller Utama (Versi OpenStreetMap dengan Leaflet.js)
 */

// ── State ─────────────────────────────────────────────────
const adj = buildAdjacency(); //
let results = {}; //
let activeTab = "map"; //

let animProgress = 1; //
let animReq = null; //

// Variabel baru untuk Leaflet Map dan Layer Manajemen
let map;
let pathLayers;
let markerLayers;

function startAnimation() {
  animProgress = 0; //
  if (animReq) cancelAnimationFrame(animReq); //
  
  function step() {
    animProgress += 0.008; // Ditingkatkan kecepatannya sedikit karena render Leaflet berbeda dengan canvas
    if (animProgress > 1) animProgress = 1; //
    draw();
    if (animProgress < 1) {
      animReq = requestAnimationFrame(step); //
    }
  }
  step(); //
}

const ALGO_META = { //
  dfs: { //
    label: "DFS", //
    color: "#378ADD", //
    dash: "6, 4", // Format dash array diubah menyesuaikan string Leaflet
    width: 3, //
    desc: `<b>Depth-First Search (DFS)</b>...`, //
  },
  astar: { //
    label: "A*", //
    color: "#EF9F27", //
    dash: null, //
    width: 4, //
    desc: `<b>A* Search</b>...`, //
  },
  hc: { //
    label: "Hill Climbing", //
    color: "#D85A30", //
    dash: "3, 3", //
    width: 3, //
    desc: `<b>Hill Climbing</b>...`, //
  },
};

// ── Jalankan Semua Algoritma ───────────────────────────────
function runAll() {
  const start = document.getElementById("sel-start").value; //
  const goal  = document.getElementById("sel-goal").value; //

  if (start === goal) { //
    document.getElementById("info-panel").innerHTML = "<b>Pilih kota asal dan tujuan yang berbeda ya!</b>"; //
    return; //
  }

  // Jalankan DFS
  let t = performance.now(); //
  const dfsRes = dfs(start, goal, adj); //
  dfsRes.timeMs  = (performance.now() - t).toFixed(3); //
  dfsRes.dist    = pathDistance(dfsRes.path); //
  results.dfs    = dfsRes; //

  // Jalankan A*
  t = performance.now(); //
  const astarRes = astar(start, goal, adj, NODES, haversine); //
  astarRes.timeMs = (performance.now() - t).toFixed(3); //
  astarRes.dist   = pathDistance(astarRes.path); //
  results.astar   = astarRes; //

  // Jalankan Hill Climbing
  t = performance.now(); //
  const hcRes = hillClimbing(start, goal, adj, NODES, haversine); //
  hcRes.timeMs = (performance.now() - t).toFixed(3); //
  hcRes.dist   = pathDistance(hcRes.path); //
  results.hc   = hcRes; //

  renderCards(); //
  activeTab = "compare"; //
  updateInfo(); //
  startAnimation(); //
}

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

// ── Leaflet Drawing Engine (DIOPTIMALKAN ANTI LAG) ──────────

// Kita buat dua layer terpisah:
let baseLayers; // Layer untuk jalan abu-abu & label (Statis - Digambar 1x)
let animLayers; // Layer untuk animasi rute (Dinamis - Digambar 60x/detik)

// Fungsi baru untuk menggambar peta dasar (Hanya dipanggil sekali)
function drawBaseMap() {
  baseLayers.clearLayers();

  // 1. Gambar Semua Ruas Jalan Dasar & Jaraknya
  for (const [a, b, w] of EDGES) { 
    const latlngs = [[NODES[a].lat, NODES[a].lon], [NODES[b].lat, NODES[b].lon]];
    L.polyline(latlngs, { color: "rgba(140,140,140,0.4)", weight: 1.5 }).addTo(baseLayers);

    const midLat = (NODES[a].lat + NODES[b].lat) / 2;
    const midLon = (NODES[a].lon + NODES[b].lon) / 2;
    L.tooltip({ permanent: true, direction: 'center', className: 'edge-label', interactive: false })
      .setLatLng([midLat, midLon]).setContent(`${w} km`).addTo(baseLayers);
  }

  // 2. Gambar Semua Titik Kota Dasar & Namanya
  for (const name in NODES) { 
    const coords = [NODES[name].lat, NODES[name].lon];
    const marker = L.circleMarker(coords, {
      radius: 5, fillColor: "#ffffff", color: "rgba(100,100,100,0.35)", weight: 1.5, fillOpacity: 1
    }).addTo(baseLayers);

    marker.bindTooltip(name, {
      permanent: true, direction: "top", className: 'city-label', offset: [0, -8]
    });
  }
}

// Fungsi animasi yang dijalankan 60fps
function draw() {
  if (!map) return;

  // HANYA hapus layer animasinya saja! Layer dasar (baseLayers) biarkan utuh.
  animLayers.clearLayers();

  const toHighlight = activeTab === "compare" ? ["dfs", "astar", "hc"] : (ALGO_META[activeTab] ? [activeTab] : []);
  const reachedNodes = new Set();

  // Gambar rute yang sedang dicari oleh AI
  for (const key of toHighlight) { 
    const r = results[key]; 
    if (!r || !r.path.length) continue; 
    const m = ALGO_META[key]; 
    
    const totalSegments = r.path.length - 1; 
    const currentTotalProgress = animProgress * totalSegments; 
    const currentSegmentIndex = Math.floor(currentTotalProgress); 
    const segmentProgress = currentTotalProgress - currentSegmentIndex; 

    const currentPathCoords = [];

    for (let i = 0; i <= currentSegmentIndex && i < r.path.length; i++) {
      currentPathCoords.push([NODES[r.path[i]].lat, NODES[r.path[i]].lon]);
      reachedNodes.add(r.path[i]); 
    }

    if (currentSegmentIndex < totalSegments) {
      const nodeA = NODES[r.path[currentSegmentIndex]];
      const nodeB = NODES[r.path[currentSegmentIndex + 1]];
      const currentLat = nodeA.lat + (nodeB.lat - nodeA.lat) * segmentProgress;
      const currentLon = nodeA.lon + (nodeB.lon - nodeA.lon) * segmentProgress;
      currentPathCoords.push([currentLat, currentLon]);

      if (animProgress < 1) {
        L.circleMarker([currentLat, currentLon], {
          radius: Math.max(m.width * 1.5, 5), fillColor: m.color, color: m.color, fillOpacity: 1
        }).addTo(animLayers);
      }
    }

    if (currentPathCoords.length > 1) {
      L.polyline(currentPathCoords, { color: m.color, weight: m.width, dashArray: m.dash }).addTo(animLayers);
    }
  }

  // Timpa warna titik kota yang dilewati agar menyala
  const startVal = document.getElementById("sel-start").value; 
  const goalVal  = document.getElementById("sel-goal").value; 
  const dynamicColor = ALGO_META[activeTab] ? ALGO_META[activeTab].color : "#1d4ed8";

  for (const name of reachedNodes) {
    const isKey = name === startVal || name === goalVal;
    if (isKey) continue; // Start/Goal ditangani terpisah di bawah
    
    L.circleMarker([NODES[name].lat, NODES[name].lon], {
      radius: 6.5, fillColor: dynamicColor, color: "#1e40af", weight: 1, fillOpacity: 1
    }).addTo(animLayers);
  }

  // Pastikan warna kota Start dan Goal selalu hijau dan ada di lapisan paling atas
  for (const name of [startVal, goalVal]) {
    if (!NODES[name]) continue;
    L.circleMarker([NODES[name].lat, NODES[name].lon], {
      radius: 8, fillColor: "#1D9E75", color: "#0F6E56", weight: 2, fillOpacity: 1
    }).addTo(animLayers);
  }
}

// ── Inisialisasi Aplikasi ──────────────────────────────────
function init() {
  // Pusatkan peta ke area Sumatera Bagian Tengah
  map = L.map('map').setView([1.8, 100.0], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  // Buat dua layer terpisah
  baseLayers = L.layerGroup().addTo(map);
  animLayers = L.layerGroup().addTo(map);

  const selStart = document.getElementById("sel-start"); 
  const selGoal  = document.getElementById("sel-goal"); 

  for (const name in NODES) { 
    const o1 = new Option(name, name); 
    const o2 = new Option(name, name); 
    if (name === "Medan")     o1.selected = true; 
    if (name === "Pekanbaru") o2.selected = true; 
    selStart.add(o1); 
    selGoal.add(o2); 
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => 
    btn.addEventListener("click", () => setTab(btn.dataset.tab)) 
  );
  document.getElementById("run-btn").addEventListener("click", runAll); 

  // PANGGIL GAMBAR STATIS 1 KALI SAJA DI SINI!
  drawBaseMap(); 

  updateInfo(); 
  draw(); 
}

document.addEventListener("DOMContentLoaded", init);
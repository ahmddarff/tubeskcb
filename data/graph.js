/**
 * graph.js
 * Data graf kota-kota di Sumatera beserta jarak antar kota (km)
 * Studi kasus: Rute darat Medan → Pekanbaru (Detail Tinggi & Lintas Tengah)
 */

const NODES = {
  // === CABANG 1: AREA MEDAN & PERCABANGAN AWAL ===
  Medan:              { lat: 3.59519, lon: 98.67222 },
  PancurBatu:         { lat: 3.47966, lon: 98.59689 },
  LubukPakam:         { lat: 3.56633, lon: 98.87515 },

  // === CABANG 2: JALUR PEGUNUNGAN KARO (Alternatif Siantar/Toba) ===
  Berastagi:          { lat: 3.18529, lon: 98.50491 },
  Kabanjahe:          { lat: 3.10502, lon: 98.4985 },
  Merek:              { lat: 2.94122, lon: 98.51847 },
  Saribudolok:        { lat: 2.93704, lon: 98.61119 },

  // === CABANG 3: JALUR LINTAS TIMUR (Via Perbaungan / Galang) ===
  Perbaungan:         { lat: 3.56822, lon: 98.94714 },
  SeiRampah:          { lat: 3.49338, lon: 99.12438 },
  Galang:             { lat: 3.43137, lon: 98.90006 },
  DolokMasihul:       { lat: 3.33635, lon: 99.01576 },
  Tebing:             { lat: 3.32628, lon: 99.15668 },
  
  // === CABANG 4: JALUR PESISIR ASAHAN & LABUHANBATU ===
  Indrapura:          { lat: 3.28821, lon: 99.37147 },
  LimaPuluh:          { lat: 3.16821, lon: 99.41879 },
  Kisaran:            { lat: 2.98316, lon: 99.62787 },
  TanjungBalai:       { lat: 2.96594, lon: 99.79835 }, // Cabang Buntu
  SimpangAmpat:       { lat: 2.92259, lon: 99.7315 },
  UlakMedan:          { lat: 2.71353, lon: 99.61347 },
  AekKanopan:         { lat: 2.56749, lon: 99.61743 },
  Rantauprapat:       { lat: 2.10084, lon: 99.82878 },
  Kotapinang:         { lat: 1.89065, lon: 100.09002 },

  // === CABANG 5: JALUR LINTAS TENGAH (Via Danau Toba & Tapsel) ===
  Pematangsiantar:    { lat: 2.96514, lon: 99.06263 },
  Prapat:             { lat: 2.66251, lon: 98.93416 },
  Porsea:             { lat: 2.46173, lon: 99.13601 },
  Balige:             { lat: 2.33371, lon: 99.08325 },
  Tarutung:           { lat: 2.01188, lon: 98.97977 },
  Sibolga:            { lat: 1.74061, lon: 98.78234 }, // Cabang Buntu Pantai Barat
  Padangsidimpuan:    { lat: 1.37218, lon: 99.27301 },
  GunungTua:          { lat: 1.03017, lon: 99.80551 },

  // === CABANG 6: AREA RIAU UTARA (Jalur Minyak & Tol) ===
  BaganBatu:          { lat: 1.7013, lon: 100.40505 },
  UjungTanjung:       { lat: 1.61585, lon: 101.15041 },
  Dumai:              { lat: 1.66663, lon: 101.40018 }, // Cabang Buntu Pantai Timur
  Duri:               { lat: 1.25961, lon: 101.21309 },
  Kandis:             { lat: 1.00118, lon: 101.11644 },
  Minas:              { lat: 0.74261, lon: 0.74261 },

  // === CABANG 7: AREA RIAU TENGAH & PEKANBARU SEKITARNYA ===
  PasirPengarayan:    { lat: 0.86198, lon: 100.2955 },
  Bangkinang:         { lat: 0.34135, lon: 101.02795 },
  Perawang:           { lat: 0.67343, lon: 0.67343 },
  Pekanbaru:          { lat: 0.50706, lon: 101.44777 },
  Siak:               { lat: 0.81188, lon: 0.81188 }, // Cabang Buntu
};

// [kotaA, kotaB, jarak_km] — graf tidak berarah
const EDGES = [
  // --- AWALAN DARI MEDAN ---
  ["Medan", "PancurBatu", 0], // Membuka jalur Pegunungan
  ["Medan", "LubukPakam", 0], // Membuka jalur Lintas Timur

  // --- CABANG 2: JALUR PEGUNUNGAN KARO ---
  ["PancurBatu", "Berastagi", 0],
  ["Berastagi", "Kabanjahe", 0],
  ["Kabanjahe", "Merek", 0],
  ["Merek", "Saribudolok", 0],
  // Tembusan dari gunung ke lintas tengah:
  ["Saribudolok", "Pematangsiantar", 0],
  ["Saribudolok", "Prapat", 0],

  // --- CABANG 3: PERCABANGAN PAKAM - TEBING TINGGI ---
  // Sub-jalur 3A: Pesisir / Tol
  ["LubukPakam", "Perbaungan", 0],
  ["Perbaungan", "SeiRampah", 0],
  ["SeiRampah", "Tebing", 0],
  // Sub-jalur 3B: Dalam / Perkebunan
  ["LubukPakam", "Galang", 0],
  ["Galang", "DolokMasihul", 0],
  ["DolokMasihul", "Tebing", 0],
  
  // --- CABANG 4: JALUR PESISIR ASAHAN & LABUHANBATU ---
  ["Tebing", "Indrapura", 0],
  ["Indrapura", "LimaPuluh", 0],
  ["LimaPuluh", "Kisaran", 0],
  ["Kisaran", "TanjungBalai", 0], // Buntu
  
  // Detail Kisaran -> Aek Kanopan via Simpang Ampat
  ["Kisaran", "SimpangAmpat", 0],
  ["SimpangAmpat", "UlakMedan", 0],
  ["UlakMedan", "AekKanopan", 0],
  
  ["AekKanopan", "Rantauprapat", 0],
  ["Rantauprapat", "Kotapinang", 0],
  ["Kotapinang", "BaganBatu", 0],

  // --- CABANG 5: JALUR LINTAS TENGAH (Via Danau Toba & Tapsel) ---
  ["Tebing", "Pematangsiantar", 46],
  ["Pematangsiantar", "Prapat", 0],
  ["Prapat", "Porsea", 0],
  
  // SHORTCUT MAUT (Porsea tembus langsung ke Ulak Medan)
  ["Porsea", "UlakMedan", 0], 
  
  ["Porsea", "Balige", 0],
  ["Balige", "Tarutung", 0], 
  ["Tarutung", "Sibolga", 0], // Buntu
  ["Tarutung", "Padangsidimpuan", 0],
  ["Sibolga", "Padangsidimpuan", 88],
  
  // Lintas Tengah ke Riau (Padangsidimpuan -> Riau Selatan)
  ["Padangsidimpuan", "GunungTua", 0],
  ["GunungTua", "PasirPengarayan", 0],
  ["PasirPengarayan", "Bangkinang", 0],

  // --- CABANG 6: AREA RIAU UTARA (Lintas Timur Lanjutan) ---
  ["BaganBatu", "UjungTanjung", 0],
  ["UjungTanjung", "Dumai", 0], // Memecah ke Dumai
  ["UjungTanjung", "Duri", 0],  // Memecah ke Duri
  ["Dumai", "Duri", 78],        // Tol penghubung
  ["Duri", "Kandis", 0],
  ["Kandis", "Minas", 0],

  // --- CABANG 7: PERTEMUAN AKHIR DI PEKANBARU ---
  ["Minas", "Pekanbaru", 0],      // Jalur Lintas Utama (Lurus)
  ["Minas", "Perawang", 0],       // Belok ke jalur industri
  ["Perawang", "Pekanbaru", 0],   // Tembus Pekanbaru via PT SIR / Maredan
  ["Perawang", "Siak", 0],        // Akses menuju Siak (Buntu)

  ["Bangkinang", "Pekanbaru", 0], // Pertemuan dari Lintas Tengah
];

function buildAdjacency() {
  const adj = {};
  for (const name in NODES) adj[name] = [];
  for (const [a, b, w] of EDGES) {
    adj[a].push({ to: b, weight: w });
    adj[b].push({ to: a, weight: w });
  }
  return adj;
}

function pathDistance(path) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = EDGES.find(
      ([a, b]) =>
        (a === path[i] && b === path[i + 1]) ||
        (b === path[i] && a === path[i + 1])
    );
    if (edge) total += edge[2];
  }
  return total;
}
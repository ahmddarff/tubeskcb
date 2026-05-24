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
  Minas:              { lat: 0.74261, lon: 101.45234 },

  // === CABANG 7: AREA RIAU TENGAH & PEKANBARU SEKITARNYA ===
  PasirPengarayan:    { lat: 0.86198, lon: 100.2955 },
  Bangkinang:         { lat: 0.34135, lon: 101.02795 },
  Perawang:           { lat: 0.67343, lon: 101.59322 },
  Pekanbaru:          { lat: 0.50706, lon: 101.44777 },
  Siak:               { lat: 0.81188, lon: 101.79796 }, // Cabang Buntu
};

// [kotaA, kotaB, jarak_km] — graf tidak berarah
const EDGES = [
  // --- AWALAN DARI MEDAN ---
  ["Medan", "PancurBatu", 17.4], // Membuka jalur Pegunungan
  ["Medan", "LubukPakam", 36.8], // Membuka jalur Lintas Timur

  // --- CABANG 2: JALUR PEGUNUNGAN KARO ---
  ["PancurBatu", "Berastagi", 47.6],
  ["Berastagi", "Kabanjahe", 9.8],
  ["Kabanjahe", "Merek", 28.6],
  ["Merek", "Saribudolok", 16.2],
  // Tembusan dari gunung ke lintas tengah:
  ["Saribudolok", "Pematangsiantar", 62.5],
  ["Saribudolok", "Prapat", 66.1],

  // --- CABANG 3: PERCABANGAN PAKAM - TEBING TINGGI ---
  // Sub-jalur 3A: Pesisir / Tol
  ["LubukPakam", "Perbaungan", 11],
  ["Perbaungan", "SeiRampah", 27],
  ["SeiRampah", "Tebing", 21.2],
  // Sub-jalur 3B: Dalam / Perkebunan
  ["LubukPakam", "Galang", 16.9],
  ["Galang", "DolokMasihul", 22.3],
  ["DolokMasihul", "Tebing", 19.8],
  
  // --- CABANG 4: JALUR PESISIR ASAHAN & LABUHANBATU ---
  ["Tebing", "Indrapura", 41.8],
  ["Indrapura", "LimaPuluh", 18.3],
  ["LimaPuluh", "Kisaran", 45.5],
  ["Kisaran", "TanjungBalai", 22.7], // Buntu
  
  // Detail Kisaran -> Aek Kanopan via Simpang Ampat
  ["Kisaran", "SimpangAmpat", 15.5],
  ["SimpangAmpat", "UlakMedan", 29.6],
  ["UlakMedan", "AekKanopan", 22.3],
  
  ["AekKanopan", "Rantauprapat", 71.9],
  ["Rantauprapat", "Kotapinang", 54.3],
  ["Kotapinang", "BaganBatu", 52.1],

  // --- CABANG 5: JALUR LINTAS TENGAH (Via Danau Toba & Tapsel) ---
  ["Tebing", "Pematangsiantar", 45.8],
  ["Pematangsiantar", "Prapat", 48.8],
  ["Prapat", "Porsea", 41.1],
  
  // SHORTCUT MAUT (Porsea tembus langsung ke Ulak Medan)
  ["Porsea", "UlakMedan", 88.7], 
  
  ["Porsea", "Balige", 24.9],
  ["Balige", "Tarutung", 52.3], 
  ["Tarutung", "Sibolga", 64.5], // Buntu
  ["Tarutung", "Padangsidimpuan", 104],
  ["Sibolga", "Padangsidimpuan", 88.2],
  
  // Lintas Tengah ke Riau (Padangsidimpuan -> Riau Selatan)
  ["Padangsidimpuan", "GunungTua", 62.8],
  ["GunungTua", "PasirPengarayan", 170],
  ["PasirPengarayan", "Bangkinang", 121],

  // --- CABANG 6: AREA RIAU UTARA (Lintas Timur Lanjutan) ---
  ["BaganBatu", "UjungTanjung", 104],
  ["UjungTanjung", "Dumai", 48], // Memecah ke Dumai
  ["UjungTanjung", "Duri", 55.8],  // Memecah ke Duri
  ["Dumai", "Duri", 74.4],        // Tol penghubung
  ["Duri", "Kandis", 58.7],
  ["Kandis", "Minas", 65.4],

  // --- CABANG 7: PERTEMUAN AKHIR DI PEKANBARU ---
  ["Minas", "Pekanbaru", 29.9],      // Jalur Lintas Utama (Lurus)
  ["Minas", "Perawang", 24.8],       // Belok ke jalur industri
  ["Perawang", "Pekanbaru", 39.5],   // Tembus Pekanbaru via PT SIR / Maredan
  ["Perawang", "Siak", 52],        // Akses menuju Siak (Buntu)

  ["Bangkinang", "Pekanbaru", 65.9], // Pertemuan dari Lintas Tengah
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
/**
 * graph.js
 * Data graf kota-kota di Sumatera beserta jarak antar kota (km)
 * Studi kasus: Rute darat Medan → Palembang
 */

const NODES = {
  Medan:              { x: 0.13, y: 0.07, lat: 3.59519,  lon: 98.67222 },
  Tebing:             { x: 0.22, y: 0.18, lat: 3.32628,  lon: 99.15668 },
  Kisaran:            { x: 0.14, y: 0.25, lat: 2.98316,  lon: 99.62787 },
  Pematangsiantar:    { x: 0.30, y: 0.13, lat: 2.96514,  lon: 99.06263 },
  Rantauprapat:       { x: 0.18, y: 0.35, lat: 2.10084,  lon: 99.82878 },
  Padangsidimpuan:    { x: 0.10, y: 0.42, lat: 1.37218,  lon: 99.27301 },
  Sibolga:            { x: 0.03, y: 0.38, lat: 1.74061,  lon: 98.78234 },
  Pekanbaru:          { x: 0.42, y: 0.40, lat: 0.50706,  lon: 101.44777 },
  Duri:               { x: 0.36, y: 0.32, lat: 1.25961,  lon: 101.21309 },
  Dumai:              { x: 0.38, y: 0.20, lat: 1.66663,  lon: 101.40018 },
  Bukittinggi:        { x: 0.22, y: 0.56, lat: -0.30391, lon: 100.38347 },
  Padang:             { x: 0.09, y: 0.62, lat: -0.94804, lon: 100.36309 },
  Solok:              { x: 0.24, y: 0.63, lat: -0.78853, lon: 100.65498 },
  Muarabungo:         { x: 0.42, y: 0.62, lat: -1.48327, lon: 102.11692 },
  Jambi:              { x: 0.52, y: 0.68, lat: -1.61012, lon: 103.61312 },
  Curup:              { x: 0.33, y: 0.74, lat: -3.47407, lon: 102.52119 },
  Lubuklinggau:       { x: 0.28, y: 0.80, lat: -3.29958, lon: 102.85723 },
  Lahat:              { x: 0.36, y: 0.84, lat: -3.78562, lon: 103.54079 },
  Muaraenim:          { x: 0.44, y: 0.86, lat: -3.66322, lon: 103.77816 },
  Prabumulih:         { x: 0.50, y: 0.90, lat: -3.42137, lon: 104.24368 },
  Palembang:          { x: 0.60, y: 0.93, lat: -2.97607, lon: 104.77543 },
};

// [kotaA, kotaB, jarak_km] — graf tidak berarah
const EDGES = [
  ["Medan", "Tebing", 83],
  ["Medan", "Pematangsiantar", 125],
  ["Tebing", "Kisaran", 87],
  ["Tebing", "Pematangsiantar", 46],
  ["Kisaran", "Rantauprapat", 125],
  ["Pematangsiantar", "Rantauprapat", 217],
  ["Rantauprapat", "Padangsidimpuan", 164],
  ["Rantauprapat", "Duri", 249],
  ["Padangsidimpuan", "Sibolga", 88],
  ["Padangsidimpuan", "Bukittinggi", 290],
  ["Sibolga", "Bukittinggi", 378],
  ["Duri", "Pekanbaru", 111],
  ["Duri", "Dumai", 78],
  ["Pekanbaru", "Bukittinggi", 212],
  ["Pekanbaru", "Muarabungo", 349],
  ["Pekanbaru", "Jambi", 458],
  ["Bukittinggi", "Padang", 97],
  ["Bukittinggi", "Solok", 74],
  ["Solok", "Muarabungo", 228],
  ["Solok", "Padang", 58],
  ["Muarabungo", "Jambi", 243],
  ["Muarabungo", "Curup", 344],
  ["Jambi", "Palembang", 269],
  ["Jambi", "Muaraenim", 331],
  ["Curup", "Lubuklinggau", 56],
  ["Curup", "Lahat", 187],
  ["Lubuklinggau", "Lahat", 152],
  ["Lubuklinggau", "Muaraenim", 182],
  ["Lahat", "Muaraenim", 43],
  ["Muaraenim", "Prabumulih", 85],
  ["Muaraenim", "Palembang", 188],
  ["Prabumulih", "Palembang", 112],
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
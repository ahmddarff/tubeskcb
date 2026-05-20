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
  ["Medan", "Tebing", 78],
  ["Medan", "Pematangsiantar", 128],
  ["Tebing", "Kisaran", 94],
  ["Tebing", "Pematangsiantar", 73],
  ["Kisaran", "Rantauprapat", 115],
  ["Pematangsiantar", "Rantauprapat", 142],
  ["Rantauprapat", "Padangsidimpuan", 142],
  ["Rantauprapat", "Duri", 238],
  ["Padangsidimpuan", "Sibolga", 90],
  ["Padangsidimpuan", "Bukittinggi", 250],
  ["Sibolga", "Bukittinggi", 260],
  ["Duri", "Pekanbaru", 130],
  ["Duri", "Dumai", 120],
  ["Pekanbaru", "Bukittinggi", 168],
  ["Pekanbaru", "Muarabungo", 280],
  ["Pekanbaru", "Jambi", 340],
  ["Bukittinggi", "Padang", 90],
  ["Bukittinggi", "Solok", 76],
  ["Solok", "Muarabungo", 260],
  ["Solok", "Padang", 60],
  ["Muarabungo", "Jambi", 200],
  ["Muarabungo", "Curup", 225],
  ["Jambi", "Palembang", 340],
  ["Jambi", "Muaraenim", 295],
  ["Curup", "Lubuklinggau", 90],
  ["Curup", "Lahat", 120],
  ["Lubuklinggau", "Lahat", 100],
  ["Lubuklinggau", "Muaraenim", 170],
  ["Lahat", "Muaraenim", 120],
  ["Muaraenim", "Prabumulih", 90],
  ["Muaraenim", "Palembang", 180],
  ["Prabumulih", "Palembang", 100],
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
/**
 * graph.js
 * Data graf kota-kota di Sumatera beserta jarak antar kota (km)
 * Studi kasus: Rute darat Medan → Palembang
 */

const NODES = {
  Medan:              { lat: 3.59519,  lon: 98.67222 },
  Tebing:             { lat: 3.32628,  lon: 99.15668 },
  Kisaran:            { lat: 2.98316,  lon: 99.62787 },
  Pematangsiantar:    { lat: 2.96514,  lon: 99.06263 },
  Rantauprapat:       { lat: 2.10084,  lon: 99.82878 },
  Padangsidimpuan:    { lat: 1.37218,  lon: 99.27301 },
  Sibolga:            { lat: 1.74061,  lon: 98.78234 },
  Pekanbaru:          { lat: 0.50706,  lon: 101.44777 },
  Duri:               { lat: 1.25961,  lon: 101.21309 },
  Dumai:              { lat: 1.66663,  lon: 101.40018 },
  Bukittinggi:        { lat: -0.30391, lon: 100.38347 },
  Padang:             { lat: -0.94804, lon: 100.36309 },
  Solok:              { lat: -0.78853, lon: 100.65498 },
  Muarabungo:         { lat: -1.48327, lon: 102.11692 },
  Jambi:              { lat: -1.61012, lon: 103.61312 },
  Curup:              { lat: -3.47407, lon: 102.52119 },
  Lubuklinggau:       { lat: -3.29958, lon: 102.85723 },
  Lahat:              { lat: -3.78562, lon: 103.54079 },
  Muaraenim:          { lat: -3.66322, lon: 103.77816 },
  Prabumulih:         { lat: -3.42137, lon: 104.24368 },
  Palembang:          { lat: -2.97607, lon: 104.77543 },

  PancurBatu:         { lat: 0, lon: 0 },
  Berastagi:          { lat: 0, lon: 0 },
  Kabanjahe:          { lat: 0, lon: 0 },
  Indrapura:          { lat: 0, lon: 0 },
  Prapat:             { lat: 0, lon: 0 },
  Porsea:             { lat: 0, lon: 0 },
  Balige:             { lat: 0, lon: 0 },
  Tarutung:           { lat: 0, lon: 0 },
  BaganBatu:          { lat: 0, lon: 0 },
  Kandis:             { lat: 0, lon: 0 },
  TelukKuantan:       { lat: 0, lon: 0 },
};

// [kotaA, kotaB, jarak_km] — graf tidak berarah
const EDGES = [
  ["Medan", "Tebing", 83],
  ["Medan", "Pematangsiantar", 125],
  ["Tebing", "Kisaran", 87],
  ["Tebing", "Pematangsiantar", 46],
  ["Rantauprapat", "BaganBatu", 0],
  ["BaganBatu", "Duri", 0],  
  ["Rantauprapat", "Padangsidimpuan", 164],
  
  ["Padangsidimpuan", "Sibolga", 88],
  ["Padangsidimpuan", "Bukittinggi", 290],
  ["Sibolga", "Bukittinggi", 378],
  
  ["Duri", "Kandis", 0],
  ["Kandis", "Pekanbaru", 0],
  ["Duri", "Dumai", 78],
  ["Pekanbaru", "Bukittinggi", 212],
  ["Pekanbaru", "TelukKuantan", 0],
  ["TelukKuantan", "Muarabungo", 0],
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

  ["Medan", "PancurBatu", 0],
  ["PancurBatu", "Berastagi", 0],
  ["Berastagi", "Kabanjahe", 0],
  
  ["Tebing", "Indrapura", 0],
  ["Indrapura", "Kisaran", 0],
  
  ["Kisaran", "Rantauprapat", 0],
  
  ["Pematangsiantar", "Prapat", 0],
  ["Prapat", "Porsea", 0],
  ["Porsea", "Balige", 0],
  ["Balige", "Tarutung", 0], 
  ["Tarutung", "Sibolga", 0],
  ["Tarutung", "Padangsidimpuan", 0],
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
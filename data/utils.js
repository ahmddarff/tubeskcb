/**
 * utils.js
 * Fungsi utilitas yang dipakai bersama oleh semua algoritma.
 */

/**
 * Menghitung jarak garis lurus (as-the-crow-flies) antara dua kota
 * menggunakan formula Haversine berdasarkan koordinat lat/lon.
 *
 * Digunakan sebagai HEURISTIC h(n) pada A* dan Hill Climbing.
 * Bersifat admissible: jarak lurus ≤ jarak jalan → A* tetap optimal.
 *
 * @param {string} cityA
 * @param {string} cityB
 * @param {Object} nodes - objek NODES dari graph.js
 * @returns {number} jarak dalam km
 */
function haversine(cityA, cityB, nodes) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const lat1 = nodes[cityA].lat, lon1 = nodes[cityA].lon;
  const lat2 = nodes[cityB].lat, lon2 = nodes[cityB].lon;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Format array jalur jadi string yang mudah dibaca
 * @param {string[]} path
 * @returns {string}
 */
function formatPath(path) {
  return path.join(" → ");
}
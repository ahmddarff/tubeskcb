/**
 * hillclimbing.js — Hill Climbing (Steepest-Ascent)
 * ============================================================
 * Algoritma pencarian lokal berbasis greedy.
 * Setiap langkah memilih tetangga yang PALING DEKAT ke tujuan
 * berdasarkan heuristic Haversine.
 *
 * KARAKTERISTIK:
 *  - Complete   : ❌ Bisa terjebak di local optimum / dead end
 *  - Optimal    : ❌ Tidak menjamin jalur terpendek
 *  - Time       : O(V × branching_factor)
 *  - Space      : O(1) — hanya simpan posisi saat ini (sangat efisien)
 *
 * MASALAH UMUM:
 *  - Local maximum : semua tetangga lebih buruk dari posisi saat ini
 *  - Plateau       : tetangga memiliki heuristic yang sama
 *  - Dead end      : tidak ada tetangga yang belum dikunjungi
 *
 * CARA KERJA:
 *  1. Mulai dari node start
 *  2. Hitung h(n) semua tetangga yang belum dikunjungi
 *  3. Pilih tetangga dengan h terkecil (paling dekat ke goal)
 *  4. Pindah ke sana
 *  5. Ulangi hingga goal tercapai atau terjebak
 * ============================================================
 *
 * @param {string}   start - kota asal
 * @param {string}   goal  - kota tujuan
 * @param {Object}   adj   - adjacency list
 * @param {Object}   nodes - NODES dari graph.js
 * @param {Function} hFn   - fungsi heuristic(cityA, cityB, nodes) → number
 * @returns {{
 *   path: string[],
 *   visited: string[],
 *   explored: number,
 *   found: boolean,
 *   stuckAt: string|null
 * }}
 */
function hillClimbing(start, goal, adj, nodes, hFn) {
  let current = start;
  const path = [start];
  const visited = new Set([start]);
  const visitedOrder = [start];
  let stuckAt = null;
  const MAX_STEPS = 200;
  let steps = 0;

  while (current !== goal && steps < MAX_STEPS) {
    steps++;

    // Kumpulkan tetangga yang belum dikunjungi
    const neighbors = adj[current].filter(({ to }) => !visited.has(to));

    if (neighbors.length === 0) {
      // Dead end — tidak ada tetangga yang bisa dijelajahi
      stuckAt = current;
      break;
    }

    // Pilih tetangga dengan heuristic terkecil (greedy)
    neighbors.sort((a, b) => hFn(a.to, goal, nodes) - hFn(b.to, goal, nodes));
    const best = neighbors[0];

    visited.add(best.to);
    visitedOrder.push(best.to);
    path.push(best.to);
    current = best.to;
  }

  const found = current === goal;
  if (!found && !stuckAt) stuckAt = current;

  return {
    path: found ? path : [],
    visited: visitedOrder,
    explored: visitedOrder.length,
    found,
    stuckAt: found ? null : stuckAt,
  };
}
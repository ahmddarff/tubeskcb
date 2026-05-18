/**
 * astar.js — A* Search
 * ============================================================
 * Algoritma pencarian informed menggunakan priority queue.
 * Menggabungkan biaya aktual g(n) dan estimasi heuristic h(n):
 *
 *   f(n) = g(n) + h(n)
 *   g(n) : biaya aktual start → n (total km yang sudah ditempuh)
 *   h(n) : estimasi n → goal (jarak Haversine / garis lurus)
 *
 * KARAKTERISTIK:
 *  - Complete   : ✅ Ya
 *  - Optimal    : ✅ Ya (heuristic Haversine bersifat admissible)
 *  - Time       : O(E log V)
 *  - Space      : O(V)
 *
 * KENAPA HAVERSINE ADMISSIBLE?
 *  Jarak garis lurus selalu ≤ jarak jalan raya,
 *  sehingga h(n) tidak pernah overestimate → A* tetap optimal.
 *
 * CARA KERJA:
 *  1. Inisialisasi open list dengan node start (f=h, g=0)
 *  2. Ambil node dengan f terkecil
 *  3. Jika goal → kembalikan jalur
 *  4. Untuk setiap tetangga: hitung g baru dan f baru
 *  5. Jika lebih baik → masukkan ke open list
 *  6. Ulangi dari langkah 2
 * ============================================================
 *
 * @param {string}   start - kota asal
 * @param {string}   goal  - kota tujuan
 * @param {Object}   adj   - adjacency list
 * @param {Object}   nodes - NODES dari graph.js (untuk koordinat lat/lon)
 * @param {Function} hFn   - fungsi heuristic(cityA, cityB, nodes) → number
 * @returns {{
 *   path: string[],
 *   visited: string[],
 *   explored: number,
 *   found: boolean,
 *   gScores: Object
 * }}
 */
function astar(start, goal, adj, nodes, hFn) {
  // open list: array of { node, f, g, path }
  const openList = [{
    node: start,
    f: hFn(start, goal, nodes),
    g: 0,
    path: [start],
  }];

  // gScore[n] = biaya terbaik yang diketahui dari start ke n
  const gScore = { [start]: 0 };
  const visitedOrder = [];
  const gScores = {};

  while (openList.length > 0) {
    // Ambil node dengan f terkecil
    openList.sort((a, b) => a.f - b.f);
    const { node: current, g, path } = openList.shift();

    visitedOrder.push(current);
    gScores[current] = g;

    // Goal test
    if (current === goal) {
      return {
        path,
        visited: visitedOrder,
        explored: visitedOrder.length,
        found: true,
        gScores,
      };
    }

    // Eksplorasi tetangga
    for (const { to, weight } of adj[current]) {
      const gNew = g + weight;

      if (gNew < (gScore[to] ?? Infinity)) {
        gScore[to] = gNew;
        const h = hFn(to, goal, nodes);
        openList.push({
          node: to,
          f: gNew + h,
          g: gNew,
          path: [...path, to],
        });
      }
    }
  }

  return { path: [], visited: visitedOrder, explored: visitedOrder.length, found: false, gScores };
}
/**
 * dfs.js — Depth-First Search
 * ============================================================
 * Algoritma pencarian berbasis stack (LIFO).
 * Menelusuri graf sedalam mungkin sebelum mundur (backtrack).
 *
 * KARAKTERISTIK:
 *  - Complete   : ✅ Ya (menemukan solusi jika ada)
 *  - Optimal    : ❌ Tidak menjamin jalur terpendek
 *  - Time       : O(V + E)
 *  - Space      : O(V)
 *
 * CARA KERJA:
 *  1. Masukkan node start ke dalam stack
 *  2. Pop node teratas dari stack
 *  3. Jika belum dikunjungi, tandai visited
 *  4. Jika goal → kembalikan jalur
 *  5. Masukkan tetangga yang belum dikunjungi ke stack
 *  6. Ulangi dari langkah 2
 * ============================================================
 *
 * @param {string}   start - kota asal
 * @param {string}   goal  - kota tujuan
 * @param {Object}   adj   - adjacency list dari buildAdjacency()
 * @returns {{
 *   path: string[],
 *   visited: string[],
 *   explored: number,
 *   found: boolean
 * }}
 */
function dfs(start, goal, adj) {
  const visited = new Set();
  const visitedOrder = [];

  // Stack menyimpan [namaNode, jalurMenujuNode]
  const stack = [[start, [start]]];

  while (stack.length > 0) {
    const [current, path] = stack.pop();

    if (visited.has(current)) continue;
    visited.add(current);
    visitedOrder.push(current);

    // Goal test
    if (current === goal) {
      return {
        path,
        visited: visitedOrder,
        explored: visitedOrder.length,
        found: true,
      };
    }

    // Tambahkan tetangga ke stack (dibalik agar urutan konsisten)
    const neighbors = [...adj[current]].reverse();
    for (const { to } of neighbors) {
      if (!visited.has(to)) {
        stack.push([to, [...path, to]]);
      }
    }
  }

  return { path: [], visited: visitedOrder, explored: visitedOrder.length, found: false };
}
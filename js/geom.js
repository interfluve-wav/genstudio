// GenStudio — original 2D geometry helpers (no third-party code).
// Polygon half-plane clipping + a from-scratch Voronoi cell builder.

// Keep points where a*x + b*y + c <= 0 (Sutherland–Hodgman half-plane clip).
function clipPolygonHalfPlane(poly, a, b, c) {
  const out = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const cur = poly[i];
    const nxt = poly[(i + 1) % n];
    const dCur = a * cur[0] + b * cur[1] + c;
    const dNxt = a * nxt[0] + b * nxt[1] + c;
    if (dCur <= 0) out.push(cur);
    if ((dCur <= 0) !== (dNxt <= 0)) {
      const t = dCur / (dCur - dNxt);
      out.push([cur[0] + t * (nxt[0] - cur[0]), cur[1] + t * (nxt[1] - cur[1])]);
    }
  }
  return out;
}

// Voronoi cells via per-site half-plane intersection of the bounding box.
// O(n^2) but fine for a few dozen sites; returns an array of polygons.
function voronoiCells(sites, x0, y0, x1, y1) {
  const cells = [];
  const box = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  for (let i = 0; i < sites.length; i++) {
    let poly = box.map((p) => p.slice());
    const si = sites[i];
    let ok = true;
    for (let j = 0; j < sites.length && ok; j++) {
      if (i === j) continue;
      const sj = sites[j];
      const dx = sj[0] - si[0];
      const dy = sj[1] - si[1];
      // keep points closer to si than sj  ->  a*x + b*y - c <= 0
      const a = 2 * dx;
      const b = 2 * dy;
      const c = (si[0] * si[0] + si[1] * si[1]) - (sj[0] * sj[0] + sj[1] * sj[1]);
      poly = clipPolygonHalfPlane(poly, a, b, c);
      if (poly.length < 3) ok = false;
    }
    if (poly.length >= 3) cells.push(poly);
  }
  return cells;
}

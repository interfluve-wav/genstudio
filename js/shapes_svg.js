// GenStudio — original SVG "glyph" shape set (19 forms, original path math).
// Inspired by FLAKE's chart vocabulary but every path is computed here, not copied.
// Each entry: function(W) -> array of [x,y] points (normalized ~0..W), closed.
// These render as vector glyphs and export cleanly to SVG.

const GLYPHS = {
  square: (s) => [[0, 0], [s, 0], [s, s], [0, s]],
  circle: (s) => ringPath(s / 2, 18),
  oval: (s) => ellipsePath(s / 2, s * 0.58, 20),
  triangle: (s) => [[s / 2, 0], [s, s], [0, s]],
  checker: (s) => {
    const c = s / 4, o = [];
    for (let gy = 0; gy < 4; gy++) for (let gx = 0; gx < 4; gx++)
      if ((gx + gy) % 2 === 0) o.push([[gx * c, gy * c], [(gx + 1) * c, gy * c], [(gx + 1) * c, (gy + 1) * c], [gx * c, (gy + 1) * c]]);
    return o; // multi-subpath
  },
  quadcircle: (s) => { const h = s / 2; return [dot(h / 2), dot(h / 2 + h), dot(h / 2, h / 2 + h), dot(h / 2 + h, h / 2 + h)]; },
  threedots: (s) => { const a = s / 4; return [[[s / 2, a]], [[a, s * 0.66]], [[s - a, s * 0.66]]].map(d => dot(d[0][0], d[0][1], a)); },
  cross: (s) => {
    const t = s * 0.32;
    return [[[t, 0], [s - t, 0], [s - t, t], [s, t], [s, s - t], [s - t, s - t], [s - t, s], [t, s], [t, s - t], [0, s - t], [0, t], [t, t]]];
  },
  clips: (s) => { const t = s * 0.22; return [[[t, s * 0.7], [0, s * 0.7], [0, s * 0.45], [t, s * 0.45]], [[s * 0.45, s], [s * 0.45, s * 0.7 - t], [s * 0.7, s * 0.7 - t], [s * 0.7, s]]]; },
  pinholehex: (s) => { const r = s / 2; const hex = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 6; hex.push([s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r]); } return [hex]; },
  star: (s) => starPath(s / 2, s / 2, s / 2, s / 5, 5),
  heart: (s) => heartPath(s),
  spark: (s) => [[[s / 2, 0], [s / 2 + s * 0.13, s / 2 - s * 0.13], [s, s / 2], [s / 2 + s * 0.13, s / 2 + s * 0.13], [s / 2, s], [s / 2 - s * 0.13, s / 2 + s * 0.13], [0, s / 2], [s / 2 - s * 0.13, s / 2 - s * 0.13]]],
  flash: (s) => {
    // lightning bolt
    return [[[s * 0.55, 0], [s * 0.3, s * 0.55], [s * 0.5, s * 0.55], [s * 0.42, s], [s * 0.75, s * 0.42], [s * 0.52, s * 0.42], [s * 0.62, 0]]];
  },
  arrow: (s) => {
    const w = s * 0.3;
    return [[[0, s / 2 - w / 2], [s - w, s / 2 - w / 2], [s - w, s * 0.15], [s, s / 2], [s - w, s * 0.85], [s - w, s / 2 + w / 2], [0, s / 2 + w / 2]]];
  },
  flower: (s) => {
    const cx = s / 2, cy = s / 2, petals = 6, R = s / 2, r = s / 5; const pts = [];
    for (let i = 0; i < petals * 2; i++) { const a = Math.PI * i / petals; const rad = i % 2 ? r : R; pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); }
    return [pts];
  },
  flake: (s) => {
    // 6-fold crystal: central hex + 6 arms
    const cx = s / 2, cy = s / 2, L = s / 2; const out = [];
    const hex = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i; hex.push([cx + Math.cos(a) * L * 0.28, cy + Math.sin(a) * L * 0.28]); } out.push(hex);
    for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 2; const x1 = cx + Math.cos(a) * L * 0.28, y1 = cy + Math.sin(a) * L * 0.28; const x2 = cx + Math.cos(a) * L, y2 = cy + Math.sin(a) * L; const mx = (x1 + x2) / 2 + Math.cos(a + Math.PI / 2) * L * 0.12, my = (y1 + y2) / 2 + Math.sin(a + Math.PI / 2) * L * 0.12; out.push([[x1, y1], [mx, my], [x2, y2]]); }
    return out;
  },
  diamond: (s) => [[[s / 2, 0], [s, s / 2], [s / 2, s], [0, s / 2]]],
  pentagon: (s) => polyPath(s / 2, s / 2, s / 2, 5, -Math.PI / 2),
  hexagon: (s) => polyPath(s / 2, s / 2, s / 2, 6, -Math.PI / 2),
};

// helpers
function ringPath(r, n) { const o = []; for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n; o.push([r + Math.cos(a) * r, r + Math.sin(a) * r]); } return [o]; }
function ellipsePath(rx, ry, n) { const o = []; for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n; o.push([rx + Math.cos(a) * rx, ry + Math.sin(a) * ry]); } return [o]; }
function dot(cx, cy, r = 0) { return ringPath(r || cx / 2, 14); }
function starPath(cx, cy, R, r, n) { const o = []; for (let i = 0; i < n * 2; i++) { const a = Math.PI * i / n - Math.PI / 2; const rad = i % 2 ? r : R; o.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); } return [o]; }
function polyPath(cx, cy, r, n, off) { const o = []; for (let i = 0; i < n; i++) { const a = off + Math.PI * 2 * i / n; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return [o]; }
function heartPath(s) { const o = []; for (let t = 0; t <= Math.PI * 2; t += 0.18) { const x = 16 * Math.pow(Math.sin(t), 3); const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); o.push([s / 2 + x * s / 32, s / 2 - y * s / 32]); } return [o]; }

function emitGlyph(scene, name, x, y, size, rot, col, filled) {
  const raw = GLYPHS[name] ? GLYPHS[name](size) : GLYPHS.circle(size);
  const subpaths = Array.isArray(raw[0][0]) ? raw : [raw];
  const cos = Math.cos(rot), sin = Math.sin(rot);
  for (const sp of subpaths) {
    const pts = sp.map(([px, py]) => {
      const dx = px - size / 2, dy = py - size / 2;
      return [x + dx * cos - dy * sin, y + dx * sin + dy * cos];
    });
    if (filled) scene.push({ t: "poly", pts, fill: col, cx: x, cy: y });
    else scene.push({ t: "polyline", pts, stroke: col, w: 1.2, cx: x, cy: y });
  }
}

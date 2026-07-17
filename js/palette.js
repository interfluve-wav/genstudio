// GenStudio — original procedural palette generator (color-harmony aware).
// Returns an array of RGBA tuples {r,g,b,a} (0-255 / a 0-1) so p5 never has to
// parse an hsla() string (p5 1.11.2 mis-parses hsla() as white).

function hslToRgb(h, s, l) {
  // h: 0-360, s/l: 0-100
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function genHue(base, mode, i) {
  base = ((base % 360) + 360) % 360;
  if (!mode || mode === "golden") return (base + i * 137.50776) % 360;
  const offsets = {
    analogous: [0, 30, -30, 60, -60, 15, -15, 45],
    triadic: [0, 120, 240, 60, 180, 300, 30, 210],
    complementary: [0, 180, 15, 195, 30, 210, 165, 345],
    tetradic: [0, 90, 180, 270, 45, 135, 225, 315],
  }[mode] || [0];
  const h = (base + offsets[i % offsets.length]) % 360;
  return h < 0 ? h + 360 : h;
}

function generatePalette(rng, baseHue, count, mode, alpha) {
  const a = alpha === undefined ? 0.92 : alpha;
  const out = [];
  for (let i = 0; i < count; i++) {
    const h = genHue(baseHue, mode, i);
    const s = rngRange(rng, 55, 92);
    const l = rngRange(rng, 42, 74);
    const [r, g, b] = hslToRgb(h, s, l);
    out.push({ r, g, b, a });
  }
  return out;
}

// CSS string for SVG / DOM (never fed to p5.fill)
function cssOf(c) {
  if (typeof c === "string") return c;
  return `rgba(${c.r},${c.g},${c.b},${(+c.a).toFixed(3)})`;
}

// p5 fill/stroke from a tuple (numbers -> no string parsing bug)
function p5Fill(g, c, fallback) {
  if (!c) { g.noFill(); return; }
  if (typeof c === "string") { g.fill(c); return; }
  g.fill(c.r, c.g, c.b, c.a * 255);
}
function p5Stroke(g, c, w) {
  if (!c) { g.noStroke(); return; }
  if (typeof c === "string") { g.stroke(c); if (w) g.strokeWeight(w); return; }
  g.stroke(c.r, c.g, c.b, c.a * 255);
  g.strokeWeight(w || 1);
}

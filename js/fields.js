// GenStudio — original distortion/blend/easing fields (FLAKE-inspired, from scratch).

// Easing functions (returns 0..1)
const EASE = {
  "none": (t) => t,
  "Linear": (t) => t,
  "Sine In": (t) => 1 - Math.cos((t * Math.PI) / 2),
  "Sine Out": (t) => Math.sin((t * Math.PI) / 2),
  "Sine In Out": (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  "Quad In": (t) => t * t,
  "Quad Out": (t) => 1 - (1 - t) * (1 - t),
  "Quad In Out": (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  "Cubic In": (t) => t * t * t,
  "Cubic Out": (t) => 1 - Math.pow(1 - t, 3),
  "Cubic In Out": (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  "Expo In": (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  "Expo Out": (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  "Expo In Out": (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  "Circ In": (t) => 1 - Math.sqrt(1 - t * t),
  "Circ Out": (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  "Circ In Out": (t) => (t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2),
};

// Canvas2D globalCompositeOperation names (FLAKE's blend vocabularies)
const BLEND = {
  "Normal": "source-over",
  "XOR": "xor",
  "Lighter": "lighter",
  "Multiply": "multiply",
  "Screen": "screen",
  "Overlay": "overlay",
  "Darken": "darken",
  "Lighten": "lighten",
  "Color Dodge": "color-dodge",
  "Color Burn": "color-burn",
  "Hard Light": "hard-light",
  "Soft Light": "soft-light",
  "Exclusion": "exclusion",
  "Difference": "difference",
};

// Frequency displacement field: pushes a point along sin/cos of layered noise.
function freqDisplace(x, y, rng) {
  const m = state.freqMode === "cos" ? Math.cos : Math.sin;
  let dx = 0, dy = 0;
  for (let l = 0; l < state.freqLayers; l++) {
    const scale = state.freqBase * (1 + l * 0.6);
    const n1 = noise(x * scale * 0.01 + l, y * scale * 0.01, state.seed * 0.01 + l);
    const n2 = noise(y * scale * 0.01 + l, x * scale * 0.01, state.seed * 0.01 + l + 5);
    dx += m(n1 * Math.PI * 2) * state.freqAmp * 60;
    dy += m(n2 * Math.PI * 2) * state.freqAmp * 60;
  }
  return [dx, dy];
}

// Swirl: rotate positions around center by a radial amount.
function swirlDisplace(x, y, cx, cy) {
  if (state.swirlMode === "none") return [x, y];
  const dx = x - cx, dy = y - cy;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  const ang = (state.swirlMode === "rotary" ? state.swirlBase : Math.sin(d * state.swirlFreq * 0.02)) * state.swirlAmp;
  const a = ang + Math.atan2(dy, dx);
  const nd = state.swirlMode === "wave" ? d * (1 + state.swirlBase * 0.2) : d;
  return [cx + Math.cos(a) * nd, cy + Math.sin(a) * nd];
}

// Apply both fields; used by emitters that honor distortion.
function distort(x, y) {
  const cx = state.size / 2, cy = state.size / 2;
  let [sx, sy] = swirlDisplace(x, y, cx, cy);
  if (state.freqMode !== "none") {
    const [dx, dy] = freqDisplace(sx, sy);
    sx += dx; sy += dy;
  }
  return [sx, sy];
}

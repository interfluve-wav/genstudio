// GenStudio — original generative engine (rewritten to emit a vector scene).
// The scene is a flat list of primitives; renderCanvas() draws them, exportSVG()
// serializes the same list. This guarantees the PNG and SVG match pixel-for-pixel.

const state = {
  seed: 12345,
  composition: "symmetric", // symmetric | flowfield | truchet | voronoi | glyphfield
  symmetry: 12,
  mirror: true,
  shapeMode: "petals",
  layers: 8,
  perRing: 14,
  noiseScale: 0.45,
  noiseAmp: 0.5,
  rotation: 0,
  // background
  bgLight: false,
  transparent: false,
  // color
  colorType: "palette", // solid | palette | paletteSeq | paletteTrans
  baseHue: 200,
  harmony: "golden",
  blend: "Normal",
  paletteIndex: 0,
  paletteSpeed: 0.5,
  // animation / motion
  motion: "spin", // spin | bloom | swirl | pulse | flow | breathe | ripple | chaos
  motionFrames: 60,
  motionFps: 24,
  // glyph set
  glyph: "star",
  glyphFill: true,
  glyphCount: 1800,
  glyphScale: 2.4,
  glyphScalePow: 1.4,
  glyphEase: "Linear",
  // flow field
  flowGrid: 56,
  flowWeight: 2,
  // truchet
  truchetTiles: 14,
  truchetWeight: 3,
  // voronoi
  voronoiSites: 44,
  // frequency / swirl distortion
  freqMode: "none", // none | sin | cos
  freqLayers: 8,
  freqBase: 0.4,
  freqAmp: 0.5,
  swirlMode: "none", // none | wave | rotary
  swirlBase: 0.3,
  swirlAmp: 0.4,
  swirlFreq: 0.25,
  // tiled pattern
  patternCells: 1,
  patternOffset: 0,
  patternRotate: 0,
  // canvas aspect ratio
  ratioW: 1,
  ratioH: 1,
  // image mask
  maskMode: "none", // none | image | threshold
  maskThreshold: 0.5,
  maskInvert: false,
  maskBright: 0,
  maskContrast: 1,
  maskImage: null, // {data: Uint8ClampedArray, w, h}
  // output
  size: 1024,
  palette: [],
};

let gRng = makeRNG(state.seed);
let gScene = [];

function canvasW() { const g = Math.max(state.ratioW, state.ratioH) || 1; return Math.round(state.size * state.ratioW / g); }
function canvasH() { const g = Math.max(state.ratioW, state.ratioH) || 1; return Math.round(state.size * state.ratioH / g); }

function reseed() {
  gRng = makeRNG(state.seed);
  gScene = [];
  state.palette = buildPalette(gRng);
}

// Build the working palette based on colorType.
function buildPalette(rng) {
  if (state.colorType === "solid") {
    const [r, g, b] = hslToRgb(((state.baseHue % 360) + 360) % 360, 70, 58);
    return [{ r, g, b, a: 0.92 }];
  }
  if (state.colorType === "palette" || state.colorType === "paletteSeq" || state.colorType === "paletteTrans") {
    // pull the user's FLAKE palette library entry
    const lib = (typeof PALETTES !== "undefined" && PALETTES.length) ? PALETTES : null;
    const p = lib ? lib[state.paletteIndex % lib.length] : null;
    if (p && p.length) {
      return p.map((hex) => {
        const h = hex.replace("#", "");
        return { r: parseInt(h.substr(0, 2), 16), g: parseInt(h.substr(2, 2), 16), b: parseInt(h.substr(4, 2), 16), a: 0.92 };
      });
    }
    // fallback to procedural harmony if library missing
    return generatePalette(rng, state.baseHue, 6, state.harmony);
  }
  return generatePalette(rng, state.baseHue, 6, state.harmony);
}

// Color for primitive idx (of total) at animation time t (0..1).
// Named motion presets: given t in 0..1, set state._t and transform scene params.
const MOTION_PRESETS = {
  spin: (t) => { state._t = t; state.rotation = t * Math.PI * 2; },
  bloom: (t) => { state._t = t; state.noiseAmp = 0.2 + t * 0.8; state.rotation = t * 0.6; },
  swirl: (t) => { state._t = t; state.swirlMode = "rotary"; state.swirlAmp = 0.2 + t * 0.6; state.rotation = t * Math.PI; },
  pulse: (t) => { state._t = t; state.noiseScale = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2)); state.rotation = t * Math.PI; },
  flow: (t) => { state._t = t; state.freqMode = "sin"; state.freqAmp = 0.3 + t * 0.5; state.rotation = t * Math.PI; },
  breathe: (t) => { state._t = t; const s = 0.7 + 0.5 * Math.sin(t * Math.PI * 2); state.sizeMin = 4 * s; state.sizeMax = 30 * s; state.rotation = t * 0.5; },
  ripple: (t) => { state._t = t; state.swirlMode = "wave"; state.swirlAmp = 0.3 + t * 0.5; state.rotation = t * Math.PI; },
  chaos: (t) => { state._t = t; state.rotation = t * Math.PI * 3; state.noiseAmp = 0.3 + t * 0.7; state.freqMode = "cos"; state.freqAmp = 0.2 + t * 0.6; state.swirlMode = "rotary"; state.swirlAmp = 0.2 + t * 0.5; },
};

function applyMotion(t) {
  const fn = MOTION_PRESETS[state.motion] || MOTION_PRESETS.spin;
  fn(t);
}
function primColor(idx, total, t) {
  const pal = state.palette;
  const n = pal.length;
  if (state.colorType === "solid") return pal[0];
  if (state.colorType === "paletteSeq") {
    const k = Math.floor((idx / Math.max(1, total)) * n) % n;
    return pal[k];
  }
  if (state.colorType === "paletteTrans") {
    const fpos = ((idx / Math.max(1, total)) + (t || 0) * state.paletteSpeed) % 1;
    const fp = fpos * n;
    const a = Math.floor(fp) % n, b = (a + 1) % n, fr = fp - Math.floor(fp);
    const ca = pal[a], cb = pal[b];
    return { r: ca.r + (cb.r - ca.r) * fr, g: ca.g + (cb.g - ca.g) * fr, b: ca.b + (cb.b - ca.b) * fr, a: ca.a };
  }
  return pal[idx % n];
}

// ----------------------------------------------------------------------------
// primitive emitters (used by all compositions)
// ----------------------------------------------------------------------------

function placeSymmetric(scene) {
  const W = canvasW(), H = canvasH();
  const cx = W / 2, cy = H / 2;
  const maxR = W * 0.46;
  const seg = (Math.PI * 2) / state.symmetry;

  for (let layer = 0; layer < state.layers; layer++) {
    const t = state.layers === 1 ? 0.5 : layer / (state.layers - 1);
    const ringR = 20 + t * maxR;
    const col = state.palette[layer % state.palette.length];

    for (let k = 0; k < state.perRing; k++) {
      const u = k / state.perRing;
      const n = noise(layer * state.noiseScale, k * state.noiseScale, state.seed * 0.01);
      const disp = (n - 0.5) * 2 * state.noiseAmp * maxR * 0.4;
      const r = ringR + disp;
      const ang0 = u * seg + (n - 0.5) * seg * 0.6;
      const size = lerp(state.sizeMin || 6, state.sizeMax || 34, n) * (0.6 + t * 0.8);
      const rot = ang0 + state.rotation;

      for (let s = 0; s < state.symmetry; s++) {
        const ang = ang0 + s * seg;
        emitShape(scene, state.shapeMode,
          cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, size, rot, col);
        if (state.mirror) {
          const am = s * seg - (ang0 - s * seg);
          emitShape(scene, state.shapeMode,
            cx + Math.cos(am) * r, cy + Math.sin(am) * r, size, rot, col);
        }
      }
    }
  }
}

function placeFlowField(scene) {
  const W = canvasW(), H = canvasH();
  const cols = state.flowGrid;
  const step = W / cols;
  const col = state.palette[0];
  for (let gx = 0; gx < cols; gx++) {
    for (let gy = 0; gy < cols; gy++) {
      const x = gx * step + step / 2;
      const y = gy * step + step / 2;
      const ang =
        (noise(x * state.noiseScale * 0.01, y * state.noiseScale * 0.01, state.seed * 0.01) +
          state.rotation) *
        Math.PI * 4;
      const len = step * 0.9;
      scene.push({
        t: "line",
        x1: x - (Math.cos(ang) * len) / 2, y1: y - (Math.sin(ang) * len) / 2,
        x2: x + (Math.cos(ang) * len) / 2, y2: y + (Math.sin(ang) * len) / 2,
        stroke: col, w: state.flowWeight,
      });
    }
  }
}

function placeTruchet(scene) {
  const W = canvasW(), H = canvasH();
  const n = state.truchetTiles;
  const tile = W / n;
  const col = state.palette[0];
  const rot = state.rotation;
  for (let gx = 0; gx < n; gx++) {
    for (let gy = 0; gy < n; gy++) {
      const cx = gx * tile + tile / 2;
      const cy = gy * tile + tile / 2;
      const flip = noise(gx * 0.3, gy * 0.3, state.seed * 0.01) + rot;
      const r = tile * 0.5;
      if (flip % 1 > 0.5) {
        scene.push({ t: "arc", x: cx - tile / 2, y: cy - tile / 2, r, a0: 0, a1: Math.PI, stroke: col, w: state.truchetWeight });
        scene.push({ t: "arc", x: cx + tile / 2, y: cy + tile / 2, r, a0: 0, a1: Math.PI, stroke: col, w: state.truchetWeight });
      } else {
        scene.push({ t: "arc", x: cx + tile / 2, y: cy - tile / 2, r, a0: Math.PI / 2, a1: Math.PI * 1.5, stroke: col, w: state.truchetWeight });
        scene.push({ t: "arc", x: cx - tile / 2, y: cy + tile / 2, r, a0: Math.PI / 2, a1: Math.PI * 1.5, stroke: col, w: state.truchetWeight });
      }
    }
  }
}

function placeVoronoi(scene) {
  const W = canvasW(), H = canvasH();
  const pts = [];
  for (let i = 0; i < state.voronoiSites; i++) {
    pts.push([rngRange(gRng, 0, W), rngRange(gRng, 0, W)]);
  }
  const cells = voronoiCells(pts, 0, 0, W, W);
  cells.forEach((cell, i) => {
    const col = state.palette[i % state.palette.length];
    let mxx = 0, myy = 0;
    for (const v of cell) { mxx += v[0]; myy += v[1]; }
    scene.push({ t: "poly", pts: cell, fill: col, cx: mxx / cell.length, cy: myy / cell.length });
    // outline for definition
    scene.push({ t: "polyline", pts: cell, stroke: { r: 0, g: 0, b: 0, a: 0.18 }, w: 1, cx: mxx / cell.length, cy: myy / cell.length });
  });
}

function placeGlyphField(scene) {
  const W = canvasW(), H = canvasH();
  const n = state.glyphCount;
  const ease = EASE[state.glyphEase] || EASE.Linear;
  const cells = Math.max(1, state.patternCells | 0);
  const cell = W / cells;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const nx = rngRange(gRng, 0, 1);
    const ny = rngRange(gRng, 0, 1);
    const cxBase = nx * W;
    const cyBase = ny * W;
    // pattern tiling offset
    let cx = cxBase, cy = cyBase;
    if (cells > 1) {
      const gx = Math.floor(cxBase / cell), gy = Math.floor(cyBase / cell);
      const ox = (state.patternOffset * cell);
      const oy = (state.patternOffset * cell);
      cx = gx * cell + ((cxBase - gx * cell) + ox) % cell;
      cy = gy * cell + ((cyBase - gy * cell) + oy) % cell;
    }
    // apply distortion fields
    const [dx, dy] = distort(cx, cy);
    // scale by eased noise
    const nv = noise(nx * state.noiseScale * 3, ny * state.noiseScale * 3, state.seed * 0.01);
    const ev = ease(nv);
    const size = state.glyphScale * Math.pow(2 + ev * 8, state.glyphScalePow) * (0.5 + 0.5 * ev);
    const rot = state.rotation + state.patternRotate + nv * Math.PI * 2;
    // color by type
    let col;
    if (state.colorType === "color") col = state.palette[0];
    else if (state.colorType === "transition") col = lerpColorIdx(u);
    else col = state.palette[i % state.palette.length];
    emitGlyph(scene, state.glyph, dx, dy, size, rot, col, state.glyphFill);
  }
}

function lerpColorIdx(t) {
  const a = state.palette[Math.floor(t * (state.palette.length - 1))];
  const b = state.palette[Math.min(state.palette.length - 1, Math.floor(t * (state.palette.length - 1)) + 1)];
  const f = (t * (state.palette.length - 1)) % 1;
  return { r: Math.round(a.r + (b.r - a.r) * f), g: Math.round(a.g + (b.g - a.g) * f), b: Math.round(a.b + (b.b - a.b) * f), a: (a.a + (b.a - a.a) * f) };
}

function buildScene() {
  gScene = [];
  switch (state.composition) {
    case "flowfield": placeFlowField(gScene); break;
    case "truchet": placeTruchet(gScene); break;
    case "voronoi": placeVoronoi(gScene); break;
    case "glyphfield": placeGlyphField(gScene); break;
    default: placeSymmetric(gScene);
  }
  // image-mask filter (keeps only primitives inside the silhouette)
  if (state.maskMode !== "none" && gMaskImg) {
    const W = canvasW(), H = canvasH();
    gScene = gScene.filter((p) => {
      const x = p.cx !== undefined ? p.cx : (p.x || (p.x1 + p.x2) / 2);
      const y = p.cy !== undefined ? p.cy : (p.y || (p.y1 + p.y2) / 2);
      return maskKeeps(x, y, W, H);
    });
  }
  // assign colors by index for sequence / transition / solid modes
  const total = gScene.length;
  const t = state._t || 0;
  if (state.colorType === "solid" || state.colorType === "paletteSeq" || state.colorType === "paletteTrans") {
    for (let i = 0; i < total; i++) {
      const c = primColor(i, total, t);
      const p = gScene[i];
      if (p.fill) p.fill = c;
      // recolor strokes that are real palette colors (skip the thin dark outline a=0.18)
      if (p.stroke && typeof p.stroke === "object" && p.stroke.a >= 0.5) p.stroke = c;
    }
  }
}

// ----------------------------------------------------------------------------
// canvas rendering (draws the shared scene)
// ----------------------------------------------------------------------------

function renderCanvas() {
  const W = canvasW(), H = canvasH();
  buildScene();
  if (!state.transparent) background(state.bgLight ? 245 : 18);
  else clear();
  push();
  noStroke();
  const op = BLEND[state.blend] || "source-over";
  drawingContext.globalCompositeOperation = op;
  for (const p of gScene) drawPrimitive(window, p);
  drawingContext.globalCompositeOperation = "source-over";
  pop();
}

function drawToGraphics(pg) {
  const W = canvasW(), H = canvasH();
  buildScene();
  if (!state.transparent) pg.background(state.bgLight ? 245 : 18);
  else pg.clear();
  pg.push(); pg.noStroke();
  const op = BLEND[state.blend] || "source-over";
  pg.drawingContext.globalCompositeOperation = op;
  for (const p of gScene) drawPrimitive(pg, p);
  pg.drawingContext.globalCompositeOperation = "source-over";
  pg.pop();
}
function drawPrimitive(g, p) {
  if (p.t === "circle") {
    p5Fill(g, p.fill);
    p5Stroke(g, p.stroke, p.w);
    if (!p.stroke) g.noStroke();
    g.circle(p.x, p.y, p.r * 2);
  } else if (p.t === "ellipse") {
    g.push(); g.translate(p.x, p.y); g.rotate(p.rot || 0);
    p5Fill(g, p.fill); g.noStroke();
    g.ellipse(0, 0, p.rx * 2, p.ry * 2); g.pop();
  } else if (p.t === "poly") {
    p5Fill(g, p.fill); g.noStroke();
    g.beginShape();
    for (const v of p.pts) g.vertex(v[0], v[1]);
    g.endShape(CLOSE);
  } else if (p.t === "polyline") {
    g.noFill(); p5Stroke(g, p.stroke, p.w);
    g.beginShape(); for (const v of p.pts) g.vertex(v[0], v[1]); g.endShape(CLOSE);
  } else if (p.t === "line") {
    p5Stroke(g, p.stroke, p.w); g.line(p.x1, p.y1, p.x2, p.y2);
  } else if (p.t === "arc") {
    g.noFill(); p5Stroke(g, p.stroke, p.w);
    g.arc(p.x, p.y, p.r * 2, p.r * 2, p.a0, p.a1);
  }
}

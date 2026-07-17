// GenStudio — UI wiring for the control panel (original).

let _uiEls = {};

function setStatus(msg) {
  const s = document.getElementById("status");
  if (s) s.textContent = msg || "";
}

function buildUI() {
  const S = window.GenStudio.state;
  const el = (id) => document.getElementById(id);
  _uiEls = {
    seed: el("seed"), sym: el("sym"), mir: el("mir"), shape: el("shape"),
    lay: el("lay"), per: el("per"), ns: el("ns"), na: el("na"), rot: el("rot"),
    bg: el("bg"), comp: el("comp"), harmony: el("harmony"), baseHue: el("baseHue"),
    flowGrid: el("flowGrid"), flowWeight: el("flowWeight"),
    truchetTiles: el("truchetTiles"), truchetWeight: el("truchetWeight"),
    voronoiSites: el("voronoiSites"), sizeSel: el("sizeSel"),
    presetSel: el("presetSel"), sw: el("sw"),
    glyph: el("glyph"), glyphCount: el("glyphCount"), glyphScale: el("glyphScale"),
    glyphEase: el("glyphEase"), colorType: el("colorType"), blend: el("blend"),
    freqMode: el("freqMode"), freqLayers: el("freqLayers"), freqBase: el("freqBase"), freqAmp: el("freqAmp"),
    swirlMode: el("swirlMode"), swirlBase: el("swirlBase"), swirlAmp: el("swirlAmp"),
    patternCells: el("patternCells"), patternOffset: el("patternOffset"),
    ratio: el("ratio"), maskMode: el("maskMode"), maskImg: el("mask-img"),
    maskThreshold: el("maskThreshold"), maskBright: el("maskBright"), maskContrast: el("maskContrast"), maskInvert: el("maskInvert"),
    paletteIndex: el("paletteIndex"), paletteSpeed: el("paletteSpeed"), motion: el("motion"),
  };

  function bindSlider(e, key, isInt, onChange) {
    e.value = S[key];
    const lab = document.getElementById("v-" + e.id);
    const show = () => { if (lab) lab.textContent = isInt ? S[key] : (+S[key]).toFixed(2); };
    show();
    e.addEventListener("input", () => {
      S[key] = isInt ? parseInt(e.value, 10) : parseFloat(e.value);
      show();
      if (onChange) onChange(); else window.GenStudio.redrawArt();
    });
  }

  bindSlider(_uiEls.seed, "seed", true, () => { window.GenStudio.reseed(); window.GenStudio.redrawArt(); });
  bindSlider(_uiEls.sym, "symmetry", true);
  bindSlider(_uiEls.mir, "mirror", true);
  bindSlider(_uiEls.lay, "layers", true);
  bindSlider(_uiEls.per, "perRing", true);
  bindSlider(_uiEls.ns, "noiseScale", false);
  bindSlider(_uiEls.na, "noiseAmp", false);
  bindSlider(_uiEls.rot, "rotation", false);
  // background select (dark/light/transparent)
  _uiEls.bg.value = S.transparent ? "transparent" : (S.bgLight ? "light" : "dark");
  _uiEls.bg.addEventListener("change", () => {
    const v = _uiEls.bg.value;
    S.transparent = v === "transparent";
    S.bgLight = v === "light";
    window.GenStudio.redrawArt();
  });
  _uiEls.colorType.value = S.colorType;
  _uiEls.colorType.addEventListener("change", () => { S.colorType = _uiEls.colorType.value; window.GenStudio.reseed(); window.GenStudio.redrawArt(); refreshColorPanel(); });
  bindSlider(_uiEls.baseHue, "baseHue", true);
  bindSlider(_uiEls.paletteIndex, "paletteIndex", true, () => { window.GenStudio.reseed(); });
  bindSlider(_uiEls.paletteSpeed, "paletteSpeed", false);
  _uiEls.motion.value = S.motion;
  _uiEls.motion.addEventListener("change", () => { S.motion = _uiEls.motion.value; });
  const pt = document.getElementById("v-paletteTotal");
  if (pt && typeof PALETTES !== "undefined") pt.textContent = PALETTES.length;
  bindSlider(_uiEls.flowGrid, "flowGrid", true);
  bindSlider(_uiEls.flowWeight, "flowWeight", false);
  bindSlider(_uiEls.truchetTiles, "truchetTiles", true);
  bindSlider(_uiEls.truchetWeight, "truchetWeight", false);
  bindSlider(_uiEls.voronoiSites, "voronoiSites", true);
  bindSlider(_uiEls.glyphCount, "glyphCount", true);
  bindSlider(_uiEls.glyphScale, "glyphScale", false);
  bindSlider(_uiEls.freqLayers, "freqLayers", true);
  bindSlider(_uiEls.freqBase, "freqBase", false);
  bindSlider(_uiEls.freqAmp, "freqAmp", false);
  bindSlider(_uiEls.swirlBase, "swirlBase", false);
  bindSlider(_uiEls.swirlAmp, "swirlAmp", false);
  bindSlider(_uiEls.patternCells, "patternCells", true);
  bindSlider(_uiEls.patternOffset, "patternOffset", false);
  bindSlider(_uiEls.maskThreshold, "maskThreshold", false);
  bindSlider(_uiEls.maskBright, "maskBright", false);
  bindSlider(_uiEls.maskContrast, "maskContrast", false);
  bindSlider(_uiEls.maskInvert, "maskInvert", true);

  _uiEls.glyph.value = S.glyph;
  _uiEls.glyph.addEventListener("change", () => { S.glyph = _uiEls.glyph.value; window.GenStudio.redrawArt(); });
  _uiEls.glyphEase.value = S.glyphEase;
  _uiEls.glyphEase.addEventListener("change", () => { S.glyphEase = _uiEls.glyphEase.value; window.GenStudio.redrawArt(); });
  _uiEls.colorType.value = S.colorType;
  _uiEls.colorType.addEventListener("change", () => { S.colorType = _uiEls.colorType.value; window.GenStudio.redrawArt(); });
  _uiEls.blend.value = S.blend;
  _uiEls.blend.addEventListener("change", () => { S.blend = _uiEls.blend.value; window.GenStudio.redrawArt(); });
  _uiEls.freqMode.value = S.freqMode;
  _uiEls.freqMode.addEventListener("change", () => { S.freqMode = _uiEls.freqMode.value; window.GenStudio.redrawArt(); });
  _uiEls.swirlMode.value = S.swirlMode;
  _uiEls.swirlMode.addEventListener("change", () => { S.swirlMode = _uiEls.swirlMode.value; window.GenStudio.redrawArt(); });

  _uiEls.ratio.value = S.ratioW + ":" + S.ratioH;
  _uiEls.ratio.addEventListener("change", () => {
    const [w, h] = _uiEls.ratio.value.split(":");
    S.ratioW = parseInt(w, 10); S.ratioH = parseInt(h, 10);
    const c = document.querySelector("#canvas-host canvas");
    if (c) { c.style.maxWidth = "100%"; }
    window.GenStudio.redrawArt();
  });
  _uiEls.maskMode.value = S.maskMode;
  _uiEls.maskMode.addEventListener("change", () => {
    S.maskMode = _uiEls.maskMode.value;
    refreshMaskPanel();
    window.GenStudio.redrawArt();
  });
  _uiEls.maskImg.addEventListener("change", (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    loadMaskImageFile(f, () => { setStatus("Mask loaded"); window.GenStudio.redrawArt(); });
  });

  _uiEls.shape.value = S.shapeMode;
  _uiEls.shape.addEventListener("change", () => { S.shapeMode = _uiEls.shape.value; window.GenStudio.redrawArt(); });

  _uiEls.comp.value = S.composition;
  _uiEls.comp.addEventListener("change", () => { S.composition = _uiEls.comp.value; refreshPanel(); window.GenStudio.redrawArt(); });

  _uiEls.harmony.value = S.harmony;
  _uiEls.harmony.addEventListener("change", () => { S.harmony = _uiEls.harmony.value; window.GenStudio.reseed(); window.GenStudio.redrawArt(); });

  _uiEls.sizeSel.value = String(S.size);
  _uiEls.sizeSel.addEventListener("change", () => { S.size = parseInt(_uiEls.sizeSel.value, 10); window.GenStudio.redrawArt(); });

  // preset dropdown (populate from GEN_PRESETS)
  for (const name of Object.keys(GEN_PRESETS)) {
    const o = document.createElement("option");
    o.value = name; o.textContent = name;
    _uiEls.presetSel.appendChild(o);
  }
  _uiEls.presetSel.addEventListener("change", () => {
    const p = GEN_PRESETS[_uiEls.presetSel.value];
    if (!p) return;
    Object.assign(S, p);
    window.GenStudio.reseed();
    applyStateToUI();
    refreshPanel();
    window.GenStudio.redrawArt();
  });

  el("rand-seed").addEventListener("click", () => {
    S.seed = Math.floor(Math.random() * 99999) + 1;
    window.GenStudio.reseed();
    applyStateToUI();
    window.GenStudio.redrawArt();
  });

  el("exp-png").addEventListener("click", () => window.GenStudio.exportRaster("png"));
  el("exp-webp").addEventListener("click", () => window.GenStudio.exportRaster("webp"));
  el("exp-svg").addEventListener("click", () => window.GenStudio.exportSVG());
  el("exp-json").addEventListener("click", () => window.GenStudio.exportPresetJSON());

  el("exp-gif").addEventListener("click", () => {
    setStatus("Rendering GIF… (can take a minute at large sizes)");
    window.GenStudio.exportGIF({ frames: 36, fps: 12 });
    setTimeout(() => setStatus(""), 6000);
  });
  el("exp-webm").addEventListener("click", () => {
    setStatus("Recording WebM… (uses selected motion preset)");
    window.GenStudio.exportWebM({ frames: state.motionFrames, fps: state.motionFps });
    setTimeout(() => setStatus(""), 6000);
  });
  el("exp-mp4").addEventListener("click", () => {
    setStatus("Recording MP4… (falls back to WebM if browser lacks MP4)");
    window.GenStudio.exportMP4({ frames: state.motionFrames, fps: state.motionFps });
    setTimeout(() => setStatus(""), 6000);
  });

  el("rand-all").addEventListener("click", () => {
    S.seed = Math.floor(Math.random() * 99999) + 1;
    S.symmetry = 3 + Math.floor(Math.random() * 21);
    S.mirror = Math.random() > 0.5;
    S.layers = 3 + Math.floor(Math.random() * 10);
    S.perRing = 4 + Math.floor(Math.random() * 22);
    S.shapeMode = rngPick(gRng, ["petals", "dots", "polygons", "lines", "stars", "rings", "cross", "leaf"]);
    S.noiseScale = rngRange(gRng, 0.1, 1.0);
    S.noiseAmp = rngRange(gRng, 0.1, 0.9);
    S.rotation = rngRange(gRng, 0, Math.PI * 2);
    S.baseHue = Math.floor(Math.random() * 360);
    S.harmony = rngPick(gRng, ["golden", "analogous", "triadic", "complementary", "tetradic"]);
    S.composition = rngPick(gRng, ["symmetric", "flowfield", "truchet", "voronoi", "glyphfield"]);
    S.glyph = rngPick(gRng, ["square","circle","oval","triangle","checker","quadcircle","threedots","cross","clips","pinholehex","star","heart","spark","flash","arrow","flower","flake","diamond","pentagon","hexagon"]);
    S.glyphFill = Math.random() > 0.3;
    S.colorType = rngPick(gRng, ["palette", "paletteSeq", "paletteTrans", "solid"]);
    if (typeof PALETTES !== "undefined" && PALETTES.length) S.paletteIndex = Math.floor(Math.random() * PALETTES.length);
    S.paletteSpeed = rngRange(gRng, 0.2, 1.5);
    S.motion = rngPick(gRng, ["spin", "bloom", "swirl", "pulse", "flow", "breathe", "ripple", "chaos"]);
    S.blend = rngPick(gRng, ["Normal","XOR","Lighter","Multiply","Screen","Overlay","Difference"]);
    S.freqMode = rngPick(gRng, ["none","sin","cos"]);
    S.swirlMode = rngPick(gRng, ["none","wave","rotary"]);
    S.patternCells = 1 + Math.floor(Math.random()*6);
    window.GenStudio.reseed();
    applyStateToUI();
    refreshPanel();
    window.GenStudio.redrawArt();
  });

  el("imp-json").addEventListener("change", (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        window.GenStudio.importPresetJSON(obj);
        refreshPanel();
        _uiEls.presetSel.value = "";
      } catch (e) { alert("Invalid preset JSON"); }
    };
    reader.readAsText(file);
  });

  refreshPanel();
  refreshSwatches();
}

// show/hide control groups depending on the active composition
function refreshPanel() {
  const show = (id, on) => { const r = document.getElementById(id); if (r) r.style.display = on ? "" : "none"; };
  const c = window.GenStudio.state.composition;
  show("grp-symmetric", c === "symmetric");
  show("grp-flowfield", c === "flowfield");
  show("grp-truchet", c === "truchet");
  show("grp-voronoi", c === "voronoi");
  show("grp-glyphfield", c === "glyphfield");
  refreshMaskPanel();
  refreshColorPanel();
}

function refreshMaskPanel() {
  const m = window.GenStudio.state.maskMode;
  const show = (id, on) => { const r = document.getElementById(id); if (r) r.style.display = on ? "" : "none"; };
  show("grp-maskthr", m !== "none");
  show("grp-maskbc", m !== "none");
  show("grp-maskco", m !== "none");
  show("grp-maskinv", m === "image");
  show("grp-maskimg", m !== "none");
}

function refreshColorPanel() {
  const ct = window.GenStudio.state.colorType;
  const show = (id, on) => { const r = document.getElementById(id); if (r) r.style.display = on ? "" : "none"; };
  const isLib = ct === "palette" || ct === "paletteSeq" || ct === "paletteTrans";
  show("grp-palette", isLib);
  show("grp-palettespeed", ct === "paletteTrans");
  show("grp-basehue", ct === "solid");
}

// push current state values back into every input (used after preset/import)
function applyStateToUI() {
  const S = window.GenStudio.state;
  const e = (id) => document.getElementById(id);
  e("seed").value = S.seed; e("v-seed").textContent = S.seed;
  e("sym").value = S.symmetry; e("v-sym").textContent = S.symmetry;
  e("mir").value = S.mirror; e("v-mir").textContent = S.mirror;
  e("lay").value = S.layers; e("v-lay").textContent = S.layers;
  e("per").value = S.perRing; e("v-per").textContent = S.perRing;
  e("ns").value = S.noiseScale; e("v-ns").textContent = (+S.noiseScale).toFixed(2);
  e("na").value = S.noiseAmp; e("v-na").textContent = (+S.noiseAmp).toFixed(2);
  e("rot").value = S.rotation; e("v-rot").textContent = (+S.rotation).toFixed(2);
  e("bg").value = S.transparent ? "transparent" : (S.bgLight ? "light" : "dark");
  e("baseHue").value = S.baseHue; e("v-baseHue").textContent = S.baseHue;
  e("colorType").value = S.colorType;
  e("paletteIndex").value = S.paletteIndex; e("v-paletteIndex").textContent = S.paletteIndex;
  e("paletteSpeed").value = S.paletteSpeed; e("v-paletteSpeed").textContent = (+S.paletteSpeed).toFixed(2);
  e("motion").value = S.motion;
  e("flowWeight").value = S.flowWeight; e("v-flowWeight").textContent = (+S.flowWeight).toFixed(2);
  e("truchetTiles").value = S.truchetTiles; e("v-truchetTiles").textContent = S.truchetTiles;
  e("truchetWeight").value = S.truchetWeight; e("v-truchetWeight").textContent = (+S.truchetWeight).toFixed(2);
  e("voronoiSites").value = S.voronoiSites; e("v-voronoiSites").textContent = S.voronoiSites;
  e("harmony").value = S.harmony;
  e("comp").value = S.composition;
  e("sizeSel").value = String(S.size);
  e("glyph").value = S.glyph; e("glyphEase").value = S.glyphEase;
  e("glyphCount").value = S.glyphCount; e("v-glyphCount").textContent = S.glyphCount;
  e("glyphScale").value = S.glyphScale; e("v-glyphScale").textContent = (+S.glyphScale).toFixed(2);
  e("colorType").value = S.colorType; e("blend").value = S.blend;
  refreshColorPanel();
  e("freqMode").value = S.freqMode; e("freqLayers").value = S.freqLayers; e("v-freqLayers").textContent = S.freqLayers;
  e("freqBase").value = S.freqBase; e("v-freqBase").textContent = (+S.freqBase).toFixed(2);
  e("freqAmp").value = S.freqAmp; e("v-freqAmp").textContent = (+S.freqAmp).toFixed(2);
  e("swirlMode").value = S.swirlMode; e("swirlBase").value = S.swirlBase; e("v-swirlBase").textContent = (+S.swirlBase).toFixed(2);
  e("swirlAmp").value = S.swirlAmp; e("v-swirlAmp").textContent = (+S.swirlAmp).toFixed(2);
  e("patternCells").value = S.patternCells; e("v-patternCells").textContent = S.patternCells;
  e("patternOffset").value = S.patternOffset; e("v-patternOffset").textContent = (+S.patternOffset).toFixed(2);
  e("ratio").value = S.ratioW + ":" + S.ratioH;
  e("maskMode").value = S.maskMode;
  e("maskThreshold").value = S.maskThreshold; e("v-maskThreshold").textContent = (+S.maskThreshold).toFixed(2);
  e("maskBright").value = S.maskBright; e("v-maskBright").textContent = (+S.maskBright).toFixed(2);
  e("maskContrast").value = S.maskContrast; e("v-maskContrast").textContent = (+S.maskContrast).toFixed(2);
  e("maskInvert").value = S.maskInvert; e("v-maskInvert").textContent = S.maskInvert;
  refreshMaskPanel();
  refreshSwatches();
}

function refreshSwatches() {
  const host = document.getElementById("sw");
  if (!host) return;
  host.innerHTML = "";
  window.GenStudio.state.palette.forEach((c) => {
    const d = document.createElement("div");
    d.className = "sw";
    d.style.background = cssOf(c);
    host.appendChild(d);
  });
}

// regenerate swatches after reseed
const _origReseed = window.GenStudio.reseed;
window.GenStudio.reseed = function () { _origReseed(); refreshSwatches(); };

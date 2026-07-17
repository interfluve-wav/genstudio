// GenStudio — p5 entry point (global mode, MIT p5.js).

let gCanvas;

function setup() {
  const W = canvasW(), H = canvasH();
  gCanvas = createCanvas(W, H);
  gCanvas.parent("canvas-host");
  pixelDensity(2);
  noiseDetail(4, 0.5);
  reseed();
  renderCanvas();
  buildUI();
}

function redrawArt() {
  renderCanvas();
}

function windowResized() {
  resizeCanvas(canvasW(), canvasH());
  renderCanvas();
}

window.GenStudio = {
  state, reseed, redrawArt, renderCanvas,
  exportRaster, exportSVG, exportPresetJSON, importPresetJSON,
  exportGIF, exportWebM, startAnim, stopAnim,
  GEN_BRAND,
};

// apply branding text to the panel
window.addEventListener("DOMContentLoaded", () => {
  const t = document.getElementById("brand-title");
  const s = document.getElementById("brand-sub");
  const b = document.getElementById("brand-badge");
  if (t) t.textContent = GEN_BRAND.title;
  if (s) s.textContent = GEN_BRAND.subtitle;
  if (b) b.textContent = GEN_BRAND.badge;
});

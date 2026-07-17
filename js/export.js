// GenStudio — export module (PNG / WebP / SVG). Original code.
// PNG/WebP render to an offscreen p5.Graphics at the chosen export size so the
// on-screen preview size doesn't limit output quality. SVG serializes the scene.

function exportRaster(type) {
  const W = canvasW(), H = canvasH();
  const pg = createGraphics(W, H);
  pg.pixelDensity(1);
  pg.background(state.bgLight ? 245 : 18);
  // re-render the scene onto the offscreen buffer
  const prevScene = gScene;
  buildScene();
  pg.push();
  pg.noStroke();
  for (const p of gScene) drawPrimitive(pg, p);
  pg.pop();

  const mime = type === "webp" ? "image/webp" : "image/png";
  const ext = type;
  const url = pg.canvas.toDataURL(mime, 0.95);
  const a = document.createElement("a");
  a.href = url;
  a.download = `genstudio_${state.composition}_${state.seed}.${ext}`;
  a.click();
  pg.remove();
  gScene = prevScene;
}

function exportSVG() {
  const W = canvasW(), H = canvasH();
  buildScene();
  const bg = state.bgLight ? "#f5f5f5" : "#121212";
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  svg += `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  for (const p of gScene) svg += primToSVG(p);
  svg += `</svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `genstudio_${state.composition}_${state.seed}.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function primToSVG(p) {
  const f = cssOf(p.fill || "none");
  const st = cssOf(p.stroke || "none");
  const sw = p.w || 1;
  if (p.t === "circle") {
    const fill = p.fill ? f : "none";
    const stroke = p.stroke ? st : "none";
    return `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${p.r.toFixed(2)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  }
  if (p.t === "ellipse") {
    return `<g transform="translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${((p.rot || 0) * 180 / Math.PI).toFixed(2)})"><ellipse rx="${p.rx.toFixed(2)}" ry="${p.ry.toFixed(2)}" fill="${f}"/></g>`;
  }
  if (p.t === "poly") {
    const pts = p.pts.map((v) => `${v[0].toFixed(2)},${v[1].toFixed(2)}`).join(" ");
    return `<polygon points="${pts}" fill="${f}" stroke="none"/>`;
  }
  if (p.t === "polyline") {
    const pts = p.pts.map((v) => `${v[0].toFixed(2)},${v[1].toFixed(2)}`).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="${st}" stroke-width="${sw}"/>`;
  }
  if (p.t === "line") {
    return `<line x1="${p.x1.toFixed(2)}" y1="${p.y1.toFixed(2)}" x2="${p.x2.toFixed(2)}" y2="${p.y2.toFixed(2)}" stroke="${st}" stroke-width="${sw}"/>`;
  }
  if (p.t === "arc") {
    const large = (p.a1 - p.a0) % (Math.PI * 2) > Math.PI ? 1 : 0;
    const x0 = p.x + Math.cos(p.a0) * p.r, y0 = p.y + Math.sin(p.a0) * p.r;
    const x1 = p.x + Math.cos(p.a1) * p.r, y1 = p.y + Math.sin(p.a1) * p.r;
    return `<path d="M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${p.r} ${p.r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}" fill="none" stroke="${st}" stroke-width="${sw}"/>`;
  }
  return "";
}

// preset import/export (plain JSON params)
function exportPresetJSON() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `genstudio-preset_${state.seed}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importPresetJSON(obj) {
  Object.assign(state, obj);
  applyStateToUI();
  reseed();
  renderCanvas();
}

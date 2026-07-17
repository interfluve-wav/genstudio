// GenStudio — animated export: GIF (gif.js, MIT), WebM + MP4 (MediaRecorder).
// All render frames off the shared engine at the chosen export size, using the
// selected named motion preset (state.motion) for the animation curve.

function makeGifWorkerURL() {
  const src = document.getElementById("gif-worker-src");
  if (!src) return "vendor/gif.worker.js"; // fallback for served build
  return URL.createObjectURL(new Blob([src.textContent], { type: "application/javascript" }));
}

// Render one animation frame at time t (0..1) into the offscreen graphics buffer.
function renderFrameTo(pg, t) {
  applyMotion(t);
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

function exportGIF(opts) {
  opts = opts || {};
  const W = canvasW(), H = canvasH();
  const frames = opts.frames || state.motionFrames || 48;
  const fps = opts.fps || state.motionFps || 12;
  const workerURL = makeGifWorkerURL();
  const gif = new GIF({ workers: 2, quality: 10, width: W, height: H, workerScript: workerURL });
  const pg = createGraphics(W, H);
  pg.pixelDensity(1);
  const saved = JSON.parse(JSON.stringify(state));

  for (let i = 0; i < frames; i++) {
    const t = i / frames;
    noiseSeed(state.seed + Math.floor(t * 1000));
    renderFrameTo(pg, t);
    gif.addFrame(pg.canvas, { copy: true, delay: 1000 / fps });
  }
  gif.on("finished", (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genstudio_${state.composition}_${state.seed}.gif`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    Object.assign(state, saved);
    renderCanvas();
    if (workerURL.startsWith("blob:")) URL.revokeObjectURL(workerURL);
  });
  gif.render();
}

// MediaRecorder-based video (WebM universally; MP4 where the browser supports it).
function exportVideo(kind, opts) {
  opts = opts || {};
  const W = canvasW(), H = canvasH();
  const frames = opts.frames || state.motionFrames || 48;
  const fps = opts.fps || state.motionFps || 24;
  const pg = createGraphics(W, H);
  pg.pixelDensity(1);
  const canvas = pg.canvas;
  const stream = canvas.captureStream(fps);

  let mime = "";
  if (kind === "mp4") {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported("video/mp4")) mime = "video/mp4";
    else if (window.MediaRecorder && MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) mime = "video/mp4;codecs=avc1";
    else mime = ""; // fall back below
  }
  if (!mime && window.MediaRecorder && MediaRecorder.isTypeSupported("video/webm")) mime = "video/webm";
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks = [];
  const saved = JSON.parse(JSON.stringify(state));
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  rec.onstop = () => {
    const ext = mime.indexOf("mp4") >= 0 ? "mp4" : "webm";
    const blob = new Blob(chunks, { type: mime || "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `genstudio_${state.composition}_${state.seed}.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    pg.remove();
    Object.assign(state, saved);
    renderCanvas();
  };
  rec.start();
  let i = 0;
  let stopped = false;
  const finish = () => { if (!stopped) { stopped = true; rec.stop(); } };
  // safety: force-finalize after a generous wall-clock cap (headless/odd envs)
  const cap = setTimeout(finish, 60000);
  let rafId;
  const step = () => {
    if (i >= frames) { finish(); return; }
    const t = i / frames;
    noiseSeed(state.seed + Math.floor(t * 1000));
    renderFrameTo(pg, t);
    i++;
    rafId = requestAnimationFrame(step);
  };
  step();
  // ensure cleanup if onstop fires
  rec.onstop = () => { clearTimeout(cap); cancelAnimationFrame(rafId); const blob = new Blob(chunks, { type: mime || "video/webm" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `genstudio_${state.composition}_${state.seed}.${mime.indexOf("mp4") >= 0 ? "mp4" : "webm"}`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); pg.remove(); Object.assign(state, saved); renderCanvas(); };
}

function exportWebM(opts) { exportVideo("webm", opts); }
function exportMP4(opts) { exportVideo("mp4", opts); }

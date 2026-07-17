// GenStudio — animation engine (original).
// Drives a parameter (e.g. noise time or rotation) frame-to-frame and re-renders
// the shared scene, so any composition can animate. Used for GIF/MP4 export.

const anim = {
  active: false,
  raf: null,
  frames: 0,
  total: 60,
  fps: 12,
  onFrame: null,   // callback(frameIndex) -> mutates state
  onDone: null,
};

function animTick() {
  if (!anim.active) return;
  const i = anim.frames;
  if (anim.onFrame) anim.onFrame(i);
  renderCanvas();
  anim.frames++;
  if (anim.frames >= anim.total) {
    anim.active = false;
    if (anim.onDone) anim.onDone();
    return;
  }
  setTimeout(() => { anim.raf = requestAnimationFrame(animTick); }, 1000 / anim.fps);
}

// drifts noise seed + rotation for smooth looping motion
function defaultAnimFrame(i) {
  const t = i / anim.total;
  state._noiseSeed = state.seed + t * 1000;
  state.rotation = t * Math.PI * 2;
  // re-seed noise source so flow/truchet/symmetric jitter moves
  noiseSeed(Math.floor(state._noiseSeed));
}

function startAnim(opts) {
  anim.total = opts.total || 60;
  anim.fps = opts.fps || 12;
  anim.frames = 0;
  anim.active = true;
  anim.onFrame = opts.onFrame || defaultAnimFrame;
  anim.onDone = opts.onDone || null;
  animTick();
}

function stopAnim() { anim.active = false; if (anim.raf) cancelAnimationFrame(anim.raf); }

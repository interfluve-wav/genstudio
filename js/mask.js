// GenStudio — original image-mask module (FLAKE "mask" inspired, from scratch).
// Loads an uploaded raster image into a luminance field; the engine then keeps
// only primitives whose sample point is inside the mask (or above a threshold).

let gMaskImg = null; // {data:Uint8ClampedArray, w, h}

function loadMaskImageFile(file, onDone) {
  const maxW = 256;
  const finish = (img) => {
    const scale = Math.min(1, maxW / img.width);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width * scale));
    c.height = Math.max(1, Math.round(img.height * scale));
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    gMaskImg = { data: d, w: c.width, h: c.height };
    if (onDone) onDone();
  };
  if (window.createImageBitmap) {
    createImageBitmap(file).then(finish).catch(() => {
      // fallback to Image element
      const img = new Image();
      img.onload = () => finish(img);
      img.onerror = () => { setStatus && setStatus("Mask image failed to load"); };
      const reader = new FileReader();
      reader.onload = () => { img.src = reader.result; };
      reader.readAsDataURL(file);
    });
  } else {
    const img = new Image();
    img.onload = () => finish(img);
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.readAsDataURL(file);
  }
}

// sample luminance 0..1 at normalized (u,v) in 0..1 within the canvas
function maskSample(u, v) {
  if (!gMaskImg) return 1;
  const x = Math.min(gMaskImg.w - 1, Math.max(0, Math.floor(u * gMaskImg.w)));
  const y = Math.min(gMaskImg.h - 1, Math.max(0, Math.floor(v * gMaskImg.h)));
  const i = (y * gMaskImg.w + x) * 4;
  let lum = (0.299 * gMaskImg.data[i] + 0.587 * gMaskImg.data[i + 1] + 0.114 * gMaskImg.data[i + 2]) / 255;
  // brightness + contrast adjust
  lum = (lum - 0.5) * state.maskContrast + 0.5 + state.maskBright * 0.3;
  lum = Math.min(1, Math.max(0, lum));
  if (state.maskInvert) lum = 1 - lum;
  return lum;
}

// true if a primitive at (x,y) on a WxH canvas is kept by the mask
function maskKeeps(x, y, W, H) {
  if (state.maskMode === "none" || !gMaskImg) return true;
  const lum = maskSample(x / W, y / H);
  if (state.maskMode === "image") {
    // keep where image is dark (classic: art fills the silhouette)
    return lum < state.maskThreshold;
  }
  if (state.maskMode === "threshold") {
    return lum > state.maskThreshold;
  }
  return true;
}

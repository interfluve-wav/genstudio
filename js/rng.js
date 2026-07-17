// GenStudio — original PRNG utilities (no third-party code).
// mulberry32: a small, fast, seedable 32-bit PRNG. Fully deterministic.
function makeRNG(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngRange(rng, min, max) {
  return min + rng() * (max - min);
}

function rngInt(rng, min, max) {
  return Math.floor(rngRange(rng, min, max + 1));
}

function rngPick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

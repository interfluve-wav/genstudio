// GenStudio — built-in presets (original parameter sets, not copied from any tool).
// Each preset only sets the keys it cares about; the rest keep their current value.

const GEN_PRESETS = {
  "Mandala Bloom": {
    composition: "symmetric", shapeMode: "petals", symmetry: 12, mirror: true,
    layers: 8, perRing: 14, noiseScale: 0.45, noiseAmp: 0.5, baseHue: 200, harmony: "golden",
  },
  "Star Ring": {
    composition: "symmetric", shapeMode: "stars", symmetry: 16, mirror: false,
    layers: 5, perRing: 18, noiseScale: 0.3, noiseAmp: 0.3, baseHue: 45, harmony: "tetradic",
  },
  "Neon Web": {
    composition: "flowfield", flowGrid: 52, flowWeight: 2, noiseScale: 0.5,
    baseHue: 300, harmony: "complementary",
  },
  "Silk Current": {
    composition: "flowfield", flowGrid: 70, flowWeight: 1.5, noiseScale: 0.35,
    baseHue: 190, harmony: "analogous",
  },
  "Truchet Maze": {
    composition: "truchet", truchetTiles: 14, truchetWeight: 3, baseHue: 30, harmony: "triadic",
  },
  "Stained Glass": {
    composition: "voronoi", voronoiSites: 38, baseHue: 120, harmony: "analogous",
  },
  "Crystal Lattice": {
    composition: "voronoi", voronoiSites: 64, baseHue: 265, harmony: "tetradic",
  },
  "Dotty Kaleido": {
    composition: "symmetric", shapeMode: "dots", symmetry: 10, mirror: true,
    layers: 10, perRing: 12, noiseScale: 0.6, noiseAmp: 0.6, baseHue: 15, harmony: "complementary",
  },
  "Glyph Storm": {
    composition: "glyphfield", glyph: "flake", glyphCount: 2600, glyphScale: 3.2, glyphEase: "Cubic In Out",
    colorType: "sequence", baseHue: 210, harmony: "tetradic", blend: "Lighter",
  },
  "Liquid Flower": {
    composition: "glyphfield", glyph: "flower", glyphCount: 1800, glyphScale: 3.0, glyphEase: "Sine In Out",
    colorType: "transition", freqMode: "sin", freqLayers: 8, freqBase: 0.5, freqAmp: 0.8,
    swirlMode: "wave", swirlBase: 0.3, swirlAmp: 0.5, baseHue: 320, harmony: "analogous", blend: "screen",
  },
  "XOR Web": {
    composition: "flowfield", flowGrid: 64, flowWeight: 2.2, noiseScale: 0.5,
    baseHue: 280, harmony: "complementary", blend: "xor",
  },
};

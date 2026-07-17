// GenStudio — original motif/shape emitter.
// Each call appends one or more primitives to the shared scene list.
// Primitive schema (all coordinates absolute, canvas space):
//   {t:'circle', x,y,r, fill? , stroke?, w?}
//   {t:'ellipse', x,y,rx,ry,rot, fill}
//   {t:'poly', pts:[[x,y]...], fill}
//   {t:'line', x1,y1,x2,y2, stroke, w}
//   {t:'arc', x,y,r,a0,a1, stroke, w}

function emitShape(scene, type, x, y, size, rot, color) {
  const r = size / 2;
  switch (type) {
    case "dots":
      scene.push({ t: "circle", x, y, r, fill: color });
      break;
    case "petals":
      scene.push({ t: "ellipse", x, y, rx: r * 0.5, ry: r * 0.85, rot: rot, fill: color });
      break;
    case "lines":
      scene.push({
        t: "line",
        x1: x - Math.cos(rot) * r, y1: y - Math.sin(rot) * r,
        x2: x + Math.cos(rot) * r, y2: y + Math.sin(rot) * r,
        stroke: color, w: Math.max(1, r * 0.18),
      });
      break;
    case "polygons": {
      const sides = 3 + Math.floor(gRng() * 4); // 3..6
      const a0 = gRng() * Math.PI;
      const pts = [];
      for (let i = 0; i < sides; i++) {
        const ang = a0 + (i / sides) * Math.PI * 2;
        pts.push([x + Math.cos(ang) * r, y + Math.sin(ang) * r]);
      }
      scene.push({ t: "poly", pts, fill: color });
      break;
    }
    case "stars": {
      const spikes = 5;
      const pts = [];
      const a0 = -Math.PI / 2;
      for (let i = 0; i < spikes * 2; i++) {
        const rr = i % 2 === 0 ? r : r * 0.45;
        const ang = a0 + (i / (spikes * 2)) * Math.PI * 2;
        pts.push([x + Math.cos(ang) * rr, y + Math.sin(ang) * rr]);
      }
      scene.push({ t: "poly", pts, fill: color });
      break;
    }
    case "rings":
      scene.push({ t: "circle", x, y, r, stroke: color, w: Math.max(1, r * 0.2) });
      break;
    case "cross": {
      const w = Math.max(1, r * 0.25);
      scene.push({ t: "line", x1: x - r, y1: y, x2: x + r, y2: y, stroke: color, w });
      scene.push({ t: "line", x1: x, y1: y - r, x2: x, y2: y + r, stroke: color, w });
      break;
    }
    case "leaf": {
      const pts = [];
      const steps = 14;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ang = t * Math.PI * 2;
        const rr = r * (0.45 + 0.55 * Math.cos(ang));
        pts.push([x + Math.cos(ang + rot) * rr, y + Math.sin(ang + rot) * rr]);
      }
      scene.push({ t: "poly", pts, fill: color });
      break;
    }
  }
}

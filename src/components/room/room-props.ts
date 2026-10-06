import * as THREE from "three";
import type { RoomTheme } from "./room-themes";

/*
 * One small set of furniture per house, built from primitives and placed
 * against the back wall (z = -3). Everything is lit by the scene's lights.
 */

const lam = (color: THREE.ColorRepresentation) =>
  new THREE.MeshLambertMaterial({ color });

function box(
  w: number,
  h: number,
  d: number,
  color: THREE.ColorRepresentation,
  x: number,
  y: number,
  z: number,
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(color));
  m.position.set(x, y, z);
  return m;
}

function cyl(
  top: number,
  bottom: number,
  h: number,
  color: THREE.ColorRepresentation,
  x: number,
  y: number,
  z: number,
  segments = 28,
) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(top, bottom, h, segments),
    lam(color),
  );
  m.position.set(x, y, z);
  return m;
}

/** Lavender: a painted bookcase with tidy rows of books, a plant and a moon. */
function bookshelf() {
  const g = new THREE.Group();
  const frame = "#fffaf0";
  const back = "#b9a3d6";
  const W = 2.1;
  const H = 1.9;
  const D = 0.5;
  const T = 0.07;
  g.add(box(W, H, 0.05, back, 0, H / 2, -D / 2 + 0.025));
  g.add(box(T, H, D, frame, -W / 2 + T / 2, H / 2, 0));
  g.add(box(T, H, D, frame, W / 2 - T / 2, H / 2, 0));
  const rows = [0.0, 0.62, 1.24];
  for (const y of rows) g.add(box(W, T, D, frame, 0, y + T / 2, 0));
  g.add(box(W + 0.12, T, D + 0.08, frame, 0, H + T / 2, 0));

  const palette = [
    "#74549e",
    "#a58bd0",
    "#e6dcf3",
    "#f2b8c6",
    "#fffaf0",
    "#8d6bb8",
  ];
  // Deterministic "random" so the rows look the same every time.
  let seed = 11;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const inner = W - T * 2 - 0.1;
  for (const [row, y] of rows.slice(0, 2).entries()) {
    const base = y + T;
    // books fill most of the row; the rest is left open
    const fill = row === 0 ? 0.72 : 0.58;
    let x = -inner / 2;
    let n = 0;
    while (x < -inner / 2 + inner * fill) {
      const w = 0.09 + rnd() * 0.06;
      const h = 0.38 + rnd() * 0.14;
      g.add(
        box(
          w,
          h,
          0.32,
          palette[(n++ + row * 2) % palette.length],
          x + w / 2,
          base + h / 2,
          0,
        ),
      );
      x += w + 0.012;
    }
    // a book leaning on the last one
    const lean = box(
      0.1,
      0.44,
      0.32,
      palette[(row + 3) % palette.length],
      x + 0.12,
      base + 0.22,
      0,
    );
    lean.rotation.z = -0.3;
    g.add(lean);
  }
  // open spot on the middle row: a small stack
  g.add(box(0.42, 0.08, 0.3, palette[3], 0.55, rows[1] + T + 0.04, 0));
  g.add(box(0.36, 0.08, 0.28, palette[0], 0.55, rows[1] + T + 0.12, 0));
  // open spot on the lower row: a round pouf-like pot
  g.add(cyl(0.16, 0.12, 0.2, "#e6dcf3", 0.7, rows[0] + T + 0.1, 0));

  // top: a tiny plant and a crescent moon
  g.add(cyl(0.12, 0.09, 0.16, "#e6dcf3", -0.7, H + T + 0.08, 0));
  for (const [dx, dy, r] of [
    [0, 0.26, 0.12],
    [-0.08, 0.18, 0.09],
    [0.09, 0.2, 0.09],
  ]) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(r, 14, 10),
      lam("#6bb88f"),
    );
    leaf.position.set(-0.7 + dx, H + T + 0.1 + dy, 0);
    g.add(leaf);
  }
  const moon = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.05, 10, 28, Math.PI * 1.4),
    new THREE.MeshBasicMaterial({ color: "#f6d365" }),
  );
  moon.position.set(0.4, H + T + 0.28, 0);
  moon.rotation.z = Math.PI * 0.8;
  g.add(moon);

  g.position.set(1.0, 0, -3 + D / 2 + 0.02);
  return g;
}

/** Clover: a tall potted plant and a small one. */
function plants() {
  const g = new THREE.Group();
  const leaf = new THREE.MeshLambertMaterial({ color: "#5fae82" });
  const leafDark = new THREE.MeshLambertMaterial({ color: "#459273" });

  function plant(x: number, z: number, scale: number) {
    const p = new THREE.Group();
    p.add(cyl(0.34, 0.26, 0.5, "#d98f6a", 0, 0.25, 0));
    p.add(cyl(0.3, 0.3, 0.04, "#6b4a35", 0, 0.5, 0));
    const stem = cyl(0.035, 0.05, 1.1, "#3f7d5f", 0, 1.05, 0, 8);
    p.add(stem);
    const leaves: [number, number, number, number][] = [
      [0.0, 1.75, 0.0, 0.0],
      [0.32, 1.45, 0.05, -0.7],
      [-0.32, 1.35, -0.05, 0.7],
      [0.28, 1.05, -0.1, -0.6],
      [-0.3, 0.95, 0.1, 0.6],
    ];
    for (const [i, [lx, ly, lz, rz]] of leaves.entries()) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 20, 14),
        i % 2 ? leafDark : leaf,
      );
      m.scale.set(0.55, 1, 0.3);
      m.position.set(lx, ly, lz);
      m.rotation.z = rz;
      p.add(m);
    }
    p.scale.setScalar(scale);
    p.position.set(x, 0, z);
    return p;
  }

  g.add(plant(1.9, -2.45, 1));
  g.add(plant(0.9, -2.6, 0.55));
  return g;
}

/** Forget-me-not: a floor lamp beside a cushion. */
function lampAndCushion() {
  const g = new THREE.Group();
  g.add(cyl(0.3, 0.3, 0.07, "#8a7f73", 0, 0.035, 0));
  g.add(cyl(0.035, 0.035, 2.0, "#8a7f73", 0, 1.04, 0, 8));
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.46, 0.55, 28, 1, true),
    new THREE.MeshBasicMaterial({ color: "#ffe9a8", side: THREE.DoubleSide }),
  );
  shade.position.set(0, 2.15, 0);
  g.add(shade);
  g.add(cyl(0.26, 0.26, 0.03, "#fff4cc", 0, 2.42, 0));
  g.position.set(2.2, 0, -2.55);

  const cushion = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 24, 16),
    lam("#a9c7ea"),
  );
  cushion.scale.set(1, 0.4, 1);
  cushion.position.set(0.6, 0.2, -2.3);
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 20, 12),
    lam("#fffaf0"),
  );
  top.scale.set(1, 0.35, 1);
  top.position.set(0.6, 0.38, -2.3);

  const all = new THREE.Group();
  all.add(g, cushion, top);
  return all;
}

/** Dandelion: a globe on a stand and a suitcase. */
function globeAndSuitcase() {
  const g = new THREE.Group();

  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#6fb3e8";
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = "#8fcf8a";
  for (const [x, y, rx, ry] of [
    [60, 55, 26, 20],
    [100, 90, 14, 20],
    [160, 50, 30, 18],
    [200, 85, 18, 12],
    [20, 100, 14, 8],
  ]) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  g.add(cyl(0.34, 0.4, 0.08, "#b98a5e", 0, 0.04, 0));
  g.add(cyl(0.05, 0.05, 0.5, "#b98a5e", 0, 0.33, 0, 10));
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 20),
    new THREE.MeshLambertMaterial({ map: tex }),
  );
  globe.position.y = 1.0;
  globe.rotation.z = 0.4;
  g.add(globe);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.025, 8, 40),
    lam("#c98a45"),
  );
  ring.position.y = 1.0;
  ring.rotation.set(0, Math.PI / 2, 0.4);
  g.add(ring);
  g.position.set(1.7, 0, -2.35);

  const suitcase = new THREE.Group();
  suitcase.add(box(1.0, 0.6, 0.4, "#c98a45", 0, 0.3, 0));
  suitcase.add(box(0.07, 0.62, 0.42, "#8a5a2b", -0.25, 0.3, 0));
  suitcase.add(box(0.07, 0.62, 0.42, "#8a5a2b", 0.25, 0.3, 0));
  suitcase.add(box(0.2, 0.08, 0.1, "#f6d365", 0, 0.5, 0.2));
  suitcase.position.set(0.2, 0, -2.6);
  suitcase.rotation.y = 0.12;

  const all = new THREE.Group();
  all.add(g, suitcase);
  return all;
}

export function buildProps(theme: RoomTheme): THREE.Group {
  switch (theme.id) {
    case "lavender":
      return wrap(bookshelf());
    case "clover":
      return wrap(plants());
    case "forget-me-not":
      return wrap(lampAndCushion());
    default:
      return wrap(globeAndSuitcase());
  }
}

function wrap(obj: THREE.Object3D) {
  const g = new THREE.Group();
  g.add(obj);
  return g;
}

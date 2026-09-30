// Builds the band patterns (public/patterns/{home,shop,contents}.svg) from the
// MBTI symbol SVGs: one folder per type, each symbol drawn with a dark outline
// colour, lighter fills and white highlights (CSS classes .cls-n).
//
//   node scripts/build-patterns.mjs "<symbols dir>"
//
// Every layer is recoloured from the band's own colour (no opacity), so the
// pattern reads as tone-on-tone. Icons sit on a jittered half-drop grid that is
// then relaxed so spacing is even without lining up, and the tile wraps on all
// four edges.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const src = process.argv[2];
if (!src) throw new Error("Usage: node scripts/build-patterns.mjs <symbols dir>");
const outDir = "public/patterns";

// Band colours; keep in sync with the CSS backgrounds that use each tile.
const bands = { home: "#fff0bd", shop: "#dcefff", contents: "#e4f3dc" };

const layout = {
  cols: 9, // 9×6 = 54 different symbols per tile, 1512×1008px (drawn at 75%: 1134×756px in CSS)
  rows: 6, // must be even for the half-drop to wrap
  cell: 168,
  size: 78, // longest side of every symbol, px
  jitter: 0.42, // how far (in cells) a symbol may start from its grid point
  minGap: 100, // closest two symbol centres may start, px
  relax: 32, // repulsion passes; more drifts back towards a lattice
  tilts: [-38, 14, -12, 32, -24, 6, 40, -4, 22, -30, 10],
  seed: 11,
  // How far the outline/fill tones sit from the band colour (1 = strong).
  strength: 0.49,
};

// ── colour ──
const hexToRgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(1 + i, 3 + i), 16) / 255);
const expand = (h) => (h.length === 4 ? `#${[...h.slice(1)].map((c) => c + c).join("")}` : h);
const lum = (h) => {
  const [r, g, b] = hexToRgb(expand(h));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
function rgbToHsl([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function tones(bg, strength) {
  const [h, s, l] = rgbToHsl(hexToRgb(bg));
  return {
    line: hslToHex(h, Math.min(s, 70) * 0.8, l - 14 * strength),
    mid: hslToHex(h, Math.min(s, 70) * 0.8, l - 9 * strength),
    fill: hslToHex(h, s, l - 5 * strength),
    paper: hslToHex(h, s, Math.min(l + 4, 98.5)),
  };
}

// ── symbols ──
const symbols = [];
for (const type of readdirSync(src).sort()) {
  for (const file of readdirSync(join(src, type)).sort()) {
    if (!file.endsWith(".svg")) continue;
    const svg = readFileSync(join(src, type, file), "utf8");
    const vb = svg.match(/viewBox="([^"]+)"/)[1];
    const classes = {};
    for (const [, name, color] of svg.matchAll(/\.(cls-\d+)\s*\{\s*fill:\s*(#[0-9a-fA-F]{3,6})/g))
      classes[name] = expand(color.toLowerCase());
    // Darkest colour is the outline, white the highlights, the rest fills.
    const colors = [...new Set(Object.values(classes))].sort((a, b) => lum(a) - lum(b));
    const role = {};
    const inked = colors.filter((c) => lum(c) < 0.97);
    inked.forEach((c, i) => (role[c] = i === 0 ? "line" : i === inked.length - 1 ? "fill" : "mid"));
    colors.filter((c) => lum(c) >= 0.97).forEach((c) => (role[c] = "paper"));
    const body = svg
      .slice(svg.indexOf("</defs>") + 7, svg.lastIndexOf("</svg>"))
      .replace(/\s+(data-name|id)="[^"]*"/g, "")
      .replace(/>\s+</g, "><")
      .trim();
    const [, , w, h] = vb.split(/\s+/).map(Number);
    symbols.push({ id: `${type}-${file.slice(0, -4)}`, vb, w, h, body, classes, role });
  }
}

// ── layout (shared by every band so they match) ──
const { cols, rows, cell, size } = layout;
const W = cols * cell, H = rows * cell;
let seed = layout.seed;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pool = [...symbols].sort(() => rand() - 0.5).slice(0, cols * rows);

const delta = (a, b) => {
  let dx = a.x - b.x, dy = a.y - b.y;
  if (dx > W / 2) dx -= W; else if (dx < -W / 2) dx += W;
  if (dy > H / 2) dy -= H; else if (dy < -H / 2) dy += H;
  return [dx, dy];
};
const grid = pool.map((_, i) => {
  const r = Math.floor(i / cols), c = i % cols;
  return { r, x: (c + 0.5 + (r % 2) * 0.5) * cell, y: (r + 0.5) * cell };
});
const points = grid.map((p) => ({ ...p }));
points.forEach((p, i) => {
  for (let attempt = 0; attempt < 40; attempt++) {
    const reach = layout.jitter * cell * (1 - attempt / 40);
    const angle = rand() * Math.PI * 2, dist = (0.45 + 0.55 * rand()) * reach;
    const next = {
      x: (grid[i].x + Math.cos(angle) * dist + W) % W,
      y: (grid[i].y + Math.sin(angle) * dist + H) % H,
    };
    if (points.every((q, j) => j === i || Math.hypot(...delta(next, q)) >= layout.minGap)) {
      Object.assign(p, next);
      break;
    }
  }
});
const ideal = Math.sqrt((2 * W * H) / (Math.sqrt(3) * points.length));
for (let pass = 0; pass < layout.relax; pass++) {
  const moves = points.map((p, i) => {
    let fx = 0, fy = 0;
    points.forEach((q, j) => {
      if (i === j) return;
      const [dx, dy] = delta(p, q);
      const d = Math.hypot(dx, dy) || 0.01;
      if (d < ideal) {
        fx += (dx / d) * ((ideal - d) / ideal);
        fy += (dy / d) * ((ideal - d) / ideal);
      }
    });
    return [fx * ideal * 0.12, fy * ideal * 0.12];
  });
  points.forEach((p, i) => {
    p.x = (p.x + moves[i][0] + W) % W;
    p.y = (p.y + moves[i][1] + H) % H;
  });
}

// ── write one tile per band ──
mkdirSync(outDir, { recursive: true });
for (const [band, bg] of Object.entries(bands)) {
  const t = tones(bg, layout.strength);
  const defs = pool
    .map((s) => {
      const body = s.body.replace(/class="(cls-\d+)"/g, (_, c) => `fill="${t[s.role[s.classes[c]]] ?? t.line}"`);
      return `<symbol id="${s.id}" viewBox="${s.vb}">${body}</symbol>`;
    })
    .join("");
  const uses = [];
  pool.forEach((s, i) => {
    const { r, x: cx, y: cy } = points[i];
    const k = size / Math.max(s.w, s.h);
    const w = s.w * k, h = s.h * k;
    const tilt = layout.tilts[(i * 3 + r) % layout.tilts.length];
    const reach = size * 0.75;
    // A copy on the far side of any edge the symbol crosses keeps seams clean.
    for (const dx of [-W, 0, W]) {
      for (const dy of [-H, 0, H]) {
        const x = cx + dx, y = cy + dy;
        if (x + reach < 0 || x - reach > W || y + reach < 0 || y - reach > H) continue;
        uses.push(
          `<use href="#${s.id}" x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" transform="rotate(${tilt} ${x.toFixed(1)} ${y.toFixed(1)})"/>`,
        );
      }
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}</defs>${uses.join("")}</svg>\n`;
  writeFileSync(join(outDir, `${band}.svg`), svg);
  console.log(`${outDir}/${band}.svg  ${W}x${H}  ${Math.round(svg.length / 1024)} KB`);
}

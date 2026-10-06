"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildProps } from "./room-props";
import { skyColors, type RoomTheme } from "./room-themes";

/*
 * A small isometric diorama: a box room (floor + two walls) drawn with an
 * orthographic camera, with one flat 2D character standing in it.
 * The character wanders on its own, can be picked up and dropped, and walks
 * to wherever you tap on the floor.
 */

const HALF = 3; // floor spans -HALF..HALF on x and z
const THICK = 0.35;
const WALL_H = 3.6;
const BOUND = 2.3; // how far the character may walk from the centre
const CHAR_H = 2;
const GRAVITY = 18;

type Mode = "idle" | "walk" | "air" | "drag";

type Engine = {
  setTheme(theme: RoomTheme): void;
  setCharacter(src: string | null): void;
};

export default function RoomCanvas({
  theme,
  characterSrc,
  alt,
}: {
  theme: RoomTheme;
  characterSrc: string | null;
  alt: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const engine = createEngine(host);
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    engineRef.current?.setCharacter(characterSrc);
  }, [characterSrc]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={alt}
      className="absolute inset-0"
    />
  );
}

function createEngine(host: HTMLDivElement): Engine & { dispose(): void } {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  host.appendChild(renderer.domElement);
  const canvas = renderer.domElement;

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(4, 9, 6);
  scene.add(sun);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 60);
  camera.position.set(9, 7.6, 9);
  camera.lookAt(0, 1.4, 0);
  camera.updateMatrixWorld();

  // ---------- room (rebuilt when the theme changes) ----------
  let room: THREE.Group | null = null;
  const loader = new THREE.TextureLoader();

  function setTheme(theme: RoomTheme) {
    if (room) {
      scene.remove(room);
      disposeTree(room);
    }
    room = buildRoom(theme);
    scene.add(room);
  }

  // ---------- character ----------
  const shadowTex = radialTexture();
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 32),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = 1;
  shadow.visible = false;
  scene.add(shadow);

  const charGroup = new THREE.Group();
  charGroup.visible = false;
  scene.add(charGroup);
  const sprite = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0),
    new THREE.MeshBasicMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  sprite.renderOrder = 2;
  charGroup.add(sprite);
  let baseW = CHAR_H * 0.75;
  let charTex: THREE.Texture | null = null;
  let charToken = 0;

  function setCharacter(src: string | null) {
    const token = ++charToken;
    if (!src) {
      charGroup.visible = false;
      shadow.visible = false;
      return;
    }
    loader.load(src, (tex) => {
      if (token !== charToken) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const img = tex.image as { width: number; height: number };
      baseW = CHAR_H * (img.width / img.height);
      charTex?.dispose();
      charTex = tex;
      const mat = sprite.material as THREE.MeshBasicMaterial;
      mat.map = tex;
      mat.needsUpdate = true;
      charGroup.visible = true;
      shadow.visible = true;
    });
  }

  // ---------- behaviour ----------
  const st = {
    mode: "idle" as Mode,
    x: 0.4,
    z: 0.9,
    h: 0,
    vh: 0,
    tx: 0,
    tz: 0,
    timer: 0.8,
    phase: 0,
    s: 0, // squash (+ = taller/thinner, - = flatter/wider)
    vs: 0,
    tilt: 0,
    vtilt: 0,
    lean: 0, // sideways lean while walking
    dragX: 0,
    dragZ: 0,
    lastDragX: 0,
  };

  const clampBound = (v: number) => Math.max(-BOUND, Math.min(BOUND, v));
  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  function kick(amount: number) {
    st.vs += amount;
  }

  function jump(speed: number) {
    st.mode = "air";
    st.vh = speed;
    kick(reducedMotion.matches ? 0 : 5);
  }

  function startWalk(x: number, z: number) {
    st.tx = clampBound(x);
    st.tz = clampBound(z);
    st.mode = "walk";
  }

  function update(dt: number, t: number) {
    const calm = reducedMotion.matches;

    if (st.mode === "idle") {
      st.timer -= dt;
      if (st.timer <= 0) {
        if (!calm && Math.random() < 0.08) {
          jump(rand(3.4, 4.6));
        } else {
          // walk to a spot a little way off, then stop again
          let x = 0;
          let z = 0;
          for (let i = 0; i < 8; i++) {
            x = rand(-BOUND, BOUND);
            z = rand(-BOUND, BOUND);
            if (Math.hypot(x - st.x, z - st.z) > 1.3) break;
          }
          startWalk(x, z);
        }
      }
    }

    let targetTilt = 0;

    if (st.mode === "walk") {
      const dx = st.tx - st.x;
      const dz = st.tz - st.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.06) {
        st.mode = "idle";
        st.timer = rand(3, 6.5);
        st.h = 0;
        st.lean = 0;
      } else {
        const speed = 0.8;
        const step = Math.min(dist, speed * dt);
        st.x += (dx / dist) * step;
        st.z += (dz / dist) * step;
        const prev = st.phase;
        st.phase += dt * 4.6;
        st.h = Math.abs(Math.sin(st.phase)) * 0.16;
        if (Math.floor(prev / Math.PI) !== Math.floor(st.phase / Math.PI)) {
          kick(-1.5); // soft squish on each landing
        }
        // camera right on the floor is (1, 0, -1) / sqrt(2)
        const screenX = (dx - dz) / (dist * Math.SQRT2);
        st.lean += (screenX * 0.14 - st.lean) * Math.min(1, dt * 8);
        targetTilt = st.lean + Math.sin(st.phase) * 0.06;
      }
    }

    if (st.mode === "air") {
      st.h += st.vh * dt;
      st.vh -= GRAVITY * dt;
      if (st.h <= 0) {
        st.h = 0;
        const impact = -st.vh;
        if (!calm && impact > 2.2) {
          st.vh = impact * 0.36;
          kick(-Math.min(impact, 9) * 1.3);
        } else {
          st.vh = 0;
          st.mode = "idle";
          st.timer = rand(1.2, 3);
        }
      }
    }

    if (st.mode === "drag") {
      const follow = Math.min(1, dt * 16);
      const px = st.x;
      st.x += (clampBound(st.dragX) - st.x) * follow;
      st.z += (clampBound(st.dragZ) - st.z) * follow;
      st.h += ((calm ? 0.5 : 0.8) - st.h) * Math.min(1, dt * 12);
      // dangle: lag behind the hand sideways
      const screenVx = ((st.x - px) / Math.max(dt, 1e-3)) * 0.707;
      targetTilt = calm ? 0 : -Math.max(-1, Math.min(1, screenVx * 0.12)) * 0.5;
    }

    // springs: tilt follows its target, squash returns to 0
    if (calm && st.mode !== "walk") {
      st.s = 0;
      st.vs = 0;
      st.tilt += (targetTilt - st.tilt) * Math.min(1, dt * 10);
    } else {
      st.vtilt += (-70 * (st.tilt - targetTilt) - 8 * st.vtilt) * dt;
      st.tilt += st.vtilt * dt;
      st.vs += (-80 * st.s - 12 * st.vs) * dt;
      st.s = Math.max(-0.42, Math.min(0.38, st.s + st.vs * dt));
    }

    const breathe = st.mode === "idle" && !calm ? Math.sin(t * 2.2) * 0.012 : 0;
    const s = st.s + breathe;
    sprite.scale.set(baseW * (1 - s * 0.55), CHAR_H * (1 + s), 1);
    charGroup.position.set(st.x, st.h, st.z);
    sprite.quaternion
      .copy(camera.quaternion)
      .multiply(tiltQuat.setFromAxisAngle(zAxis, st.tilt));

    const lift = 1 / (1 + st.h * 0.9);
    shadow.position.set(st.x, 0.03, st.z);
    shadow.scale.setScalar(lift * (1 + s * -0.3));
    (shadow.material as THREE.MeshBasicMaterial).opacity = 0.75 * lift;
  }
  const tiltQuat = new THREE.Quaternion();
  const zAxis = new THREE.Vector3(0, 0, 1);

  // ---------- pointer ----------
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  let pointerId: number | null = null;
  let downAt = { x: 0, y: 0, time: 0 };
  let moved = false;
  let grab = { x: 0, z: 0 };

  function setRay(e: { clientX: number; clientY: number }) {
    const r = canvas.getBoundingClientRect();
    ndc.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1,
    );
    ray.setFromCamera(ndc, camera);
  }
  function overCharacter(e: { clientX: number; clientY: number }) {
    if (!charGroup.visible) return false;
    setRay(e);
    sprite.updateWorldMatrix(true, false);
    const hits = ray.intersectObject(sprite, false);
    const uv = hits[0]?.uv;
    if (!uv || !charTex) return false;
    // ignore the transparent corners of the sprite
    return alphaAt(charTex, uv.x, uv.y) > 24;
  }
  function floorPoint(e: { clientX: number; clientY: number }) {
    setRay(e);
    return ray.ray.intersectPlane(floorPlane, hit) ? hit : null;
  }

  function onPointerDown(e: PointerEvent) {
    if (pointerId !== null) return;
    if (overCharacter(e)) {
      pointerId = e.pointerId;
      canvas.setPointerCapture(e.pointerId);
      downAt = { x: e.clientX, y: e.clientY, time: performance.now() };
      moved = false;
      const p = floorPoint(e);
      grab = p ? { x: st.x - p.x, z: st.z - p.z } : { x: 0, z: 0 };
      st.dragX = st.x;
      st.dragZ = st.z;
      st.mode = "drag";
      st.vh = 0;
      if (!reducedMotion.matches) kick(6);
      canvas.style.cursor = "grabbing";
    } else {
      const p = floorPoint(e);
      if (
        p &&
        Math.abs(p.x) <= HALF &&
        Math.abs(p.z) <= HALF &&
        st.mode !== "drag"
      ) {
        startWalk(p.x, p.z);
      }
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (pointerId === null) {
      canvas.style.cursor = overCharacter(e) ? "grab" : "";
      return;
    }
    if (e.pointerId !== pointerId) return;
    if (Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 5)
      moved = true;
    const p = floorPoint(e);
    if (p) {
      st.dragX = p.x + grab.x;
      st.dragZ = p.z + grab.z;
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    canvas.style.cursor = overCharacter(e) ? "grab" : "";
    const quick = performance.now() - downAt.time < 300;
    if (!moved && quick) {
      st.mode = "air";
      st.h = 0;
      jump(5.2);
    } else {
      st.mode = "air"; // let go: fall and bounce
      st.vh = 0;
    }
  }

  // Touch: keep the page from scrolling while a finger is on the character.
  function onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    if (t && overCharacter(t)) e.preventDefault();
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });

  // ---------- size + loop ----------
  const corners: THREE.Vector3[] = [];
  for (const x of [-HALF - THICK, HALF])
    for (const y of [-THICK, WALL_H])
      for (const z of [-HALF - THICK, HALF])
        corners.push(new THREE.Vector3(x, y, z));

  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    const v = new THREE.Vector3();
    for (const c of corners) {
      v.copy(c).applyMatrix4(camera.matrixWorldInverse);
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    }
    const viewW = Math.max(maxX - minX, (maxY - minY) * aspect) * 1.06;
    const viewH = viewW / aspect;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    camera.left = cx - viewW / 2;
    camera.right = cx + viewW / 2;
    camera.top = cy + viewH / 2;
    camera.bottom = cy - viewH / 2;
    camera.updateProjectionMatrix();
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  let visible = true;
  let raf = 0;
  let last = performance.now();
  let clock = 0;
  function frame(now: number) {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    update(dt, clock);
    render();
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(host);
  const visObs = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  });
  visObs.observe(host);
  document.addEventListener("visibilitychange", start);
  resize();
  start();

  return {
    setTheme,
    setCharacter,
    dispose() {
      cancelAnimationFrame(raf);
      visible = false;
      resizeObs.disconnect();
      visObs.disconnect();
      document.removeEventListener("visibilitychange", start);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      charToken++;
      if (room) disposeTree(room);
      disposeTree(shadow);
      disposeTree(charGroup);
      shadowTex.dispose();
      charTex?.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}

// ---------- room construction ----------

function buildRoom(theme: RoomTheme): THREE.Group {
  const g = new THREE.Group();
  const wall = new THREE.Color(theme.wall);
  const wallLeft = wall.clone().offsetHSL(0, 0, -0.045);
  const wallEdge = wall.clone().offsetHSL(0, 0, -0.14);
  const trim = new THREE.Color("#fffaf0");
  const floorColor = new THREE.Color(theme.floor);
  const basic = (c: THREE.ColorRepresentation) =>
    new THREE.MeshBasicMaterial({ color: c });

  // floor slab (sides) + planks on top
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(HALF * 2 + THICK, THICK, HALF * 2 + THICK),
    basic(floorColor.clone().offsetHSL(0, 0, -0.16)),
  );
  slab.position.set(-THICK / 2, -THICK / 2, -THICK / 2);
  g.add(slab);
  // soft shadow the room casts on the page, so it rests instead of floating
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({
      map: radialTexture(),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(-THICK / 2, -THICK - 0.02, -THICK / 2);
  g.add(ground);

  const planks = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF * 2, HALF * 2),
    new THREE.MeshBasicMaterial({ map: plankTexture(theme.floor) }),
  );
  planks.rotation.x = -Math.PI / 2;
  planks.position.y = 0.002;
  g.add(planks);

  // walls: [+x, -x, +y, -y, +z, -z]
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(THICK, WALL_H, HALF * 2 + THICK),
    [
      basic(wallLeft),
      basic(wallEdge),
      basic(trim),
      basic(wallEdge),
      basic(wallEdge),
      basic(wallEdge),
    ],
  );
  leftWall.position.set(-HALF - THICK / 2, WALL_H / 2, -THICK / 2);
  g.add(leftWall);

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(HALF * 2, WALL_H, THICK),
    [
      basic(wallEdge),
      basic(wallEdge),
      basic(trim),
      basic(wallEdge),
      basic(wall),
      basic(wallEdge),
    ],
  );
  backWall.position.set(0, WALL_H / 2, -HALF - THICK / 2);
  g.add(backWall);

  // baseboards
  const board = basic(trim);
  const bl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, HALF * 2), board);
  bl.position.set(-HALF + 0.04, 0.13, 0);
  const bb = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2, 0.26, 0.08), board);
  bb.position.set(0, 0.13, -HALF + 0.04);
  g.add(bl, bb);

  // rug
  const rugColor = new THREE.Color(theme.rug);
  const rugLight = rugColor.clone().lerp(new THREE.Color("#ffffff"), 0.35);
  const rugAt = new THREE.Vector3(0.3, 0, 0.5);
  const rugShape = (r: number) =>
    theme.rugRound
      ? new THREE.CircleGeometry(r, 48)
      : new THREE.ShapeGeometry(roundedRect(r * 1.7, r * 1.35, 0.25 * r));
  const rugOuter = new THREE.Mesh(rugShape(1.7), basic(rugColor));
  const rugInner = new THREE.Mesh(rugShape(1.4), basic(rugLight));
  for (const [i, m] of [rugOuter, rugInner].entries()) {
    m.rotation.x = -Math.PI / 2;
    m.position.set(rugAt.x, 0.012 + i * 0.004, rugAt.z);
    g.add(m);
  }

  // window on the left wall
  const sky = skyColors(new Date().getHours());
  const night = sky[0] === "#0f2027";
  const win = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshBasicMaterial({
      map: windowTexture(theme.window, sky, night),
      transparent: true,
    }),
  );
  win.rotation.y = Math.PI / 2;
  win.position.set(-HALF + 0.02, 2.1, -0.4);
  g.add(win);

  // furniture that belongs to this house
  g.add(buildProps(theme));

  return g;
}

function roundedRect(w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// ---------- canvas textures ----------

function canvasTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d")!, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function plankTexture(base: string) {
  return canvasTexture(512, (ctx, n) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, n, n);
    const rows = 8;
    const rh = n / rows;
    for (let r = 0; r < rows; r++) {
      ctx.fillStyle = r % 2 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
      ctx.fillRect(0, r * rh, n, rh);
      ctx.fillStyle = "rgba(120,90,60,0.12)";
      ctx.fillRect(0, r * rh, n, 2);
      const off = (r * 173) % 256;
      ctx.fillRect(off, r * rh, 2, rh);
      ctx.fillRect((off + 256) % n, r * rh, 2, rh);
    }
  });
}

function windowTexture(
  shape: RoomTheme["window"],
  sky: [string, string],
  night: boolean,
) {
  return canvasTexture(256, (ctx, n) => {
    const pad = 14;
    const path = () => {
      ctx.beginPath();
      if (shape === "round") {
        ctx.arc(n / 2, n / 2, n / 2 - pad, 0, Math.PI * 2);
      } else if (shape === "arch") {
        const r = (n - pad * 2) / 2;
        ctx.moveTo(pad, n - pad);
        ctx.lineTo(pad, pad + r);
        ctx.arc(n / 2, pad + r, r, Math.PI, 0);
        ctx.lineTo(n - pad, n - pad);
        ctx.closePath();
      } else {
        ctx.roundRect(pad, pad, n - pad * 2, n - pad * 2, 14);
      }
    };
    path();
    const grad = ctx.createLinearGradient(0, 0, 0, n);
    grad.addColorStop(0, sky[0]);
    grad.addColorStop(1, sky[1]);
    ctx.fillStyle = grad;
    ctx.fill();
    if (night) {
      ctx.save();
      path();
      ctx.clip();
      ctx.fillStyle = "#fff8d6";
      for (const [x, y, r] of [
        [70, 80, 3],
        [150, 60, 2.5],
        [190, 130, 3],
        [100, 160, 2],
        [60, 200, 2.5],
      ])
        (ctx.beginPath(), ctx.arc(x, y, r, 0, Math.PI * 2), ctx.fill());
      ctx.restore();
    }
    // cross bars, then the frame on top
    ctx.save();
    path();
    ctx.clip();
    ctx.fillStyle = "#fffaf0";
    ctx.fillRect(n / 2 - 4, 0, 8, n);
    ctx.fillRect(0, n / 2 - 4 + 20, n, 8);
    ctx.restore();
    path();
    ctx.lineWidth = 12;
    ctx.strokeStyle = "#fffaf0";
    ctx.stroke();
  });
}

function radialTexture() {
  const tex = canvasTexture(128, (ctx, n) => {
    const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    g.addColorStop(0, "rgba(40,30,50,0.38)");
    g.addColorStop(0.6, "rgba(40,30,50,0.16)");
    g.addColorStop(1, "rgba(40,30,50,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, n, n);
  });
  return tex;
}

// ---------- helpers ----------

const alphaCache = new WeakMap<
  THREE.Texture,
  { data: Uint8ClampedArray; w: number; h: number }
>();

/** Alpha (0–255) of a loaded image texture at uv; used so only the drawn pixels grab. */
function alphaAt(tex: THREE.Texture, u: number, v: number) {
  let info = alphaCache.get(tex);
  if (!info) {
    const img = tex.image as HTMLImageElement;
    const w = 128;
    const h = Math.max(1, Math.round((128 * img.height) / img.width));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, w, h);
    info = { data: ctx.getImageData(0, 0, w, h).data, w, h };
    alphaCache.set(tex, info);
  }
  const x = Math.min(info.w - 1, Math.max(0, Math.floor(u * info.w)));
  const y = Math.min(info.h - 1, Math.max(0, Math.floor((1 - v) * info.h)));
  return info.data[(y * info.w + x) * 4 + 3];
}

function disposeTree(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    for (const m of Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material]) {
      const mat = m as THREE.MeshBasicMaterial;
      // the shared character / shadow textures are disposed by their owner
      if (mat.map && mat.userData.ownsMap !== false) mat.map.dispose();
      mat.dispose();
    }
  });
}

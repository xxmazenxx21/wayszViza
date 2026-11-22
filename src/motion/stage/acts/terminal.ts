/**
 * Act "terminal" — WaysZ Visa Services, «مطار الضوء» / "Terminal of Light" (docs/visa-services-creative-treatment.md).
 * A dreamlike airport floating above a sea of clouds at night, drawn in LIGHT: glowing edge lines, frosted glass,
 * fog and dust. The camera walks it like a crane and a dolly.
 *
 *   journey  host `.term__stage` behind hero → §2.1 → §2.2 → the information desk (bridge.terminal.shot · light ·
 *            counter · counterAct · gate · gateAct): outside → through the glass doors → four counters (the services)
 *            → a sideways dolly along five gate arches (the categories, each a portal onto a small world) → the "i" desk
 *   finale   host `.tcta__stage` in §2.4: the end window; a plane of light rolls down the runway and lifts off (takeoff)
 *
 * BUDGET (light like Home): primitives built in code and merged per kind — ONE glowing-line mesh, ONE frosted-panel
 * mesh, ONE instanced sprite mesh, ONE instanced dust mesh (+ the plane's three small meshes in the finale), a sky pass
 * and a finish overlay: 6 draw calls on the journey, 9 in the finale. No textures (sprite shapes are SDFs), no models,
 * no HDRI, no shadow maps, no render targets, no bloom. Everything but the sky and the finish is additive, so the
 * order of draws never matters on the shared canvas (no depth buffer).
 * RTL: the world mirrors (x × side: the concourse runs the other way); the plane is built facing the runway and never
 * mirrored, sprites (the "i") are never flipped, clock hands always turn clockwise. Decorative only: no words in 3D.
 */
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, DoubleSide, Group, InstancedBufferAttribute, InstancedBufferGeometry,
  Matrix4, Mesh, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, Vector4, type IUniform,
} from 'three';
import type { Act } from '../stage';
import { terminal } from '../bridge';
import {
  finishFragment, finishVertex, lineFragment, lineVertex, panelFragment, panelVertex, skyFragment, skyVertex,
  spriteFragment, spriteVertex,
} from '../shaders/terminal.glsl';
import { token } from './util';

type V3 = [number, number, number];
const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ramp = (v: number, a: number, b: number) => smooth(clamp((v - a) / (b - a)));
const bump = (d: number, r: number) => smooth(clamp(1 - Math.abs(d) / r));
const TAU = Math.PI * 2;

// ---------- light groups (uGroup) and motion slots (uSlot) ----------
const G = { frame: 0, hall: 1, approach: 2, counter: 3, world: 7, gate: 12, info: 17, runway: 18, plane: 19, dust: 20 } as const;
const S = { doors: 0, counter: 1, gate: 5, takeoff: 10, info: 11, on: 12, chase: 13 } as const;
// tones: 0 accent · 1 warm white · 2 dawn · 3 cool white
const ACCENT = 0, WARM = 1, DAWN = 2, COOL = 3;

// ---------- the terminal (LTR world units ≈ metres; x × side in RTL) ----------
const HX0 = -10, HX1 = 74;            // hall ends
const ZB = -3, ZF = 4, HH = 5;        // back wall (gates), facade (doors), roof height
const COUNTERS = [6, 13, 20, 27];
const CZ = -1;                         // counters stand in front of the back wall
const GATES = [36, 42, 48, 54, 60];
const ARCH = { hw: 1.1, spring: 2.3 };
const INFO: V3 = [67.5, 0, 0.6];
const RY = -1.6;                       // finale: the runway surface, below the window

// ---------- the builder: lines, panels and sprites merged into one geometry each ----------
type Motion = [number, number, number, number];   // mode, slot, p1, p2 (see MOTION in the shaders)
interface Look { tone?: number; i?: number; w?: number; g?: number; m?: Motion; pv?: V3; portal?: number }
interface PLook { tone?: number; i0?: number; i1?: number; g?: number; edge?: number; m?: Motion; pv?: V3; portal?: number }
interface SLook { tone?: number; i?: number; g?: number; shape?: number; mode?: number; p1?: number; p2?: number; slot?: number; portal?: number }

class World {
  L = { a: [] as number[], b: [] as number[], end: [] as number[], look: [] as number[], mot: [] as number[], piv: [] as number[], por: [] as number[], idx: [] as number[] };
  P = { pos: [] as number[], uv: [] as number[], size: [] as number[], nrm: [] as number[], look: [] as number[], edge: [] as number[], mot: [] as number[], piv: [] as number[], por: [] as number[], idx: [] as number[] };
  S = { pos: [] as number[], look: [] as number[], kind: [] as number[], slot: [] as number[], por: [] as number[] };
  constructor(private side: number) {}
  private x(p: V3): V3 { return [p[0] * this.side, p[1], p[2]]; }

  line(A: V3, B: V3, s: Look = {}) {
    const L = this.L, a = this.x(A), b = this.x(B), base = L.a.length / 3, pv = this.x(s.pv ?? [0, 0, 0]);
    for (const [t, sd] of [[0, -1], [0, 1], [1, 1], [1, -1]]) {
      L.a.push(...a); L.b.push(...b); L.end.push(t, sd);
      L.look.push(s.tone ?? ACCENT, s.i ?? 1, s.w ?? 0.02, s.g ?? G.frame);
      L.mot.push(...(s.m ?? [0, 0, 0, 0])); L.piv.push(...pv); L.por.push(s.portal ?? -1);
    }
    L.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  path(pts: V3[], s: Look = {}, closed = false) {
    for (let i = 0; i < pts.length - 1; i++) this.line(pts[i], pts[i + 1], s);
    if (closed) this.line(pts[pts.length - 1], pts[0], s);
  }
  /** points on a circle: plane 'xz' (lying) or 'xy' (standing, facing the viewer) */
  circlePts(c: V3, r: number, plane: 'xz' | 'xy', n = 24, a0 = 0, a1 = TAU, ry = r): V3[] {
    const pts: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * (i / n);
      pts.push(plane === 'xz' ? [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * ry] : [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * ry, c[2]]);
    }
    return pts;
  }
  ring(c: V3, r: number, plane: 'xz' | 'xy', s: Look = {}, n = 24) { this.path(this.circlePts(c, r, plane, n), s); }
  box(a: V3, b: V3, s: Look = {}) {
    const [x0, y0, z0] = a, [x1, y1, z1] = b;
    for (const y of [y0, y1]) this.path([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], s, true);
    for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) this.line([x, y0, z], [x, y1, z], s);
  }
  archPts(cx: number, z: number, hw: number, spring: number, y0 = 0, n = 18): V3[] {
    return [[cx - hw, y0, z], ...this.circlePts([cx, spring, z], hw, 'xy', n, Math.PI, 0), [cx + hw, y0, z]];
  }
  rectXY(cx: number, cy: number, z: number, w: number, h: number, s: Look = {}) {
    this.path([[cx - w / 2, cy - h / 2, z], [cx + w / 2, cy - h / 2, z], [cx + w / 2, cy + h / 2, z], [cx - w / 2, cy + h / 2, z]], s, true);
  }

  /** a frosted quad: bl, br, tr, tl */
  quad(p0: V3, p1: V3, p2: V3, p3: V3, s: PLook = {}) {
    const P = this.P, q = [p0, p1, p2, p3].map((p) => this.x(p)), base = P.pos.length / 3, pv = this.x(s.pv ?? [0, 0, 0]);
    const u = new Vector3(...q[1]).sub(new Vector3(...q[0])), v = new Vector3(...q[3]).sub(new Vector3(...q[0]));
    const n = u.clone().cross(v).normalize();
    const uvs = [[0, 0], [1, 0], [1, 1], [0, 1]];
    q.forEach((p, i) => {
      P.pos.push(...p); P.uv.push(...uvs[i]); P.size.push(u.length(), v.length()); P.nrm.push(n.x, n.y, n.z);
      P.look.push(s.tone ?? ACCENT, s.i0 ?? 0.04, s.i1 ?? s.i0 ?? 0.04, s.g ?? G.frame); P.edge.push(s.edge ?? 0.3);
      P.mot.push(...(s.m ?? [0, 0, 0, 0])); P.piv.push(...pv); P.por.push(s.portal ?? -1);
    });
    P.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  quadXY(cx: number, cy: number, z: number, w: number, h: number, s: PLook = {}) {
    this.quad([cx - w / 2, cy - h / 2, z], [cx + w / 2, cy - h / 2, z], [cx + w / 2, cy + h / 2, z], [cx - w / 2, cy + h / 2, z], s);
  }
  quadXZ(x0: number, x1: number, y: number, z0: number, z1: number, s: PLook = {}) {   // lying; v runs from z0 to z1
    this.quad([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], s);
  }

  dot(p: V3, size: number, s: SLook = {}) {
    const S_ = this.S;
    S_.pos.push(...this.x(p));
    S_.look.push(s.tone ?? ACCENT, s.i ?? 1, size, s.g ?? G.frame);
    S_.kind.push(s.shape ?? 0, s.mode ?? 0, s.p1 ?? 0, s.p2 ?? 0);
    S_.slot.push(s.slot ?? S.on); S_.por.push(s.portal ?? -1);
  }

  lineGeometry() {
    const L = this.L, g = new BufferGeometry();
    const f = (a: number[], n: number) => new BufferAttribute(new Float32Array(a), n);
    g.setAttribute('position', f(L.a, 3)); g.setAttribute('aB', f(L.b, 3)); g.setAttribute('aEnd', f(L.end, 2));
    g.setAttribute('aLook', f(L.look, 4)); g.setAttribute('aMotion', f(L.mot, 4)); g.setAttribute('aPivot', f(L.piv, 3));
    g.setAttribute('aPortal', f(L.por, 1)); g.setIndex(L.idx);
    return g;
  }
  panelGeometry() {
    const P = this.P, g = new BufferGeometry();
    const f = (a: number[], n: number) => new BufferAttribute(new Float32Array(a), n);
    g.setAttribute('position', f(P.pos, 3)); g.setAttribute('aUv', f(P.uv, 2)); g.setAttribute('aSize', f(P.size, 2));
    g.setAttribute('aNrm', f(P.nrm, 3)); g.setAttribute('aLook', f(P.look, 4)); g.setAttribute('aEdge', f(P.edge, 1));
    g.setAttribute('aMotion', f(P.mot, 4)); g.setAttribute('aPivot', f(P.piv, 3)); g.setAttribute('aPortal', f(P.por, 1));
    g.setIndex(P.idx);
    return g;
  }
  spriteGeometry(base: PlaneGeometry) {
    const S_ = this.S, g = new InstancedBufferGeometry();
    g.index = base.index; g.setAttribute('position', base.getAttribute('position'));
    const f = (a: number[], n: number) => new InstancedBufferAttribute(new Float32Array(a), n);
    g.setAttribute('aPos', f(S_.pos, 3)); g.setAttribute('aLook', f(S_.look, 4)); g.setAttribute('aKind', f(S_.kind, 4));
    g.setAttribute('aSlot', f(S_.slot, 1)); g.setAttribute('aPortal', f(S_.por, 1));
    g.instanceCount = S_.pos.length / 3;
    return g;
  }
}

// ---------- the journey world ----------
function buildHall(W: World) {
  const frame: Look = { tone: ACCENT, i: 0.55, w: 0.03, g: G.frame };
  // the floating slab and its floor
  W.box([HX0 - 1, -0.7, ZB - 0.8], [HX1 + 1, 0, ZF + 3], { ...frame, i: 0.7 });
  W.line([HX0 - 1, -0.7, ZF + 3], [HX1 + 1, -0.7, ZF + 3], { ...frame, i: 1, w: 0.05 });
  W.line([HX0, 0.01, 1.4], [HX1, 0.01, 1.4], { tone: ACCENT, i: 1.1, w: 0.035, g: G.hall });     // the walkway light
  W.quadXZ(HX0, HX1, 0.004, 0.9, 1.9, { i0: 0.05, i1: 0.05, edge: 0.2, g: G.hall });
  for (let x = HX0; x <= HX1; x += 6) W.line([x, 0.005, ZB - 0.4], [x, 0.005, ZF - 0.4], { tone: COOL, i: 0.12, w: 0.015, g: G.hall });
  // roof canopy: two edges and gently arched ribs
  W.line([HX0 - 1, HH, ZB - 0.4], [HX1 + 1, HH, ZB - 0.4], frame);
  W.line([HX0 - 1, HH, ZF + 2.6], [HX1 + 1, HH, ZF + 2.6], { ...frame, i: 0.95, w: 0.04 });
  for (let x = HX0; x <= HX1 + 0.1; x += 4) {
    const rib: V3[] = [];
    for (let i = 0; i <= 6; i++) { const u = i / 6; rib.push([x, HH + 0.55 * Math.sin(Math.PI * u), mix(ZB - 0.4, ZF + 2.6, u)]); }
    W.path(rib, { tone: ACCENT, i: 0.32, w: 0.025, g: G.frame });
  }
  // the facade (doors at x = 0) and the back wall (gates)
  const nearGate = (x: number) => GATES.some((g) => Math.abs(x - g) < 1.8);
  for (let x = HX0; x < HX1; x += 3) {
    if (Math.abs(x) > 1.7) W.line([x, 0, ZF], [x, HH, ZF], { ...frame, i: 0.45 });
    if (Math.abs(x + 1.5) > 1.6) W.quad([x, 0, ZF], [x + 3, 0, ZF], [x + 3, HH, ZF], [x, HH, ZF], { i0: 0.02, i1: 0.05, edge: 0.3 });
    if (!nearGate(x)) W.line([x, 0, ZB], [x, HH, ZB], { ...frame, i: 0.4 });
    if (!nearGate(x) && !nearGate(x + 3)) W.quad([x, 0, ZB], [x + 3, 0, ZB], [x + 3, HH, ZB], [x, HH, ZB], { i0: 0.018, i1: 0.04, edge: 0.25 });
  }
  W.line([HX0, 3.4, ZF], [-1.6, 3.4, ZF], frame); W.line([1.6, 3.4, ZF], [HX1, 3.4, ZF], frame);
  W.path([[-1.6, 0, ZF], [-1.6, 3.1, ZF], [1.6, 3.1, ZF], [1.6, 0, ZF]], { ...frame, i: 1.1, w: 0.04 });
  W.line([HX0, HH, ZF], [HX1, HH, ZF], frame);
  for (const x of [HX0, HX1]) W.path([[x, 0, ZB], [x, HH, ZB], [x, HH, ZF], [x, 0, ZF]], frame);
  // the sliding doors: open with the hero (slot doors)
  for (const d of [-1, 1]) {
    const m: Motion = [2, S.doors, 0.2, 0.6], pv: V3 = [d * 1.45, 0, 0];
    const x0 = d < 0 ? -1.5 : 0, x1 = d < 0 ? 0 : 1.5;
    W.path([[x0, 0.02, ZF], [x1, 0.02, ZF], [x1, 3.0, ZF], [x0, 3.0, ZF]], { ...frame, i: 0.9, m, pv }, true);
    W.quad([x0, 0.02, ZF], [x1, 0.02, ZF], [x1, 3.0, ZF], [x0, 3.0, ZF], { i0: 0.05, i1: 0.1, edge: 0.6, m, pv });
  }
  // downlights in the ceiling (warm), woken by the hero
  for (let x = HX0 + 2; x < HX1; x += 4) for (const z of [0.2, 2.6]) {
    W.dot([x, HH - 0.2, z], 0.7, { tone: WARM, i: 0.55, g: G.hall });
    W.dot([x, HH - 0.2, z], 0.16, { tone: WARM, i: 1.2, g: G.hall, shape: 1 });
  }
}

function buildApproach(W: World) {
  const g = G.approach;
  W.box([-4, -0.5, ZF + 3], [4, 0, 46], { tone: ACCENT, i: 0.45, w: 0.03, g });
  for (let z = ZF + 4; z < 44; z += 3) W.line([0, 0.01, z], [0, 0.01, z + 1.2], { tone: COOL, i: 0.4, w: 0.07, g });
  // approach lights: two rows that pulse toward the doors, running far out into the night
  for (let z = ZF + 4.5; z < 140; z += 2.4) {
    const p1 = 1 - (z - ZF) / 136;
    for (const x of [-2.6, 2.6]) W.dot([x, z < 46 ? 0.06 : -0.3, z], 0.32, { tone: WARM, i: 1, g, shape: 1, mode: 1, p1, p2: 0.32, slot: S.on });
  }
  for (const z of [56, 72, 88, 104, 120]) for (let x = -3; x <= 3.01; x += 1) W.dot([x, -0.3, z], 0.26, { tone: ACCENT, i: 0.9, g, shape: 1 });
}

function counterBase(W: World, k: number) {
  const cx = COUNTERS[k], g = G.counter + k;
  W.quad([cx - 1.8, 0, CZ - 1.05], [cx + 1.8, 0, CZ - 1.05], [cx + 1.8, 2.7, CZ - 1.05], [cx - 1.8, 2.7, CZ - 1.05], { i0: 0.02, i1: 0.08, edge: 0.5, g });
  W.line([cx - 1.5, 2.5, CZ - 1.0], [cx + 1.5, 2.5, CZ - 1.0], { tone: ACCENT, i: 1.3, w: 0.04, g });
  W.path([[cx - 2, 0.006, CZ - 1.25], [cx + 2, 0.006, CZ - 1.25], [cx + 2, 0.006, CZ + 1.45], [cx - 2, 0.006, CZ + 1.45]], { tone: ACCENT, i: 0.3, w: 0.02, g }, true);
}

function consultation(W: World) {
  const cx = COUNTERS[0], g = G.counter, t: Look = { tone: ACCENT, i: 0.95, w: 0.025, g };
  counterBase(W, 0);
  W.box([cx - 0.9, 0, CZ - 0.35], [cx + 0.9, 0.78, CZ + 0.35], t);
  W.quad([cx - 0.9, 0, CZ + 0.35], [cx + 0.9, 0, CZ + 0.35], [cx + 0.9, 0.78, CZ + 0.35], [cx - 0.9, 0.78, CZ + 0.35], { i0: 0.05, i1: 0.13, edge: 0.6, g });
  W.quadXZ(cx - 0.9, cx + 0.9, 0.78, CZ - 0.35, CZ + 0.35, { i0: 0.06, edge: 0.4, g });
  for (const d of [-1, 1]) {                                                   // two stools of light, facing each other
    const sx = cx + d * 1.35, w: Look = { tone: WARM, i: 0.85, w: 0.022, g };
    W.ring([sx, 0.5, CZ + 0.05], 0.24, 'xz', w, 20); W.ring([sx, 0.01, CZ + 0.05], 0.2, 'xz', w, 20);
    W.ring([sx, 0.2, CZ + 0.05], 0.15, 'xz', { ...w, i: 0.4 }, 16); W.line([sx, 0.01, CZ + 0.05], [sx, 0.5, CZ + 0.05], w);
  }
  for (const [x, z] of [[-0.45, 0.05], [0.25, 0.08]]) {                       // two sheets on the desk
    W.path([[cx + x - 0.12, 0.785, CZ + z - 0.16], [cx + x + 0.12, 0.785, CZ + z - 0.16], [cx + x + 0.12, 0.785, CZ + z + 0.16], [cx + x - 0.12, 0.785, CZ + z + 0.16]], { tone: WARM, i: 0.55, w: 0.012, g }, true);
  }
  W.path([[cx + 0.62, 0.78, CZ - 0.2], [cx + 0.62, 1.28, CZ - 0.2], [cx + 0.38, 1.38, CZ - 0.12]], { ...t, i: 0.6 });
  W.dot([cx + 0.38, 1.36, CZ - 0.12], 0.14, { tone: WARM, i: 1.4, g, shape: 1 });
  // the glow between them breathes and grows with the rest (counterAct)
  W.dot([cx, 1.05, CZ], 1.3, { tone: WARM, i: 0.4, g, mode: 6, slot: S.counter });
  W.dot([cx, 1.1, CZ - 0.1], 2.6, { tone: ACCENT, i: 0.3, g, mode: 6, slot: S.counter, p1: 1.7 });
}

function readiness(W: World) {
  const cx = COUNTERS[1], g = G.counter + 1, slot = S.counter + 1, t: Look = { tone: ACCENT, i: 0.8, w: 0.025, g };
  counterBase(W, 1);
  W.box([cx - 2.1, 0.62, CZ - 0.25], [cx + 2.1, 0.72, CZ + 0.25], t);           // the belt
  W.quadXZ(cx - 2.1, cx + 2.1, 0.72, CZ - 0.25, CZ + 0.25, { i0: 0.05, edge: 0.3, g });
  for (const x of [-1.95, 1.95]) for (const z of [-0.2, 0.2]) W.line([cx + x, 0, CZ + z], [cx + x, 0.62, CZ + z], { ...t, i: 0.4 });
  for (let x = -1.9; x <= 1.9; x += 0.35) W.line([cx + x, 0.725, CZ - 0.25], [cx + x, 0.725, CZ + 0.25], { tone: COOL, i: 0.18, w: 0.012, g });
  for (const z of [-0.3, 0.3]) W.path(W.archPts(cx, CZ + z, 0.62, 1.55), { tone: ACCENT, i: 1.25, w: 0.035, g });   // the arch of light
  W.line([cx, 2.17, CZ - 0.3], [cx, 2.17, CZ + 0.3], { ...t, i: 1 });
  W.quadXY(cx, 1.13, CZ, 1.16, 0.82, { i0: 0.13, i1: 0.04, edge: 0, g, m: [10, slot, 0, 0] });
  // three sheets glide through it in turn, turn blue (checked) and get a check
  [[-1.05, 0, 0.35], [-1.45, 0.22, 0.48], [-1.85, 0.44, 0.62]].forEach(([x0, phase, th]) => {
    const x = cx + x0, y = 0.74, z = CZ + 0.02, pv: V3 = [3, 0, 0];
    const m: Motion = [6, slot, phase, th], sheet: Look = { tone: WARM, i: 1, w: 0.02, g, m, pv };
    W.rectXY(x, y + 0.23, z, 0.34, 0.46, sheet);
    for (let r = 0; r < 3; r++) W.line([x - 0.11, y + 0.33 - r * 0.08, z], [x + (r === 2 ? 0.02 : 0.11), y + 0.33 - r * 0.08, z], { ...sheet, i: 0.5, w: 0.014 });
    W.quadXY(x, y + 0.23, z - 0.005, 0.34, 0.46, { tone: WARM, i0: 0.14, edge: 0.5, g, m, pv });
    W.path([[x - 0.07, y + 0.12, z + 0.01], [x - 0.01, y + 0.06, z + 0.01], [x + 0.1, y + 0.19, z + 0.01]], { tone: ACCENT, i: 1.7, w: 0.03, g, m: [8, slot, phase, th], pv });
  });
}

function guidance(W: World) {
  const cx = COUNTERS[2], g = G.counter + 2, slot = S.counter + 2;
  counterBase(W, 2);
  W.ring([cx, 0.01, CZ], 0.36, 'xz', { tone: ACCENT, i: 0.7, w: 0.025, g }); W.ring([cx, 0.01, CZ], 0.2, 'xz', { tone: ACCENT, i: 0.5, w: 0.02, g });
  W.dot([cx, 0.05, CZ], 1.1, { tone: ACCENT, i: 0.35, g });
  for (const d of [-0.04, 0.04]) W.line([cx + d, 0.01, CZ], [cx + d, 1.0, CZ], { tone: ACCENT, i: 0.55, w: 0.02, g });
  // the floating kiosk screen, tilted back
  const w = 1.2, h = 0.84, tilt = 0.22, cy = 1.52;
  const at = (u: number, v: number, lift = 0): V3 => [cx + (u - 0.5) * w, cy + (v - 0.5) * h * Math.cos(tilt), CZ + 0.05 - (v - 0.5) * h * Math.sin(tilt) + lift];
  W.path([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], { tone: ACCENT, i: 1, w: 0.03, g }, true);
  W.quad(at(0, 0), at(1, 0), at(1, 1), at(0, 1), { i0: 0.07, i1: 0.12, edge: 0.7, g });
  W.dot([cx, cy, CZ - 0.2], 2.4, { tone: ACCENT, i: 0.28, g });
  const fieldRect = (u0: number, u1: number, v0: number, v1: number, s: Look) => W.path([at(u0, v0, 0.01), at(u1, v0, 0.01), at(u1, v1, 0.01), at(u0, v1, 0.01)], s, true);
  [0.7, 0.5, 0.3].forEach((v, i) => {                                           // fields light up one by one, text appears
    W.line(at(0.1, v + 0.13, 0.01), at(0.3, v + 0.13, 0.01), { tone: COOL, i: 0.3, w: 0.012, g });
    fieldRect(0.1, 0.9, v - 0.05, v + 0.06, { tone: COOL, i: 0.22, w: 0.012, g });
    fieldRect(0.1, 0.9, v - 0.05, v + 0.06, { tone: ACCENT, i: 1.2, w: 0.02, g, m: [3, slot, 0.05 + i * 0.22, 0.16 + i * 0.22] });
    W.line(at(0.14, v, 0.012), at(0.14 + [0.42, 0.3, 0.52][i], v, 0.012), { tone: WARM, i: 1, w: 0.022, g, m: [3, slot, 0.12 + i * 0.22, 0.26 + i * 0.22] });
  });
  fieldRect(0.6, 0.9, 0.07, 0.17, { tone: COOL, i: 0.25, w: 0.012, g });
  fieldRect(0.6, 0.9, 0.07, 0.17, { tone: ACCENT, i: 1.4, w: 0.022, g, m: [3, slot, 0.78, 0.9] });
  W.quad(at(0.6, 0.07, 0.008), at(0.9, 0.07, 0.008), at(0.9, 0.17, 0.008), at(0.6, 0.17, 0.008), { i0: 0.4, edge: 0.4, g, m: [3, slot, 0.8, 0.95] });
}

function appointment(W: World) {
  const cx = COUNTERS[3], g = G.counter + 3, slot = S.counter + 3;
  counterBase(W, 3);
  // the clock tower: its hands turn with the rest (clockwise, never mirrored)
  const tx = cx - 1.3, tz = CZ - 0.3, C: V3 = [tx, 2.98, tz];
  for (const d of [-0.07, 0.07]) W.line([tx + d, 0, tz], [tx + d, 2.54, tz], { tone: ACCENT, i: 0.6, w: 0.022, g });
  W.ring(C, 0.43, 'xy', { tone: ACCENT, i: 1.1, w: 0.03, g }, 36);
  W.ring(C, 0.36, 'xy', { tone: COOL, i: 0.22, w: 0.012, g }, 36);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU, r0 = i % 3 === 0 ? 0.27 : 0.31;
    W.line([C[0] + Math.sin(a) * r0, C[1] + Math.cos(a) * r0, tz], [C[0] + Math.sin(a) * 0.36, C[1] + Math.cos(a) * 0.36, tz], { tone: i % 3 === 0 ? ACCENT : COOL, i: 0.7, w: 0.016, g });
  }
  W.line(C, [C[0], C[1] + 0.31, tz + 0.01], { tone: WARM, i: 1.3, w: 0.028, g, m: [1, slot, 1, 0], pv: C });
  W.line(C, [C[0] - 0.165, C[1] + 0.095, tz + 0.012], { tone: WARM, i: 1.3, w: 0.034, g, m: [1, slot, 1 / 12, 0], pv: C });
  W.dot(C, 1.2, { tone: ACCENT, i: 0.4, g });
  W.dot(C, 0.07, { tone: WARM, i: 1.5, g, shape: 1 });
  // the board of light: rows switch on in sequence
  const bx = cx + 0.45, by = 1.55, bz = CZ - 0.45;
  W.quadXY(bx, by, bz, 1.7, 1.05, { i0: 0.05, i1: 0.09, edge: 0.7, g });
  W.rectXY(bx, by, bz + 0.005, 1.7, 1.05, { tone: ACCENT, i: 0.8, w: 0.02, g });
  const cols = [[-0.7, -0.22], [-0.12, 0.25], [0.35, 0.68]];
  for (let r = 0; r < 5; r++) cols.forEach(([u0, u1], c) => {
    const y = by + 0.36 - r * 0.18;
    W.line([bx + u0, y, bz + 0.01], [bx + u1, y, bz + 0.01], { tone: COOL, i: 0.16, w: 0.03, g });
    const t0 = 0.06 + r * 0.16 + c * 0.04;
    W.line([bx + u0, y, bz + 0.012], [bx + u1, y, bz + 0.012], { tone: c === 0 ? WARM : ACCENT, i: 0.95, w: 0.034, g, m: [3, slot, t0, t0 + 0.08] });
  });
  // a waiting seat
  const sx = cx + 0.4, sz = CZ + 0.9, w: Look = { tone: WARM, i: 0.8, w: 0.022, g };
  W.path([[sx - 0.75, 0.45, sz - 0.22], [sx + 0.75, 0.45, sz - 0.22], [sx + 0.75, 0.45, sz + 0.22], [sx - 0.75, 0.45, sz + 0.22]], w, true);
  W.path([[sx - 0.75, 0.45, sz - 0.22], [sx - 0.75, 0.92, sz - 0.3], [sx + 0.75, 0.92, sz - 0.3], [sx + 0.75, 0.45, sz - 0.22]], w);
  for (const x of [-0.68, 0.68]) for (const z of [-0.18, 0.18]) W.line([sx + x, 0, sz + z], [sx + x, 0.45, sz + z], { ...w, i: 0.45 });
  W.quadXZ(sx - 0.75, sx + 0.75, 0.452, sz - 0.22, sz + 0.22, { tone: WARM, i0: 0.06, edge: 0.4, g });
  W.dot([sx, 0.05, sz], 1.6, { tone: WARM, i: 0.18, g });
}

function gates(W: World) {
  GATES.forEach((gx, k) => {
    const g = G.gate + k;
    for (const z of [ZB, ZB - 0.3]) W.path(W.archPts(gx, z, ARCH.hw, ARCH.spring), { tone: ACCENT, i: z === ZB ? 1.1 : 0.45, w: 0.035, g });
    W.path(W.archPts(gx, ZB + 0.02, ARCH.hw + 0.12, ARCH.spring), { tone: ACCENT, i: 0.3, w: 0.018, g });
    W.line([gx, ARCH.spring + ARCH.hw, ZB], [gx, ARCH.spring + ARCH.hw, ZB - 0.3], { tone: ACCENT, i: 0.5, w: 0.02, g });
    W.line([gx - ARCH.hw, 0.01, ZB], [gx + ARCH.hw, 0.01, ZB], { tone: ACCENT, i: 1.5, w: 0.045, g });
    W.quadXZ(gx - ARCH.hw, gx + ARCH.hw, 0.004, ZB, ZB + 1.8, { i0: 0.12, i1: 0.0, edge: 0, g });
    W.quadXY(gx, 4.0, ZB + 0.01, 1.3, 0.42, { i0: 0.06, edge: 0.8, g });          // a blank sign: the gate number lives in the DOM
    W.line([gx - 0.55, 3.72, ZB + 0.01], [gx + 0.55, 3.72, ZB + 0.01], { tone: ACCENT, i: 1, w: 0.025, g });
    W.box([gx + 1.65, 0, ZB + 0.4], [gx + 2.25, 1.0, ZB + 0.9], { tone: COOL, i: 0.25, w: 0.016, g });
    W.dot([gx, 2.0, ZB - 0.2], 3.4, { tone: ACCENT, i: 0.2, g });
  });
}

// the five glimpses behind the gates: each lives behind its arch (portal k) and wakes with its rest (gateAct)
function worlds(W: World) {
  const L = (k: number, s: Look = {}): Look => ({ g: G.world + k, portal: k, ...s });
  const Pl = (k: number, s: PLook = {}): PLook => ({ g: G.world + k, portal: k, ...s });
  const Sp = (k: number, s: SLook = {}): SLook => ({ g: G.world + k, portal: k, ...s });
  const slot = (k: number) => S.gate + k;

  { // 0 · Student: a library arch with shelves of books, pages floating before it
    const x = GATES[0], z = -11.5;
    W.path(W.archPts(x, z, 2.1, 2.9), L(0, { tone: ACCENT, i: 1, w: 0.05 }));
    W.path(W.archPts(x, z + 0.4, 2.3, 2.9), L(0, { tone: ACCENT, i: 0.35, w: 0.03 }));
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (const sy of [0.5, 1.3, 2.1, 2.9]) {
      W.line([x - 1.9, sy, z + 0.05], [x + 1.9, sy, z + 0.05], L(0, { tone: ACCENT, i: 0.6, w: 0.03 }));
      if (sy > 2.8) continue;
      for (let bx = -1.8; bx < 1.75; bx += 0.17 + rnd() * 0.06) {
        const h = 0.42 + rnd() * 0.3;
        W.line([x + bx, sy + 0.03, z + 0.08], [x + bx, sy + h, z + 0.08], L(0, { tone: rnd() > 0.55 ? WARM : ACCENT, i: 0.55 + rnd() * 0.4, w: 0.05, m: [9, slot(0), rnd() * 0.5, 0.6 + rnd() * 0.3] }));
      }
    }
    [[-1.3, 1.8, -7.2], [0.9, 2.6, -6.6], [-0.2, 3.4, -8.4], [1.6, 1.4, -8.8], [-1.9, 3.0, -9.4], [0.4, 1.2, -7.6], [1.1, 3.9, -9.8]].forEach(([px, py, pz], i) => {
      const spine: V3 = [x + px, py, pz], m: Motion = [4, slot(0), i * 0.37, 0.2];
      const c: V3[] = [[x + px, py - 0.18, pz], [x + px + 0.3, py - 0.18, pz], [x + px + 0.3, py + 0.18, pz], [x + px, py + 0.18, pz]];
      W.path(c, L(0, { tone: WARM, i: 1, w: 0.02, m, pv: spine }), true);
      W.quad(c[0], c[1], c[2], c[3], Pl(0, { tone: WARM, i0: 0.16, edge: 0.6, m, pv: spine }));
      for (let r = 0; r < 3; r++) W.line([x + px + 0.05, py + 0.08 - r * 0.07, pz], [x + px + 0.25, py + 0.08 - r * 0.07, pz], L(0, { tone: WARM, i: 0.45, w: 0.012, m, pv: spine }));
    });
    W.dot([x, 1.6, z + 0.3], 5, Sp(0, { tone: WARM, i: 0.22, mode: 6, slot: slot(0) }));
  }
  { // 1 · Business: a conference stage, rows of chairs, a lectern under its light
    const x = GATES[1], s = slot(1);
    W.box([x - 2, 0, -11], [x + 2, 0.4, -9.6], L(1, { tone: ACCENT, i: 0.8, w: 0.03 }));
    W.rectXY(x, 1.55, -11.05, 3.6, 2.1, L(1, { tone: ACCENT, i: 0.9, w: 0.035 }));
    W.quadXY(x, 1.55, -11.1, 3.6, 2.1, Pl(1, { i0: 0.08, i1: 0.14, edge: 0.6, m: [9, s, 0, 0.5] }));
    const lx = x + 1.0, lz = -9.9;
    W.path([[lx - 0.25, 0.4, lz], [lx - 0.18, 1.3, lz], [lx + 0.18, 1.3, lz], [lx + 0.25, 0.4, lz]], L(1, { tone: WARM, i: 1, w: 0.025 }), true);
    W.quad([lx - 0.25, 0.4, lz], [lx + 0.25, 0.4, lz], [lx + 0.18, 1.3, lz], [lx - 0.18, 1.3, lz], Pl(1, { tone: WARM, i0: 0.1, edge: 0.5 }));
    W.quad([lx - 0.7, 0.42, lz + 0.2], [lx + 0.7, 0.42, lz + 0.2], [lx + 0.12, 5.2, lz], [lx - 0.12, 5.2, lz], Pl(1, { tone: WARM, i0: 0.2, i1: 0.0, edge: 0, m: [3, s, 0.1, 0.45] }));
    W.dot([lx, 1.5, lz], 1.4, Sp(1, { tone: WARM, i: 0.7, mode: 5, p1: 0.1, p2: 0.45, slot: s }));
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {                  // the chairs fill with light row by row
      const cx = x - 1.5 + c * 0.6, cz = -8.6 + r * 0.75, m: Motion = [9, s, 0.3 + r * 0.14, 0.42 + r * 0.14];
      const st = L(1, { tone: r % 2 ? ACCENT : WARM, i: 0.8, w: 0.018, m });
      W.path([[cx - 0.2, 0.45, cz], [cx - 0.2, 0.85, cz - 0.05], [cx + 0.2, 0.85, cz - 0.05], [cx + 0.2, 0.45, cz]], st);
      W.line([cx - 0.2, 0.45, cz], [cx + 0.2, 0.45, cz], st);
      W.line([cx - 0.2, 0.45, cz + 0.32], [cx + 0.2, 0.45, cz + 0.32], { ...st, i: 0.5 });
      for (const d of [-0.18, 0.18]) W.line([cx + d, 0, cz + 0.16], [cx + d, 0.45, cz + 0.16], { ...st, i: 0.35 });
    }
  }
  { // 2 · Immigration & Residence: a city grid of lit windows
    const x = GATES[2], s = slot(2);
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = -5; i <= 5; i++) W.line([x + i * 0.9, 0.005, -6], [x + i * 0.9, 0.005, -16], L(2, { tone: ACCENT, i: 0.3, w: 0.02 }));
    for (let j = 0; j <= 10; j++) W.line([x - 4.5, 0.005, -6 - j], [x + 4.5, 0.005, -6 - j], L(2, { tone: ACCENT, i: 0.3, w: 0.02 }));
    const blocks: [number, number, number, number][] = [[-3.2, -13, 1.2, 5.5], [-1.6, -11.5, 1.0, 3.6], [-0.2, -14, 1.4, 6.8], [1.5, -12, 1.1, 4.4], [3.0, -13.5, 1.2, 5.2], [-2.5, -9, 0.9, 2.2], [0.8, -9.5, 1.0, 2.8], [2.4, -8.6, 0.8, 1.8]];
    for (const [bx, bz, bw, bh] of blocks) {
      W.box([x + bx - bw / 2, 0, bz - 0.5], [x + bx + bw / 2, bh, bz + 0.5], L(2, { tone: ACCENT, i: 0.7, w: 0.025 }));
      W.quadXY(x + bx, bh / 2, bz + 0.5, bw, bh, Pl(2, { i0: 0.05, i1: 0.02, edge: 0.4 }));
      for (let wy = 0.35; wy < bh - 0.2; wy += 0.36) for (let wx = -bw / 2 + 0.18; wx < bw / 2 - 0.1; wx += 0.24) {
        W.dot([x + bx + wx, wy, bz + 0.52], 0.12, Sp(2, { tone: rnd() > 0.3 ? WARM : ACCENT, i: 0.9, shape: 4, mode: 2, p1: rnd() * 0.85, p2: rnd() * 2, slot: s }));
      }
    }
  }
  { // 3 · Family: two small houses joined by a ribbon of light that draws itself
    const x = GATES[3], s = slot(3);
    const house = (hx: number, hz: number, w: number, h: number) => {
      const st = L(3, { tone: WARM, i: 1, w: 0.03 });
      W.path([[hx - w / 2, 0, hz], [hx - w / 2, h, hz], [hx, h + w * 0.42, hz], [hx + w / 2, h, hz], [hx + w / 2, 0, hz]], st);
      W.line([hx - w / 2, 0, hz], [hx + w / 2, 0, hz], st);
      W.quad([hx - w / 2, 0, hz], [hx + w / 2, 0, hz], [hx + w / 2, h, hz], [hx - w / 2, h, hz], Pl(3, { tone: WARM, i0: 0.06, edge: 0.4 }));
      W.path([[hx - 0.13, 0, hz + 0.01], [hx - 0.13, 0.45, hz + 0.01], [hx + 0.13, 0.45, hz + 0.01], [hx + 0.13, 0, hz + 0.01]], { ...st, i: 0.8 });
      for (const d of [-1, 1]) W.dot([hx + d * w * 0.27, h * 0.62, hz + 0.02], 0.2, Sp(3, { tone: WARM, i: 1, shape: 4, mode: 6, slot: s, p1: d }));
      return [hx, 0.45, hz + 0.02] as V3;
    };
    const a = house(x - 1.7, -9, 1.2, 0.95), b = house(x + 1.8, -10.2, 1.3, 1.05);
    const n = 48, pts: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      pts.push([mix(a[0], b[0], u), mix(a[1], b[1], u) + Math.sin(Math.PI * u) * 2.3, mix(a[2], b[2], u) + Math.sin(Math.PI * u) * 0.6]);
    }
    for (let i = 0; i < n; i++) W.line(pts[i], pts[i + 1], L(3, { tone: ACCENT, i: 1.3, w: 0.04, m: [7, s, i / n, 0] }));
    W.line([x - 4, 0.005, -9.6], [x + 4, 0.005, -9.6], L(3, { tone: ACCENT, i: 0.35, w: 0.02 }));
    W.dot([x, 2.2, -9.8], 4.2, Sp(3, { tone: WARM, i: 0.2, mode: 6, slot: s }));
  }
  { // 4 · Tourist: a horizon at dawn, hills, balloons rising
    const x = GATES[4], s = slot(4);
    W.quad([x - 7, -0.4, -15], [x + 7, -0.4, -15], [x + 7, 4.8, -15], [x - 7, 4.8, -15], Pl(4, { tone: DAWN, i0: 0.34, i1: 0.0, edge: 0, m: [9, s, 0, 0.6] }));
    W.line([x - 7, 0.6, -14.9], [x + 7, 0.6, -14.9], L(4, { tone: DAWN, i: 1.1, w: 0.04 }));
    W.dot([x + 1.2, 0.6, -14.8], 2.6, Sp(4, { tone: DAWN, i: 0.9, mode: 6, slot: s }));
    W.dot([x + 1.2, 0.6, -14.8], 0.6, Sp(4, { tone: WARM, i: 1.2 }));
    for (const [hz, amp, ph] of [[-13, 0.7, 0.4], [-11, 0.45, 2.1]]) {
      const hill: V3[] = [];
      for (let i = 0; i <= 28; i++) { const u = i / 28; hill.push([x - 6 + u * 12, 0.25 + amp * (0.5 + 0.5 * Math.sin(u * 7 + ph)) * (0.6 + 0.4 * Math.sin(u * 3.1)), hz]); }
      W.path(hill, L(4, { tone: ACCENT, i: 0.55, w: 0.03 }));
    }
    [[-1.4, 2.4, -10, 0.55, 1.4], [1.3, 3.4, -12, 0.45, 1.0], [0.1, 1.7, -8.5, 0.35, 1.8]].forEach(([bx, by, bz, r, rise], i) => {
      const m: Motion = [5, s, i * 1.3, rise], c: V3 = [x + bx, by, bz];
      const st = L(4, { tone: i === 1 ? DAWN : WARM, i: 1, w: 0.025, m });
      const env: V3[] = [];                                                     // the envelope: a soft teardrop
      for (let j = 0; j <= 28; j++) {
        const a = (j / 28) * TAU, sx = Math.sin(a), cy = Math.cos(a);
        env.push([c[0] + sx * r * (cy < 0 ? 0.55 + 0.45 * (1 + cy) : 1), c[1] + cy * r * (cy < 0 ? 1.25 : 1), bz]);
      }
      W.path(env, st);
      for (const f of [-0.5, 0, 0.5]) {
        const gore: V3[] = [];
        for (let j = 0; j <= 10; j++) { const a = (j / 10) * Math.PI; gore.push([c[0] + f * Math.sin(a) * r, c[1] + Math.cos(a) * r * (Math.cos(a) < 0 ? 1.25 : 1), bz]); }
        W.path(gore, { ...st, i: 0.45 });
      }
      const by0 = c[1] - r * 1.25 - 0.18;
      W.path([[c[0] - 0.09, by0, bz], [c[0] + 0.09, by0, bz], [c[0] + 0.09, by0 + 0.12, bz], [c[0] - 0.09, by0 + 0.12, bz]], st, true);
      for (const d of [-1, 1]) W.line([c[0] + d * 0.09, by0 + 0.12, bz], [c[0] + d * r * 0.4, c[1] - r * 1.05, bz], { ...st, i: 0.5 });
      W.dot([c[0], c[1] - r * 0.4, bz + 0.05], r * 2.2, Sp(4, { tone: WARM, i: 0.3 }));
    });
  }
}

function infoDesk(W: World) {
  const [x, , z] = INFO, g = G.info, st: Look = { tone: ACCENT, i: 1, w: 0.03, g };
  W.ring([x, 0.95, z], 1.25, 'xz', st, 40); W.ring([x, 0.95, z], 0.95, 'xz', { ...st, i: 0.5 }, 40); W.ring([x, 0.01, z], 1.2, 'xz', { ...st, i: 0.6 }, 40);
  const n = 18;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU;
    const p = (a: number, y: number, r = 1.22): V3 => [x + Math.cos(a) * r, y, z + Math.sin(a) * r];
    W.quad(p(a0, 0.01), p(a1, 0.01), p(a1, 0.94), p(a0, 0.94), { i0: 0.04, i1: 0.1, edge: 0.15, g });
    if (i % 3 === 0) W.line(p(a0, 0.01), p(a0, 0.94), { ...st, i: 0.3, w: 0.015 });
  }
  W.line([x, 1.5, z], [x, HH, z], { ...st, i: 0.25, w: 0.015 });
  W.dot([x, 2.65, z], 1.15, { tone: ACCENT, i: 1, g, shape: 2, mode: 6, slot: S.info });   // the "i" pictogram (never mirrored)
  W.dot([x, 2.65, z], 3.2, { tone: ACCENT, i: 0.3, g, mode: 6, slot: S.info, p1: 2 });
  W.dot([x, 0.05, z], 3.4, { tone: ACCENT, i: 0.22, g });
}

// ---------- the finale world: the end window, the runway, a plane of light ----------
function buildFinale(W: World) {
  const g = G.runway;
  const frame: Look = { tone: ACCENT, i: 0.5, w: 0.03, g: G.frame };
  const wz = 3.2;                                                               // the end window
  W.line([-6, 0, wz], [6, 0, wz], { ...frame, i: 0.9, w: 0.04 }); W.line([-6, 4.6, wz], [6, 4.6, wz], frame);
  for (const x of [-4.2, 4.2]) W.line([x, 0, wz], [x, 4.6, wz], frame);
  W.quad([-4.2, 0, wz], [4.2, 0, wz], [4.2, 4.6, wz], [-4.2, 4.6, wz], { i0: 0.01, i1: 0.028, edge: 0 });
  for (const x of [-6, 6]) W.line([x, 0, wz], [x, 0, wz + 6], frame);
  W.line([-5, 0.005, wz + 1.6], [5, 0.005, wz + 1.6], { tone: ACCENT, i: 0.5, w: 0.03, g: G.frame });
  // the runway on its floating strip
  W.box([-3.8, RY - 0.6, -2], [3.8, RY, -270], { tone: ACCENT, i: 0.4, w: 0.04, g });
  for (let z = -8; z > -255; z -= 6.5) W.line([0, RY + 0.01, z], [0, RY + 0.01, z - 2.6], { tone: WARM, i: 0.4, w: 0.1, g });
  for (let z = -6; z > -266; z -= 5) {
    const p1 = -z / 266;
    for (const x of [-3.2, 3.2]) W.dot([x, RY + 0.08, z], 0.3, { tone: WARM, i: 1, g, shape: 1, mode: 1, p1, p2: 0.28, slot: S.chase });
  }
  for (let x = -2.8; x <= 2.81; x += 0.4) { W.dot([x, RY + 0.06, -6], 0.24, { tone: ACCENT, i: 1.1, g, shape: 1 }); W.dot([x, RY + 0.06, -266], 0.24, { tone: ACCENT, i: 1.1, g, shape: 1 }); }
  for (let i = 0; i <= 14; i++) {                                               // a taxiway curving in (blue edge lights)
    const u = i / 14, a = u * Math.PI / 2;
    for (const r of [10.5, 12.5]) W.dot([-3.6 - 11.5 + Math.cos(a) * r, RY + 0.06, -14 + 11.5 - Math.sin(a) * r], 0.2, { tone: ACCENT, i: 0.9, g, shape: 1 });
  }
  for (let z = -30; z > -300; z -= 9) W.dot([46, RY - 2, z], 0.4, { tone: WARM, i: 0.5, g, shape: 1 });
}

function buildPlane(W: World) {
  const g = G.plane, st: Look = { tone: COOL, i: 1, w: 0.026, g };
  const zs = [-2.1, -1.85, -1.3, -0.4, 0.6, 1.4, 2.0, 2.35], rs = [0.02, 0.15, 0.23, 0.25, 0.25, 0.21, 0.13, 0.05], ys = [0, 0, 0, 0, 0, 0.03, 0.09, 0.16];
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) W.path(zs.map((z, i): V3 => [Math.cos(a) * rs[i], ys[i] + Math.sin(a) * rs[i], z]), st);
  for (let i = 2; i <= 6; i++) W.path(W.circlePts([0, ys[i], 0], rs[i], 'xy', 16).map(([x, y]): V3 => [x, y, zs[i]]), { ...st, tone: ACCENT, i: 0.5 });
  for (let z = -1.5; z < 1.35; z += 0.19) for (const d of [-1, 1]) W.dot([d * 0.245, 0.07, z], 0.07, { tone: WARM, i: 0.9, g });
  for (const d of [-1, 1]) {
    const wing: V3[] = [[d * 0.22, -0.08, -0.35], [d * 1.95, 0.03, 0.45], [d * 1.98, 0.03, 0.72], [d * 0.22, -0.08, 0.55]];
    W.path(wing, { ...st, tone: ACCENT }, true); W.quad(wing[0], wing[1], wing[2], wing[3], { i0: 0.13, edge: 0.6, g });
    const tail: V3[] = [[d * 0.12, 0.11, 1.75], [d * 0.78, 0.15, 2.08], [d * 0.8, 0.15, 2.3], [d * 0.12, 0.11, 2.25]];
    W.path(tail, { ...st, tone: ACCENT }, true); W.quad(tail[0], tail[1], tail[2], tail[3], { i0: 0.12, edge: 0.6, g });
    const ex = d * 0.82;
    W.ring([ex, -0.27, -0.12], 0.12, 'xy', { ...st, i: 0.7 }, 14);
    W.path(W.circlePts([ex, -0.27, 0], 0.1, 'xy', 14).map(([x, y]): V3 => [x, y, 0.36]), { ...st, i: 0.5 });
    for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) W.line([ex + Math.cos(a) * 0.12, -0.27 + Math.sin(a) * 0.12, -0.12], [ex + Math.cos(a) * 0.1, -0.27 + Math.sin(a) * 0.1, 0.36], { ...st, i: 0.4 });
    W.dot([ex, -0.27, 0.42], 0.42, { tone: WARM, i: 0.7, g });
    W.dot([d * 1.97, 0.03, 0.6], 0.2, { tone: ACCENT, i: 1.4, g, shape: 1 });
    W.dot([d * 1.99, 0.03, 0.66], 0.24, { tone: WARM, i: 1.2, g, shape: 1, mode: 4, p1: d > 0 ? 0.5 : 0, p2: 0.9 });
  }
  const fin: V3[] = [[0, 0.2, 1.45], [0, 1.02, 2.02], [0, 1.02, 2.36], [0, 0.18, 2.3]];
  W.path(fin, { ...st, tone: ACCENT }, true); W.quad(fin[0], fin[1], fin[2], fin[3], { i0: 0.14, edge: 0.6, g });
  W.dot([0, 0.27, 0.1], 0.2, { tone: ACCENT, i: 1.2, g, shape: 1, mode: 4, p1: 0.25, p2: 1.1 });
  W.dot([0, 0.2, 2.38], 0.16, { tone: WARM, i: 1.2, g, shape: 1 });
  W.dot([0, -0.08, -2.1], 0.5, { tone: WARM, i: 1.3, g, shape: 1 });
}

// ---------- camera nodes (LTR; x × side) ----------
type Node = { p: V3; t: V3 };
const HERO0: Node = { p: [0, 3.3, 27], t: [0, 2.1, 0] };
const HERO1: Node = { p: [0.6, 1.7, 2.2], t: [7.5, 1.15, -1.6] };
const counterNode = (c: number): Node => {
  const k = Math.min(Math.floor(c), 2), f = clamp(c - k);
  const x = mix(COUNTERS[k], COUNTERS[k + 1], f);
  return { p: [x - 1.5, 1.75, 2.9], t: [x + 0.3, 1.05, CZ - 0.2] };
};
const gateNode = (c: number): Node => {
  const k = Math.min(Math.floor(c), 3), f = clamp(c - k);
  const x = mix(GATES[k], GATES[k + 1], f);
  return { p: [x, 1.75, 3.5], t: [x, 1.75, -4] };
};
const INFO_N: Node = { p: [63.6, 2.1, 5.0], t: [INFO[0], 1.45, INFO[2]] };

// ---------- the act ----------
export async function createTerminalAct(host: HTMLElement, mode: 'journey' | 'finale'): Promise<Act> {
  const side = terminal.side;
  const light = document.documentElement;
  const C = {
    night: token('--color-bg', host),
    horizon: token('--color-bg', host, ['--color-accent', 80]),
    accent: token('--color-accent', light),
    warm: token('--color-ink', host, ['--color-area-travel', 84]),
    dawn: token('--color-area-travel', light),
    cool: token('--color-ink', host),
  };
  const keep: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(x: T) => { keep.push(x); return x; };

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.05, 600);
  const time = { value: 0 };
  const groups = new Float32Array(24).fill(1);
  const slots = new Float32Array(16);
  const res = new Vector2(2, 2);
  const shared: Record<string, IUniform> = {
    uGroup: { value: groups }, uSlot: { value: slots }, uTones: { value: [C.accent, C.warm, C.dawn, C.cool] },
    uArch: { value: GATES.map((x) => new Vector4(x * side, ZB, ARCH.hw, ARCH.spring)) },
    uTime: time, uRes: { value: res },
    uFogNear: { value: mode === 'journey' ? 20 : 40 }, uFogFar: { value: mode === 'journey' ? 112 : 290 },
  };
  const additive = { transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending, premultipliedAlpha: true };
  const lineMat = own(new ShaderMaterial({ vertexShader: lineVertex, fragmentShader: lineFragment, ...additive, side: DoubleSide,
    uniforms: { ...shared, uMinPx: { value: 1.5 }, uMaxPx: { value: 4 }, uHalo: { value: 5 }, uNear: { value: 0.06 } } }));
  const panelMat = own(new ShaderMaterial({ vertexShader: panelVertex, fragmentShader: panelFragment, ...additive, side: DoubleSide, uniforms: shared }));
  const spriteMinPx = { value: 2.5 };
  const spriteMat = (extra: Record<string, IUniform> = {}) => own(new ShaderMaterial({ vertexShader: spriteVertex, fragmentShader: spriteFragment, ...additive,
    uniforms: { ...shared, uMinPx: spriteMinPx, uBoxMin: { value: new Vector3() }, uBoxSize: { value: new Vector3(1, 1, 1) }, ...extra } }));
  const quadGeo = own(new PlaneGeometry(1, 1));
  const add = (geo: BufferGeometry, mat: ShaderMaterial, order: number, parent: Scene | Group = scene) => {
    const m = new Mesh(own(geo), mat); m.frustumCulled = false; m.renderOrder = order; parent.add(m); return m;
  };

  // the sky: one full-screen ray pass
  const fullQuad = own(new PlaneGeometry(2, 2));
  const skyMat = own(new ShaderMaterial({
    vertexShader: skyVertex, fragmentShader: skyFragment, depthTest: false, depthWrite: false,
    uniforms: {
      uInvVP: { value: new Matrix4() }, uCam: { value: new Vector3() }, uTime: time,
      uTop: { value: C.night.clone().multiplyScalar(0.72) }, uHorizon: { value: C.horizon }, uDeep: { value: C.night.clone().multiplyScalar(0.5) },
      uAccent: { value: C.accent }, uWarm: { value: C.warm }, uMoon: { value: new Vector3(0.55 * side, 0.3, -0.78).normalize() },
      uCloudY: { value: -10 }, uGlow: { value: new Vector3(mode === 'journey' ? 30 * side : 0, mode === 'journey' ? 0 : -60, 1) },
      uHigh: { value: mode === 'finale' ? 1 : 0 },
    },
  }));
  const sky = new Mesh(fullQuad, skyMat); sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky);

  // the world
  const W = new World(side);
  if (mode === 'journey') {
    buildHall(W); buildApproach(W);
    consultation(W); readiness(W); guidance(W); appointment(W);
    gates(W); worlds(W); infoDesk(W);
  } else buildFinale(W);
  add(W.lineGeometry(), lineMat, 0);
  add(W.panelGeometry(), panelMat, 1);
  add(W.spriteGeometry(quadGeo), spriteMat(), 2);

  // the plane (finale): its own small meshes under one transform — built facing the runway, never mirrored
  const plane = new Group();
  if (mode === 'finale') {
    const P = new World(1);
    buildPlane(P);
    add(P.lineGeometry(), lineMat, 4, plane);
    add(P.panelGeometry(), panelMat, 4, plane);
    add(P.spriteGeometry(quadGeo), spriteMat(), 5, plane);
    scene.add(plane);
  }

  // light dust, wrapped in a box around the camera (world-fixed: it drifts past as the camera moves)
  const dustW = new World(1);
  let seed = 29;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 360; i++) dustW.dot([rnd(), rnd(), rnd()], 0.022 + rnd() * 0.03, { tone: [ACCENT, WARM, COOL][i % 3], i: 0.7, g: G.dust, mode: 3, p1: rnd(), p2: rnd() });
  const dustBox = new Vector3(16, 7, 16);
  const dustMat = spriteMat({ uBoxSize: { value: dustBox } });
  add(dustW.spriteGeometry(quadGeo), dustMat, 3);

  // finish: grain + vignette on top
  const finishMat = own(new ShaderMaterial({
    vertexShader: finishVertex, fragmentShader: finishFragment, transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false,
    uniforms: { uTime: time, uAspect: { value: 1 }, uVig: { value: 0.6 }, uGrain: { value: 0.06 } },
  }));
  const finish = new Mesh(fullQuad, finishMat); finish.frustumCulled = false; finish.renderOrder = 10; scene.add(finish);

  // ---------- state ----------
  let width = 2, height = 2, aspect = 1, first = true;
  const camPos = new Vector3(), camAim = new Vector3(), goalP = new Vector3(), goalT = new Vector3(), a3 = new Vector3();
  const cam = { shift: 0, rise: 0, fov: 38 };
  const goal = { shift: 0, rise: 0, fov: 38 };
  const pointer = { x: 0, y: 0 };
  const vp = new Matrix4();
  const toV = (p: V3) => a3.set(p[0] * side, p[1], p[2]);
  const take = (A: Node, B: Node, f: number, ft = f) => {
    goalP.copy(toV(A.p)).lerp(toV(B.p), f);
    goalT.copy(toV(A.t)).lerp(toV(B.t), ft);
  };

  const journey = () => {
    let s = terminal.shot, lit = terminal.light, c = terminal.counter, ca = terminal.counterAct, gt = terminal.gate, ga = terminal.gateAct;
    const P = terminal.poster;
    if (P === 'hero') { s = 0; lit = 0; }
    else if (P && P[0] === 's') { s = 1.5; lit = 1; c = Number(P[1]) - 1; ca = 1; }
    else if (P && P[0] === 'g') { s = 2.5; lit = 1; c = 3; ca = 1; gt = Number(P[1]) - 1; ga = 1; }
    else if (P === 'info') { s = 3.6; lit = 1; c = 3; ca = 1; gt = 4; ga = 1; }

    // the walk
    if (s < 1) { const f = ramp(s, 0.1, 1); take(HERO0, HERO1, f, ramp(f, 0.5, 1)); }
    else if (s < 2) take(HERO1, counterNode(c), ramp(s, 1, 1.12));
    else if (s < 3) take(counterNode(3), gateNode(gt), ramp(s, 2, 2.14));
    else take(gateNode(4), INFO_N, ramp(s, 3, 3.28));
    if (P === 'hero') goalP.set(0, 3.0, 23);

    // what wakes: the hall with the hero, each counter / gate / world as the camera reaches it
    const cx = camPos.x * side;
    groups[G.hall] = 0.5 + 0.5 * ramp(lit, 0.1, 0.7);
    groups[G.approach] = 1 - 0.6 * ramp(s, 1, 1.5);
    COUNTERS.forEach((x, k) => { groups[G.counter + k] = 0.22 + 0.78 * bump(cx - (x - 1.5), 4.6); });
    GATES.forEach((x, k) => {
      const near = bump(cx - x, 4.2);
      groups[G.gate + k] = 0.3 + 0.7 * near;
      groups[G.world + k] = 0.15 + 0.85 * near;
    });
    groups[G.info] = 0.25 + 0.75 * bump(cx - INFO_N.p[0], 6);

    slots[S.doors] = lit;
    const ac = Math.round(clamp(c, 0, 3)), ag = Math.round(clamp(gt, 0, 4));
    for (let k = 0; k < 4; k++) slots[S.counter + k] = s < 1 ? 0 : s >= 2 ? 1 : k < ac ? 1 : k === ac ? ca : 0;
    for (let k = 0; k < 5; k++) slots[S.gate + k] = s < 2 ? 0 : s >= 3 ? 1 : k < ag ? 1 : k === ag ? ga : 0;
    slots[S.info] = ramp(s, 3, 3.35);
  };

  const finale = () => {
    const tk = terminal.poster === 'finale' ? 0.3 : clamp(terminal.takeoff);
    slots[S.takeoff] = tk;
    slots[S.chase] = 0.2 + 0.8 * ramp(tk, 0.6, 0.85);
    const roll = ramp(tk, 0.08, 0.62), lift = ramp(tk, 0.56, 1);
    plane.position.set(0, RY + 0.55 + Math.pow(lift, 1.5) * 46, -7 - Math.pow(roll, 2.2) * 95 - lift * 160);
    plane.rotation.set(ramp(tk, 0.48, 0.64) * 0.2 - lift * 0.05, 0, 0);
    groups[G.plane] = 1 - ramp(tk, 0.86, 1);
    groups[G.runway] = 1;
    goalP.set(0, 1.75, 7.6);
    goalT.set(0, -0.2 + ramp(tk, 0.55, 1) * 4.2, -60);
  };

  return {
    host, scene, camera,
    ready: () => true,
    update(t, deltaMs) {
      const dt = Math.min(deltaMs, 50) / 1000;
      const still = !!terminal.poster;
      time.value = still ? 14.2 : t;
      const pk = 1 - Math.exp(-dt / 0.35);
      pointer.x += ((still ? 0 : terminal.pointer.x) - pointer.x) * pk; pointer.y += ((still ? 0 : terminal.pointer.y) - pointer.y) * pk;
      slots[S.on] = 1;

      if (mode === 'journey') journey(); else finale();

      // framing: the subject on the free side of wide screens, in the upper part of tall ones (wider lens, a step back)
      const tall = terminal.compact || aspect < 0.8;
      goal.shift = still || tall ? 0 : 0.17;
      goal.rise = tall ? (still ? 0.1 : 0.15) : 0;
      goal.fov = tall ? 54 : still ? 46 : 38;
      if (tall) goalP.sub(goalT).multiplyScalar(mode === 'journey' ? 1.45 : 1.1).add(goalT);

      // the crane: eased toward the goal, a breath of the pointer in it
      const k = first || still ? 1 : 1 - Math.exp(-dt / 0.45);
      first = false;
      camPos.lerp(goalP, k); camAim.lerp(goalT, k);
      cam.shift += (goal.shift - cam.shift) * k; cam.rise += (goal.rise - cam.rise) * k; cam.fov += (goal.fov - cam.fov) * k;
      camera.position.set(camPos.x + pointer.x * 0.12, camPos.y + pointer.y * 0.07, camPos.z);
      camera.lookAt(camAim);
      camera.fov = cam.fov;
      camera.aspect = aspect;
      camera.setViewOffset(width, height, -cam.shift * side * width, cam.rise * height, width, height);
      camera.updateMatrixWorld();

      vp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).invert();
      skyMat.uniforms.uInvVP.value.copy(vp);
      skyMat.uniforms.uCam.value.copy(camera.position);
      (dustMat.uniforms.uBoxMin.value as Vector3).copy(camera.position).addScaledVector(dustBox, -0.5);
    },
    resize(w, h) {
      width = Math.max(w, 2); height = Math.max(h, 2); aspect = width / height;
      res.set(width, height);
      const dpr = width / Math.max(host.clientWidth, 1);
      lineMat.uniforms.uMinPx.value = 1.4 * dpr;
      lineMat.uniforms.uMaxPx.value = 3.4 * dpr;
      lineMat.uniforms.uHalo.value = 4 * dpr;
      spriteMinPx.value = 2.2 * dpr;
      finishMat.uniforms.uAspect.value = aspect;
    },
    dispose() {
      keep.forEach((d) => d.dispose());
    },
  };
}

/**
 * Act "atlas" — the Visa Service Details template, «خريطة الرحلة» / "The Route Map"
 * (docs/visa-detail-creative-treatment.md). The night Earth of Home §1.5 and the explore globe, made the stage of ONE
 * page: its destination countries glow in the accent, light routes rise from Egypt (the client's home market) to each of
 * them, and light travels along them. Pages without destinations (most services) get the same world in a calmer
 * «network» mode: soft routes to every destination of brief §1.6b, travelling lights, no country singled out.
 *
 *   journey  host `.atlas__stage` behind hero → types → destinations → benefits → «لمن تناسب؟» (bridge.atlas.shots +
 *            shot → a camera pose per section · push · stop: the destinations block flies country to country)
 *   finale   host `.acta__stage` in the call: the limb of the Earth as a horizon; a plane of light climbs from Egypt
 *            over it toward the page's first destination (takeoff)
 *
 * Each group of categories has its own mood through the scene's parameters only (sun side and strength, city lights,
 * atmosphere, route height and speed) — never a colour outside the tokens.
 * BUDGET: 10 draw calls (journey) · 13 (finale): stars · halo · earth · borders · country fills · country outlines ·
 * routes glow · routes core · ONE instanced sprite mesh (marks, Egypt, travelling lights) · finish (+ take-off route core,
 * glow, plane). One 2048² texture (the shared earth map) + one land mask canvas, both shared by the two hosts with every
 * geometry (built once per page, in steps so no frame runs long). No models, HDRI, render targets or bloom.
 * No depth buffer on the shared renderer: draw order = renderOrder; everything over the sphere fades out by itself
 * behind the horizon. The map never mirrors in RTL: only the framing does (the globe sits on the free side).
 */
import { gsap } from 'gsap';
import {
  AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, DoubleSide,
  InstancedBufferAttribute, InstancedBufferGeometry, LinearFilter, LinearMipmapLinearFilter, LineSegments, Matrix4, Mesh, MeshBasicMaterial,
  NormalBlending, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, Group, Quaternion, Scene, ShaderMaterial,
  ShapeUtils, SphereGeometry, TextureLoader, TubeGeometry, Vector2, Vector3, type Texture,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Act } from '../stage';
import { atlas, type AtlasConfig, type AtlasMood, type AtlasShot } from '../bridge';
import type { Borders, Country, Ring } from '../../../lib/borders';
import { arcFragment as trailFragment, arcVertex as trailVertex } from '../shaders/globe.glsl';
import { surfaceFragment, surfaceVertex } from '../shaders/explore.glsl';
import {
  countryFill, countryLine, countryVertex, earthFragment, earthVertex, finishFragment, finishVertex, haloFragment,
  routeFragment, routeVertex, spriteFragment, spriteVertex,
} from '../shaders/atlas.glsl';
import { onSphere, rad, slerp } from './globe';
import { token } from './util';

/**
 * The moods (scene parameters only). sun: where the last light of dusk comes from, x = away from the text (× side).
 *  visit      a calm dusk on the limb, low gentle routes
 *  study      dawn light from above, a brighter atmosphere, higher and quicker routes
 *  work       the night shift: bright cities, busy routes, little dusk
 *  residence  a long settled dusk, a deep atmosphere, high slow routes
 *  network    (services) an even night, soft routes everywhere
 */
const MOODS: Record<AtlasMood, { sun: [number, number, number]; dusk: number; lights: number; halo: number; lift: number; speed: number; pulse: number; spin: number; stars: number }> = {
  visit: { sun: [0.78, 0.3, 0.55], dusk: 1.0, lights: 0.9, halo: 1.0, lift: 1.0, speed: 0.1, pulse: 0.85, spin: 0.05, stars: 0.5 },
  study: { sun: [0.25, 0.85, 0.5], dusk: 0.85, lights: 0.8, halo: 1.3, lift: 1.25, speed: 0.15, pulse: 1.0, spin: 0.07, stars: 0.62 },
  work: { sun: [0.9, -0.15, 0.42], dusk: 0.55, lights: 1.3, halo: 0.92, lift: 0.85, speed: 0.19, pulse: 1.15, spin: 0.06, stars: 0.42 },
  residence: { sun: [0.62, 0.45, 0.62], dusk: 1.25, lights: 0.85, halo: 1.4, lift: 1.4, speed: 0.07, pulse: 0.75, spin: 0.035, stars: 0.6 },
  network: { sun: [0.7, 0.5, 0.55], dusk: 0.7, lights: 1.0, halo: 1.0, lift: 1.0, speed: 0.12, pulse: 0.75, spin: 0.045, stars: 0.5 },
};

const FOV = 28;
const CAIRO: [number, number] = [30.04, 31.24];         // lat, lon — every route starts here
const STEP = 2.5;                                        // degrees: longest straight piece drawn on the sphere
const STAGGER = 0.085, DRAW = 1.6;                       // the hero: one route after another, each 1.6 s from Egypt
const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const ramp = (v: number, a: number, b: number) => smooth(clamp((v - a) / (b - a)));
/** shortest way round from angle a to angle b */
const turnTo = (a: number, b: number) => a + ((((b - a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
const breathe = () => new Promise<void>((done) => { window.setTimeout(done, 0); });
const lonOf = (p: Vector3) => Math.atan2(-p.z, p.x);
const latOf = (p: Vector3) => Math.asin(clamp(p.y, -1, 1));

/** a route on the unit sphere: slerp from a to b, lifted by `lift` in the middle (the sprite shader uses the same) */
const arcPoint = (a: Vector3, b: Vector3, lift: number, t: number) => {
  const w = a.angleTo(b);
  const p = Math.sin(w) < 1e-3 ? a.clone().lerp(b, t).normalize() : slerp(a, b, t);
  return p.multiplyScalar(1 + lift * Math.sin(Math.PI * t));
};
const liftOf = (a: Vector3, b: Vector3, k: number) => (0.05 + 0.24 * (a.angleTo(b) / Math.PI)) * k;

// ---------- shared by the two hosts: the map, the land mask and every geometry (built once per page) ----------
interface World {
  map: Texture | null;
  land: CanvasTexture;
  borders: BufferGeometry;
  fills: BufferGeometry | null;
  outlines: BufferGeometry;
  routes: [BufferGeometry, BufferGeometry];
  sprites: InstancedBufferGeometry;
  home: Vector3;
  points: Vector3[];
  fits: number[];
  centroid: Vector3;
  loaded: Promise<void>;
  users: number;
  dispose(): void;
}
let pending: { key: string; world: Promise<World> } | null = null;

const put = (out: number[], lon: number, lat: number, r: number) => {
  const c = Math.cos(rad(lat));
  out.push(r * c * Math.cos(rad(lon)), r * Math.sin(rad(lat)), -r * c * Math.sin(rad(lon)));
};
/** border rings → line segments that follow the sphere (a long parallel must not cut through it) */
const segmentsOf = (rings: Ring[], r: number, out: number[] = []) => {
  for (const ring of rings) for (let i = 0; i + 3 < ring.length; i += 2) {
    const x0 = ring[i], y0 = ring[i + 1], x1 = ring[i + 2], y1 = ring[i + 3];
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / STEP));
    for (let k = 0; k < n; k++) {
      put(out, x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, r);
      put(out, x0 + ((x1 - x0) * (k + 1)) / n, y0 + ((y1 - y0) * (k + 1)) / n, r);
    }
  }
  return out;
};
/** a flat triangle between far-apart points would cut through the sphere: halve its longest side until it is small */
const split = (out: number[], ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => {
  const ab = Math.max(Math.abs(bx - ax), Math.abs(by - ay)), bc = Math.max(Math.abs(cx - bx), Math.abs(cy - by)), ca = Math.max(Math.abs(ax - cx), Math.abs(ay - cy));
  if (Math.max(ab, bc, ca) <= STEP * 2) { put(out, ax, ay, 1.0006); put(out, bx, by, 1.0006); put(out, cx, cy, 1.0006); return; }
  if (ab >= bc && ab >= ca) { const mx = (ax + bx) / 2, my = (ay + by) / 2; split(out, ax, ay, mx, my, cx, cy); split(out, mx, my, bx, by, cx, cy); }
  else if (bc >= ca) { const mx = (bx + cx) / 2, my = (by + cy) / 2; split(out, ax, ay, bx, by, mx, my); split(out, ax, ay, mx, my, cx, cy); }
  else { const mx = (cx + ax) / 2, my = (cy + ay) / 2; split(out, ax, ay, bx, by, mx, my); split(out, mx, my, bx, by, cx, cy); }
};
const fillOf = (c: Country, out: number[]) => {
  for (const poly of c.polys) {
    const pts = (r: Ring) => {
      const n = r.length / 2 - (r[0] === r[r.length - 2] && r[1] === r[r.length - 1] ? 1 : 0);
      return Array.from({ length: n }, (_, i) => new Vector2(r[i * 2], r[i * 2 + 1]));
    };
    const outer = pts(poly[0]), holes = poly.slice(1).map(pts);
    if (outer.length < 3) continue;
    const all = outer.concat(...holes);
    for (const [a, b, d] of ShapeUtils.triangulateShape(outer, holes)) split(out, all[a].x, all[a].y, all[b].x, all[b].y, all[d].x, all[d].y);
  }
  return out;
};
const indexed = (pos: number[], index: number[]) => {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('aIndex', new BufferAttribute(new Float32Array(index), 1));
  return g;
};

async function buildWorld(borders: Borders, config: AtlasConfig): Promise<World> {
  const mood = MOODS[config.mood];
  const network = config.mood === 'network';
  const keep: { dispose(): void }[] = [];

  // the land mask: the border polygons painted on an equirectangular canvas
  const W = 2048, H = W / 2;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  for (const c of borders.countries) {
    ctx.beginPath();
    for (const poly of c.polys) for (const r of poly) {
      for (let i = 0; i < r.length; i += 2) {
        const x = ((r[i] + 180) / 360) * W, y = ((90 - r[i + 1]) / 180) * H;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.closePath();
    }
    ctx.fill('evenodd');
  }
  const land = new CanvasTexture(canvas);
  // mipmaps: the 2048 px maps are minified onto a disc of a few hundred px — without them every frame thrashes the
  // texture cache (and the coasts shimmer). Cheaper AND better looking, for every visitor.
  land.minFilter = LinearMipmapLinearFilter;
  land.magFilter = LinearFilter;
  land.generateMipmaps = true;
  keep.push(land);
  await breathe();

  const bordersGeo = new BufferGeometry();
  bordersGeo.setAttribute('position', new BufferAttribute(new Float32Array(segmentsOf(borders.lines, 1.0012)), 3));
  keep.push(bordersGeo);
  await breathe();

  // the page's countries: fills (not in the network mode) + outlines, each vertex knows its destination index
  const list = config.dest.map((id) => borders.byId.get(id)).filter((c): c is Country => !!c);
  const fillPos: number[] = [], fillIdx: number[] = [], linePos: number[] = [], lineIdx: number[] = [];
  for (const [i, c] of list.entries()) {
    if (!network) {
      const before = fillPos.length;
      fillOf(c, fillPos);
      for (let k = before; k < fillPos.length; k += 3) fillIdx.push(i);
    }
    const before = linePos.length;
    segmentsOf(c.polys.flat(), 1.002, linePos);
    for (let k = before; k < linePos.length; k += 3) lineIdx.push(i);
    if (i % 4 === 3) await breathe();
  }
  const fills = network ? null : indexed(fillPos, fillIdx);
  const outlines = indexed(linePos, lineIdx);
  if (fills) keep.push(fills);
  keep.push(outlines);

  // the routes from Egypt: tubes merged into one geometry per layer (core + glow); uv.x runs Egypt → country
  const home = onSphere(CAIRO[0], CAIRO[1]);
  const points = list.map((c) => onSphere(c.label[1], c.label[0]));
  const tubes = (radius: number, segments: number) => mergeGeometries(points.map((b, i) => {
    const lift = liftOf(home, b, mood.lift);
    const curve = new CatmullRomCurve3(Array.from({ length: 41 }, (_, k) => arcPoint(home, b, lift, k / 40)));
    const tube = new TubeGeometry(curve, segments, radius, 6);
    tube.deleteAttribute('normal');
    tube.setAttribute('aArc', new BufferAttribute(new Float32Array(tube.attributes.position.count).fill(i), 1));
    return tube;
  }));
  const routes: [BufferGeometry, BufferGeometry] = [tubes(network ? 0.0026 : 0.0036, 72), tubes(network ? 0.009 : 0.012, 48)];
  keep.push(...routes);
  await breathe();

  // sprites: Egypt · one mark per country · two travelling lights per route (they ride the pulses of the routes)
  const quad = new PlaneGeometry(1, 1);
  const sprites = new InstancedBufferGeometry();
  sprites.index = quad.index;
  sprites.setAttribute('position', quad.attributes.position);
  quad.dispose();
  const A: number[] = [], B: number[] = [], P: number[] = [], I: number[] = [];
  const add = (a: Vector3, b: Vector3, kind: number, phase: number, lift: number, i: number) => {
    A.push(a.x, a.y, a.z); B.push(b.x, b.y, b.z); P.push(kind, phase, 0, lift); I.push(i);
  };
  add(home, home, 2, 0, 0, -1);
  points.forEach((p, i) => add(p, p, 0, 0, 0, i));
  points.forEach((p, i) => { const lift = liftOf(home, p, mood.lift); add(home, p, 1, 0, lift, i); add(home, p, 1, 1, lift, i); });
  sprites.setAttribute('aA', new InstancedBufferAttribute(new Float32Array(A), 3));
  sprites.setAttribute('aB', new InstancedBufferAttribute(new Float32Array(B), 3));
  sprites.setAttribute('aP', new InstancedBufferAttribute(new Float32Array(P), 4));
  sprites.setAttribute('aI', new InstancedBufferAttribute(new Float32Array(I), 1));
  sprites.instanceCount = I.length;
  keep.push(sprites);

  // small countries get a closer look when the camera visits them
  const fits = list.map((c) => clamp(20 / Math.max(c.span, 5), 1, 1.9));
  const centroid = points.reduce((s, p) => s.add(p), home.clone().multiplyScalar(1.5)).normalize();

  const world: World = {
    map: null, land, borders: bordersGeo, fills, outlines, routes, sprites, home, points, fits, centroid, users: 0,
    loaded: new Promise<void>((resolve) => {
      new TextureLoader().load('/media/img/earth-night.webp', (t) => {
        t.minFilter = LinearMipmapLinearFilter;
        t.magFilter = LinearFilter;
        t.generateMipmaps = true;
        world.map = t;
        keep.push(t);
        resolve();
      });
    }),
    dispose() { keep.forEach((d) => d.dispose()); },
  };
  return world;
}

/** The act. `mode` picks the host: 'journey' (hero → audience) or 'finale' (the call). */
export async function createAtlasAct(host: HTMLElement, borders: Borders, config: AtlasConfig, mode: 'journey' | 'finale'): Promise<Act> {
  const key = `${config.mood}|${config.dest.join(',')}`;
  if (pending?.key !== key) pending = { key, world: buildWorld(borders, config) };
  const world = await pending.world;
  world.users++;
  const mood = MOODS[config.mood];
  const network = config.mood === 'network';
  const n = world.points.length;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  const navy = token('--color-bg', host);
  const accent = token('--color-accent', host);
  const sky = token('--color-focus', host, ['--color-ink-muted', 55]);
  const ink = token('--color-ink', host);
  const warm = token('--color-ink', host, ['--color-area-travel', 84]);
  scene.background = navy.clone().convertSRGBToLinear();

  const own: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => { own.push(x); return x; };
  const flat = { depthTest: false, depthWrite: false } as const;
  const fade = { value: 0 }, time = { value: 0 }, dim = { value: 0 }, horizon = { value: 0.2 };
  const shown = { value: 0 };               // the fade-in once the map has loaded (uFade = shown × what the scroll allows)
  const center = { value: new Vector3() };
  const sun = new Vector3(mood.sun[0] * atlas.side, mood.sun[1], mood.sun[2]).normalize();
  const sunDir = { value: sun };
  const intro = { value: mode === 'finale' ? 99 : 0 };
  const focus = { value: -10 };
  const lit = { uIntro: intro, uStagger: { value: STAGGER }, uDraw: { value: DRAW }, uFocus: focus, uTime: time, uSpeed: { value: mood.speed } };

  // ---------- stars ----------
  const starCount = 800;
  const starPos = new Float32Array(starCount * 3);
  let seed = 13;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < starCount; i++) {
    const v = new Vector3(rnd() * 2 - 1, rnd() * 2 - 1, -rnd()).normalize().multiplyScalar(40);
    starPos.set([v.x, v.y, v.z], i * 3);
  }
  const starGeo = keep(new BufferGeometry());
  starGeo.setAttribute('position', new BufferAttribute(starPos, 3));
  const starMat = keep(new PointsMaterial({ color: ink.clone().convertSRGBToLinear(), size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, ...flat }));
  const stars = new Points(starGeo, starMat);
  stars.renderOrder = 0;
  stars.frustumCulled = false;
  scene.add(stars);

  // ---------- the Earth ----------
  const globe = new Group();                 // zoom
  scene.add(globe);
  const turn = new Group();                  // everything that turns with the Earth
  globe.add(turn);
  const sphere = keep(new SphereGeometry(1, 96, 48));
  const earthMat = keep(new ShaderMaterial({
    vertexShader: earthVertex, fragmentShader: earthFragment, ...flat,
    uniforms: {
      uMap: { value: world.map }, uLand: { value: world.land }, uNavy: { value: navy }, uSky: { value: sky }, uWarm: { value: warm },
      uSunDir: sunDir, uFade: fade, uLights: { value: mood.lights }, uDusk: { value: mood.dusk }, uDim: dim,
    },
  }));
  const earth = new Mesh(sphere, earthMat);
  earth.renderOrder = 2;
  turn.add(earth);
  let ready = false;
  void world.loaded.then(() => {
    earthMat.uniforms.uMap.value = world.map;
    ready = true;
    gsap.to(shown, { value: 1, duration: atlas.poster ? 0.01 : 1.4, ease: 'power2.out' });
  });

  const haloMat = keep(new ShaderMaterial({
    vertexShader: earthVertex, fragmentShader: haloFragment, side: BackSide, transparent: true, blending: AdditiveBlending, ...flat,
    uniforms: { uSky: { value: sky }, uWarm: { value: warm }, uSunDir: sunDir, uFade: fade, uGain: { value: mood.halo }, uDim: dim },
  }));
  const halo = new Mesh(sphere, haloMat);
  halo.scale.setScalar(1.13);
  halo.renderOrder = 1;
  globe.add(halo);

  // borders of every country: a faint web of light
  const borderMat = keep(new ShaderMaterial({
    vertexShader: surfaceVertex, fragmentShader: surfaceFragment, transparent: true, blending: AdditiveBlending, side: DoubleSide, ...flat,
    uniforms: { uColor: { value: sky.clone().lerp(ink, 0.35) }, uAlpha: { value: network ? 0.3 : 0.24 }, uCenter: center, uHorizon: horizon, uFade: fade },
  }));
  const borderLines = new LineSegments(world.borders, borderMat);
  borderLines.renderOrder = 3;
  borderLines.frustumCulled = false;
  turn.add(borderLines);

  // the page's countries
  const countryUniforms = (base: number, boost: number) => ({
    ...lit, uColor: { value: accent }, uBase: { value: base }, uBoost: { value: boost }, uHorizon: horizon, uFade: fade, uCenter: center,
  });
  const fillMat = keep(new ShaderMaterial({
    vertexShader: countryVertex, fragmentShader: countryFill, transparent: true, blending: NormalBlending, side: DoubleSide, ...flat,
    uniforms: countryUniforms(0.4, 0.4),
  }));
  if (world.fills) {
    const fill = new Mesh(world.fills, fillMat);
    fill.renderOrder = 4;
    fill.frustumCulled = false;
    turn.add(fill);
  }
  const outlineMat = keep(new ShaderMaterial({
    vertexShader: countryVertex, fragmentShader: countryLine, transparent: true, blending: AdditiveBlending, side: DoubleSide, ...flat,
    uniforms: countryUniforms(network ? 0.16 : 0.62, 0.5),
  }));
  const outline = new LineSegments(world.outlines, outlineMat);
  outline.renderOrder = 5;
  outline.frustumCulled = false;
  turn.add(outline);

  // the routes
  const routeMat = (alpha: number) => keep(new ShaderMaterial({
    vertexShader: routeVertex, fragmentShader: routeFragment, transparent: true, blending: AdditiveBlending, ...flat,
    uniforms: { ...lit, uColor: { value: accent }, uCenter: center, uAlpha: { value: alpha }, uPulse: { value: mood.pulse }, uFade: fade, uDim: dim },
  }));
  const routeGlowMat = routeMat(network ? 0.1 : 0.14), routeCoreMat = routeMat(network ? 0.55 : 0.85);
  const glow = new Mesh(world.routes[1], routeGlowMat), core = new Mesh(world.routes[0], routeCoreMat);
  glow.renderOrder = core.renderOrder = 6;
  glow.frustumCulled = core.frustumCulled = false;
  turn.add(glow, core);

  // marks, Egypt and the travelling lights
  const home = { value: 0 };
  const scale = { value: 1 };
  const spriteMat = keep(new ShaderMaterial({
    vertexShader: spriteVertex, fragmentShader: spriteFragment, transparent: true, blending: AdditiveBlending, ...flat,
    uniforms: { ...lit, uScale: scale, uSize: { value: 0.05 }, uHorizon: horizon, uCenter: center, uHome: home, uColor: { value: accent }, uInk: { value: ink }, uFade: fade },
  }));
  const sprites = new Mesh(world.sprites, spriteMat);
  sprites.renderOrder = 8;
  sprites.frustumCulled = false;
  turn.add(sprites);

  // the finale: the take-off route (a higher arc) and the plane of light that climbs along it
  const plane = new Mesh(keep(new BufferGeometry()), keep(new MeshBasicMaterial({ color: warm.clone().convertSRGBToLinear(), transparent: true, opacity: 0, side: DoubleSide, ...flat })));
  let trail: CatmullRomCurve3 | null = null;
  const trailMats: ShaderMaterial[] = [];
  if (mode === 'finale') {
    const target = world.points[0] ?? onSphere(48.8, 2.3);
    const lift = 0.16 + 0.3 * (world.home.angleTo(target) / Math.PI);
    trail = new CatmullRomCurve3(Array.from({ length: 49 }, (_, k) => arcPoint(world.home, target, lift, k / 48)));
    for (const [radius, alpha, segs] of [[0.016, 0.16, 64], [0.0046, 1, 96]] as const) {
      const mat = keep(new ShaderMaterial({
        vertexShader: trailVertex, fragmentShader: trailFragment, transparent: true, blending: AdditiveBlending, ...flat,
        uniforms: { uColor: { value: accent }, uCenter: center, uHead: { value: 0 }, uAge: { value: 0 }, uAlpha: { value: alpha }, uPulse: { value: 0 }, uTime: time, uFade: fade },
      }));
      const m = new Mesh(keep(new TubeGeometry(trail, segs, radius, 6)), mat);
      m.renderOrder = 7;
      m.frustumCulled = false;
      turn.add(m);
      trailMats.push(mat);
    }
    plane.geometry.setAttribute('position', new BufferAttribute(new Float32Array([
      1, 0, 0, -0.7, 0.62, 0, -0.36, 0, 0,
      1, 0, 0, -0.36, 0, 0, -0.7, -0.62, 0,
    ]), 3));
    plane.renderOrder = 9;
    plane.matrixAutoUpdate = false;
    plane.frustumCulled = false;
    turn.add(plane);
  }

  // finish: grain + vignette on top
  const finishMat = keep(new ShaderMaterial({
    vertexShader: finishVertex, fragmentShader: finishFragment, transparent: true, premultipliedAlpha: true, ...flat,
    uniforms: { uTime: time, uAspect: { value: 1 }, uVig: { value: 0.55 }, uGrain: { value: 0.05 } },
  }));
  const finish = new Mesh(keep(new PlaneGeometry(2, 2)), finishMat);
  finish.frustumCulled = false;
  finish.renderOrder = 10;
  scene.add(finish);

  // ---------- the camera: one pose per journey section, eased (a crane, never a cut) ----------
  const lon0 = lonOf(world.centroid), lat0 = clamp(latOf(world.centroid), rad(-25), rad(42));
  const pose = { lon: lon0, lat: lat0, zoom: 1, shift: 0, rise: 0, dim: 0 };
  const goal = { ...pose };
  const pointer = { x: 0, y: 0 };
  const visit = { w: 0, at: 0 };             // how much the destinations block lights its country · which one
  let width = 2, height = 2, aspect = 1, first = true, introAt = -1;
  const P = new Vector3(), tangent = new Vector3(), up = new Vector3(), sideV = new Vector3();
  const basis = new Matrix4(), size = new Matrix4(), rot = new Matrix4();
  const q = new Quaternion();
  const X = new Vector3(), Y = new Vector3(), F = new Vector3(), U = new Vector3(), Nn = new Vector3();

  let exit = 0;
  const journey = (t: number) => {
    const shots = atlas.shots;
    const s = atlas.poster ? 0 : clamp(atlas.shot, 0, Math.max(shots.length - 0.001, 0));
    const i = Math.min(Math.floor(s), shots.length - 1);
    const name: AtlasShot = shots[i] ?? 'hero';
    const tall = atlas.compact || aspect < 0.8;
    const drift = Math.sin(t * mood.spin) * 0.3;
    let w = 0;
    exit = 0;
    goal.lat = lat0; goal.lon = lon0 + drift; goal.zoom = 1; goal.dim = 0;
    goal.shift = tall ? 0 : 0.2; goal.rise = tall ? 0.17 : 0;
    if (name === 'hero') {
      goal.zoom = 1 + 0.12 * atlas.push;
      goal.lon += 0.25 * atlas.push;
    } else if (name === 'types') {                                   // the planet rises behind the cards
      goal.lon = lon0 + 0.55 + drift; goal.lat = lat0 - 0.4;
      goal.zoom = tall ? 3.3 : 2.1; goal.shift = 0; goal.rise = tall ? -0.55 : -0.62; goal.dim = 0.32;
    } else if (name === 'destinations' && n) {                       // country to country, in the list's order
      const stop = clamp(atlas.stop < 0 ? 0 : atlas.stop, 0, n - 1);
      const a = Math.floor(stop), b = Math.min(a + 1, n - 1), f = stop - a;
      const pa = world.points[a], pb = world.points[b];
      const hop = pa.angleTo(pb);
      P.copy(a === b ? pa : arcPoint(pa, pb, 0, f));
      goal.lon = lonOf(P); goal.lat = clamp(latOf(P), rad(-62), rad(62));
      const leg = config.legs.includes(b) && b !== a ? 0.2 : 0;     // a new leg (citizenship → residency): a wider step back
      goal.zoom = mix(world.fits[a], world.fits[b], f) * (1 - Math.min(0.55, 0.12 + hop * 0.42 + leg) * Math.sin(Math.PI * f));
      if (tall) goal.zoom = Math.min(goal.zoom, 1.5);
      goal.shift = tall ? 0 : 0.21; goal.rise = tall ? 0.2 : 0;
      w = 1; visit.at = stop;
    } else if (name === 'benefits') {                                // the whole map, quiet behind the grid
      goal.zoom = tall ? 1.05 : 0.9; goal.shift = 0; goal.rise = tall ? 0.12 : 0; goal.dim = 0.5;
    } else if (name === 'audience') {
      goal.lon = lon0 - 0.4 + drift; goal.zoom = 1.08; goal.dim = 0.12;
      exit = ramp(s - i, 0.45, 0.9);                                 // the host starts to leave: the map goes before it
    }
    if (atlas.poster) { goal.shift = 0; goal.rise = tall ? 0.12 : 0; goal.zoom = 1; goal.lon = lon0; goal.lat = lat0; }
    return w;
  };

  const finale = (hh: number) => {
    const tk = atlas.poster === 'finale' ? 0.42 : clamp(atlas.takeoff);
    const climb = ramp(tk, 0.12, 0.86);
    const tall = atlas.compact || aspect < 0.8;
    // the frame (a basis X, Y, F for the turn): F faces the camera, Egypt sits above it on the near cap, the target is
    // beyond the horizon
    const T = world.points[0] ?? onSphere(48.8, 2.3);
    const E = world.home;
    Nn.crossVectors(E, T).normalize();
    U.crossVectors(Nn, E).normalize();                              // at Egypt, the way to the target
    // "up" on screen at Egypt is W: the route's way turned by `lean` around Egypt, so the route leaves the horizon on a
    // curve, away from the text, while Egypt itself stays straight above the middle of the globe
    const lean = (tall ? 0.35 : 0.55) * atlas.side;
    Nn.crossVectors(E, U);
    U.multiplyScalar(Math.cos(lean)).addScaledVector(Nn, Math.sin(lean)).normalize();
    const alpha = rad(24 + 16 * climb);                             // the camera rises with the plane: Egypt sinks a little
    F.copy(E).multiplyScalar(Math.cos(alpha)).addScaledVector(U, -Math.sin(alpha));
    Y.copy(E).multiplyScalar(Math.sin(alpha)).addScaledVector(U, Math.cos(alpha));
    X.crossVectors(Y, F);
    rot.makeBasis(X, Y, F).transpose();
    q.setFromRotationMatrix(rot);
    turn.quaternion.copy(q);
    goal.zoom = (tall ? 2.5 : 2.2) * (1 - 0.06 * climb);
    goal.shift = tall ? 0 : 0.16;
    // the limb (the horizon) at `hz` of the screen height: the globe's centre sits one projected radius below it
    const D = hh / Math.tan(rad(FOV / 2));
    const R = Math.tan(Math.asin(Math.min(pose.zoom / D, 0.98))) / Math.tan(rad(FOV / 2)) / 2;
    const hz = (tall ? 0.6 : 0.56) + 0.06 * climb;
    goal.rise = -(hz + R - 0.5);
    goal.dim = 0;
    home.value = 1 - ramp(tk, 0.2, 0.5) * 0.6;
    trailMats.forEach((m) => { m.uniforms.uHead.value = climb; m.uniforms.uAge.value = ramp(tk, 0.86, 1) * 0.6; });
    if (trail) {
      const h = clamp(climb, 0.001, 1);
      trail.getPointAt(h, P);
      trail.getTangentAt(h, tangent);
      up.copy(P).normalize();
      sideV.crossVectors(up, tangent).normalize();
      const s = 0.05 / Math.sqrt(pose.zoom);
      size.makeScale(s, s, s);
      basis.makeBasis(tangent, sideV, up).setPosition(P.x * 1.004, P.y * 1.004, P.z * 1.004);
      plane.matrix.multiplyMatrices(basis, size);
      // no depth buffer: the plane fades by itself once it is over the horizon (like the routes)
      const facing = up.applyQuaternion(turn.quaternion).z;
      (plane.material as MeshBasicMaterial).opacity = ramp(tk, 0.06, 0.16) * clamp((facing + 0.05) / 0.25) * fade.value;
    }
  };

  return {
    host,
    scene,
    camera,
    ready: () => ready,
    update(t, deltaMs) {
      const dt = Math.min(deltaMs, 50) / 1000;
      const still = !!atlas.poster;
      const now = still ? 14.2 : t;
      time.value = now;
      if (mode === 'journey') {
        if (ready && introAt < 0) introAt = t;
        intro.value = still ? 99 : introAt < 0 ? 0 : t - introAt;
      }
      const pk = 1 - Math.exp(-dt / 0.6);
      pointer.x += ((still ? 0 : atlas.pointer.x) - pointer.x) * pk;
      pointer.y += ((still ? 0 : atlas.pointer.y) - pointer.y) * pk;

      const tall = atlas.compact || aspect < 0.8;
      const hh = tall ? Math.max(1.24, 1.14 / aspect) : 1.24;
      const w = mode === 'journey' ? journey(now) : (finale(hh), 0);
      const k = first || still ? 1 : 1 - Math.exp(-dt / 0.5);
      first = false;
      pose.lon += (turnTo(pose.lon, goal.lon) - pose.lon) * k;
      pose.lat += (goal.lat - pose.lat) * k;
      pose.zoom += (goal.zoom - pose.zoom) * k;
      pose.shift += (goal.shift - pose.shift) * k;
      pose.rise += (goal.rise - pose.rise) * k;
      pose.dim += (goal.dim - pose.dim) * k;
      visit.w += (w - visit.w) * (still ? 1 : 1 - Math.exp(-dt / 0.3));
      focus.value = visit.w > 0.01 ? visit.at : -10;
      fillMat.uniforms.uBoost.value = 0.4 * visit.w;
      outlineMat.uniforms.uBoost.value = 0.5 * visit.w;

      if (mode === 'journey') turn.rotation.set(pose.lat + pointer.y * 0.035, -Math.PI / 2 - pose.lon - pointer.x * 0.05, 0);
      globe.scale.setScalar(pose.zoom);
      dim.value = pose.dim;
      scale.value = Math.sqrt(pose.zoom);

      // framing: the globe on the free side of wide screens, in the upper part of tall ones (view offset)
      fade.value = shown.value * (1 - exit);
      finishMat.uniforms.uVig.value = 0.55 * (1 - exit);              // leaving: plain night, the same colour as the next section
      finishMat.uniforms.uGrain.value = 0.05 * (1 - exit);
      starMat.opacity = mood.stars * fade.value;
      camera.position.set(0, 0, hh / Math.tan(rad(FOV / 2)));
      camera.aspect = aspect;
      camera.setViewOffset(width, height, -pose.shift * atlas.side * width, pose.rise * height, width, height);
      camera.updateMatrixWorld();
      globe.updateMatrixWorld();
      horizon.value = pose.zoom / camera.position.length();
    },
    resize(w, h) {
      width = Math.max(w, 2); height = Math.max(h, 2); aspect = width / height;
      finishMat.uniforms.uAspect.value = aspect;
    },
    dispose() {
      gsap.killTweensOf(shown);
      own.forEach((d) => d.dispose());
      if (--world.users <= 0) { world.dispose(); if (pending?.key === key) pending = null; }
    },
  };
}

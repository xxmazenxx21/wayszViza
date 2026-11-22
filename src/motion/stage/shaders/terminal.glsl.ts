/**
 * Shaders of the act `terminal` (acts/terminal.ts) — «مطار الضوء» / "Terminal of Light", WaysZ Visa Services.
 * Five programs: the sky (one full-screen ray pass: night gradient, stars, moon halo, the cloud sea under the terminal,
 * high clouds) · glowing lines (screen-space ribbons, core + halo, clipped at the near plane) · frosted panels ·
 * sprites (instanced billboards; every shape is an SDF here — no texture) · the finish (grain + vignette on top).
 * Lines, panels and sprites are LIGHT: they blend additively (order-independent — the shared canvas has no depth).
 * Per vertex they carry a light group (uGroup[], woken by the act), a motion (uSlot[], written by the scenes through
 * the act) and a portal (the gate glimpses are bright only where seen through their own arch, uArch[]).
 * Colours are display-space values read from the tokens (acts/util.ts token()); no hex here.
 */

const NOISE = /* glsl */ `
  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
`;

// light groups, motion slots, palette, fog and the gate portals — shared by lines, panels and sprites
const COMMON = /* glsl */ `
  #define GROUPS 24
  #define SLOTS 16
  uniform float uGroup[GROUPS];
  uniform float uSlot[SLOTS];
  uniform vec3 uTones[4];                 // 0 accent · 1 warm white · 2 dawn · 3 cool white
  uniform vec4 uArch[5];                  // gate openings: x, z, half width, spring height (radius = half width)
  uniform float uTime; uniform float uFogNear; uniform float uFogFar; uniform vec2 uRes;
  const float TAU = 6.2831853;
  float fogAt(float d) { return 1.0 - smoothstep(uFogNear, uFogFar, d); }
  // 1 where the camera sees the point W through gate k's arch, a faint 0.04 elsewhere (frosted glass)
  float portal(float k, vec3 W) {
    if (k < -0.5) return 1.0;
    vec4 a = uArch[int(k + 0.5)];
    float t = (a.y - cameraPosition.z) / (W.z - cameraPosition.z);
    vec3 Q = cameraPosition + (W - cameraPosition) * t;
    float dx = abs(Q.x - a.x);
    float d = Q.y < a.w ? max(dx - a.z, -Q.y) : length(vec2(dx, Q.y - a.w)) - a.z;
    return mix(0.04, 1.0, 1.0 - smoothstep(-0.06, 0.02, d)) * step(0.0, t);
  }
`;

// motion of a point: m = (mode, slot, p1, p2), pv = pivot or travel vector. Writes an alpha (may exceed 1 for a
// pulse) and k: 0 = its own tone · 1 = accent (a sheet that has been checked)
const MOTION = /* glsl */ `
  vec3 motion(vec3 p, vec4 m, vec3 pv, out float a, out float k) {
    a = 1.0; k = 0.0;
    int mode = int(m.x + 0.5);
    float s = uSlot[int(m.y + 0.5)];
    if (mode == 1) {                                   // spin in the xy plane around pv, clockwise as seen (clock hands)
      float g = -s * m.z * TAU;
      vec2 d = p.xy - pv.xy;
      p.xy = pv.xy + vec2(d.x * cos(g) - d.y * sin(g), d.x * sin(g) + d.y * cos(g));
    } else if (mode == 2) {                            // travel by pv over the slot window [p1, p2] (doors)
      p += pv * smoothstep(m.z, m.w, s);
    } else if (mode == 3) {                            // appear over the window
      a = smoothstep(m.z, m.w, s);
    } else if (mode == 4) {                            // flutter: a page turning on its spine (pv), bobbing
      float g = sin(uTime * 1.3 + m.z * 6.0) * 0.55 * (0.3 + 0.7 * s);
      vec2 d = p.xz - pv.xz;
      p.xz = pv.xz + vec2(d.x * cos(g) - d.y * sin(g), d.x * sin(g) + d.y * cos(g));
      p.y += sin(uTime * 0.7 + m.z * 4.0) * 0.12 + s * m.w;
    } else if (mode == 5) {                            // drift: balloons sway and rise with the slot
      p.x += sin(uTime * 0.3 + m.z * 5.0) * 0.12;
      p.y += sin(uTime * 0.45 + m.z * 3.0) * 0.1 + s * m.w;
    } else if (mode == 6 || mode == 8) {               // a sheet through the arch: travel pv, turns accent past p2 (8 = its check mark)
      float q = clamp((s - m.z) / 0.5, 0.0, 1.0);
      q = q * q * (3.0 - 2.0 * q);
      p += pv * q;
      k = smoothstep(m.w - 0.03, m.w + 0.05, q);
      if (mode == 8) a = smoothstep(m.w + 0.04, m.w + 0.16, q);
    } else if (mode == 7) {                            // a ribbon that draws itself, then a pulse runs along it (p1 = position)
      float drawn = smoothstep(m.z - 0.03, m.z + 0.01, s * 1.08);
      float u = fract(uTime * 0.22) * 1.3 - 0.15;
      a = drawn * (0.65 + 1.1 * exp(-(u - m.z) * (u - m.z) * 260.0));
    } else if (mode == 9) {                            // wake: dim until the window, then full
      a = 0.22 + 0.78 * smoothstep(m.z, m.w, s);
    } else if (mode == 10) {                           // breathe: a soft glow that grows with the slot
      a = (0.35 + 0.65 * s) * (0.82 + 0.18 * sin(uTime * 1.6 + m.z));
    }
    return p;
  }
`;

// ---------- the sky: gradient, stars, moon halo, the cloud sea below, high clouds above ----------
export const skyVertex = /* glsl */ `
  varying vec2 vNdc;
  void main() { vNdc = position.xy; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
export const skyFragment = /* glsl */ `
  ${NOISE}
  uniform mat4 uInvVP; uniform vec3 uCam; uniform float uTime;
  uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uDeep; uniform vec3 uAccent; uniform vec3 uWarm;
  uniform vec3 uMoon; uniform float uCloudY; uniform vec3 uGlow; uniform float uHigh;
  varying vec2 vNdc;
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; }
    return v;
  }
  void main() {
    vec4 far = uInvVP * vec4(vNdc, 1.0, 1.0);
    vec3 rd = normalize(far.xyz / far.w - uCam);
    float h = rd.y;
    vec3 col = mix(uHorizon, uTop, smoothstep(-0.05, 0.55, h));
    float m = max(dot(rd, uMoon), 0.0);
    col += uWarm * (pow(m, 900.0) * 0.9 + pow(m, 40.0) * 0.12 + pow(m, 6.0) * 0.04);
    if (h > 0.0) {
      vec3 sp = rd * 260.0; vec2 cell = floor(sp.xy + sp.z * 0.37);
      float r = hash(cell);
      float star = step(0.986, r) * smoothstep(0.5, 0.0, length(fract(sp.xy + sp.z * 0.37) - 0.5)) * (0.4 + 0.6 * sin(uTime * (1.0 + r * 3.0) + r * 40.0) * 0.5 + 0.3);
      col += mix(uWarm, uAccent, fract(r * 13.0)) * star * smoothstep(0.02, 0.25, h) * 0.9;
      if (uHigh > 0.0) {                               // a thin high cloud layer (the finale plane climbs into it)
        float t = (48.0 - uCam.y) / max(h, 1e-3);
        vec2 q = (uCam.xz + rd.xz * t) * 0.012 + vec2(uTime * 0.003, 0.0);
        float d = smoothstep(0.48, 0.82, fbm(q * vec2(1.0, 2.2)));
        col = mix(col, uHorizon * 1.25 + uWarm * 0.05, d * uHigh * exp(-t * 0.0022) * 0.75);
      }
    } else {                                           // the cloud sea under the terminal, lit by the moon from above
      float t = (uCloudY - uCam.y) / min(h, -1e-3);
      vec3 P = uCam + rd * t;
      vec2 q = P.xz * 0.032 + vec2(uTime * 0.006, uTime * 0.0025);
      float d = fbm(q), d2 = fbm(q + vec2(0.03, 0.022));
      float dens = smoothstep(0.3, 0.78, d);
      float lit = clamp((d - d2) * 5.0 + 0.55, 0.0, 1.0);
      vec3 cloud = mix(uDeep * 1.4, uHorizon * 1.6 + uWarm * 0.05, lit);
      vec2 g = P.xz - uGlow.xy;
      cloud += uAccent * uGlow.z * exp(-dot(g, g) * 0.0018) * (0.25 + 0.75 * dens) * 0.55;
      vec3 sea = mix(uDeep, cloud, dens);
      col = mix(sea, uHorizon, 1.0 - exp(-t * 0.0065));
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ---------- glowing lines: each segment is a quad, widened in screen space (core + halo) ----------
// position = end A · aB = end B · aEnd = (which end 0/1, side −1/1) · aLook = (tone, intensity, world width, group)
export const lineVertex = /* glsl */ `
  ${COMMON}
  ${MOTION}
  attribute vec3 aB; attribute vec2 aEnd; attribute vec4 aLook; attribute vec4 aMotion; attribute vec3 aPivot; attribute float aPortal;
  uniform float uMinPx; uniform float uMaxPx; uniform float uHalo; uniform float uNear;
  varying float vAcross; varying float vCore; varying vec3 vCol; varying float vI; varying vec3 vW; varying float vPortal;
  void main() {
    float a1, k1, a2, k2;
    vec3 A = motion(position, aMotion, aPivot, a1, k1);
    vec3 B = motion(aB, aMotion, aPivot, a2, k2);
    vec4 wA = modelMatrix * vec4(A, 1.0), wB = modelMatrix * vec4(B, 1.0);
    vec4 eA = viewMatrix * wA, eB = viewMatrix * wB;
    float nz = -uNear;
    vI = 0.0; vAcross = 0.0; vCore = 1.0; vCol = vec3(0.0); vW = vec3(0.0); vPortal = -1.0;
    if (eA.z > nz && eB.z > nz) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }   // behind the camera
    if (eA.z > nz) { float f = (nz - eA.z) / (eB.z - eA.z); eA = mix(eA, eB, f); wA = mix(wA, wB, f); }
    if (eB.z > nz) { float f = (nz - eB.z) / (eA.z - eB.z); eB = mix(eB, eA, f); wB = mix(wB, wA, f); }
    vec4 cA = projectionMatrix * eA, cB = projectionMatrix * eB;
    vec2 sA = cA.xy / cA.w * uRes * 0.5, sB = cB.xy / cB.w * uRes * 0.5;
    vec2 dir = sB - sA; float len = length(dir);
    dir = len > 1e-4 ? dir / len : vec2(1.0, 0.0);
    bool atB = aEnd.x > 0.5;
    vec4 c = atB ? cB : cA;
    vec4 e = atB ? eB : eA;
    float px = aLook.z * projectionMatrix[1][1] * uRes.y * 0.5 / c.w;     // world width → pixels at this depth
    float core = clamp(px, uMinPx, uMaxPx);                                // neon-thin up close, never sub-pixel far away
    float halo = uHalo * clamp(px / uMinPx, 0.6, 1.8);
    float half_ = core * 0.5 + halo;
    vec2 off = vec2(-dir.y, dir.x) * aEnd.y * half_ + dir * (atB ? 1.0 : -1.0) * core * 0.5;
    gl_Position = c + vec4(off * 2.0 / uRes * c.w, 0.0, 0.0);
    vAcross = aEnd.y;
    vCore = core * 0.5 / half_;
    float a = atB ? a2 : a1, k = atB ? k2 : k1;
    int tone = int(aLook.x + 0.5);
    vCol = mix(uTones[tone], uTones[0], k);
    float thin = clamp(px / uMinPx, 0.35, 1.0);                           // sub-pixel lines fade instead of aliasing
    vI = aLook.y * uGroup[int(aLook.w + 0.5)] * a * thin * fogAt(-e.z);
    vW = (atB ? wB : wA).xyz;
    vPortal = aPortal;
  }
`;
export const lineFragment = /* glsl */ `
  ${COMMON}
  varying float vAcross; varying float vCore; varying vec3 vCol; varying float vI; varying vec3 vW; varying float vPortal;
  void main() {
    if (vI < 0.002) discard;
    float d = abs(vAcross);
    float core = 1.0 - smoothstep(vCore * 0.55, vCore, d);
    float halo = exp(-d * d * 6.0) * 0.32 + exp(-d * d * 40.0) * 0.25;
    float I = (core * 0.9 + halo) * vI * portal(vPortal, vW);
    gl_FragColor = vec4(vCol * I, I);
  }
`;

// ---------- frosted panels: glass, screens, fills — faint, brighter at the edges and at grazing angles ----------
// aUv = local 0…1 · aSize = world size (for even edges) · aLook = (tone, intensity bottom, intensity top, group) · aEdge = edge glow
export const panelVertex = /* glsl */ `
  ${COMMON}
  ${MOTION}
  attribute vec2 aUv; attribute vec2 aSize; attribute vec3 aNrm; attribute vec4 aLook; attribute float aEdge;
  attribute vec4 aMotion; attribute vec3 aPivot; attribute float aPortal;
  varying vec2 vUv; varying vec2 vSize; varying vec3 vN; varying vec3 vW; varying vec3 vCol; varying float vI; varying float vEdge; varying float vPortal; varying float vI1;
  void main() {
    float a, k;
    vec3 p = motion(position, aMotion, aPivot, a, k);
    vec4 w = modelMatrix * vec4(p, 1.0);
    vW = w.xyz; vUv = aUv; vSize = aSize; vN = normalize(mat3(modelMatrix) * aNrm);
    int tone = int(aLook.x + 0.5);
    vCol = mix(uTones[tone], uTones[0], k);
    float g = uGroup[int(aLook.w + 0.5)] * a * fogAt(distance(cameraPosition, w.xyz));
    vI = aLook.y * g; vI1 = aLook.z * g; vEdge = aEdge * g;
    vPortal = aPortal;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
export const panelFragment = /* glsl */ `
  ${COMMON}
  ${NOISE}
  varying vec2 vUv; varying vec2 vSize; varying vec3 vN; varying vec3 vW; varying vec3 vCol; varying float vI; varying float vEdge; varying float vPortal; varying float vI1;
  void main() {
    vec3 V = normalize(cameraPosition - vW);
    float fres = pow(1.0 - abs(dot(normalize(vN), V)), 2.2);
    vec2 e = min(vUv, 1.0 - vUv) * vSize;
    float edge = exp(-min(e.x, e.y) * 22.0);
    float frost = noise(vW.xy * 7.0 + vW.z * 3.0) * 0.5 + noise(vW.xy * 31.0 - vW.z * 11.0) * 0.5;
    float sheen = smoothstep(0.8, 1.0, sin((vW.x - vW.y * 0.7) * 0.9 + cameraPosition.x * 0.35)) * 0.22;
    float base = mix(vI, vI1, vUv.y);
    float I = (base * (0.45 + 0.4 * frost) + (vI + vI1) * (fres * 0.3 + sheen) + vEdge * edge * 0.5) * portal(vPortal, vW);
    gl_FragColor = vec4(vCol * I, I);
  }
`;

// ---------- sprites: instanced billboards (runway lights, downlights, windows, glows, the "i", dust) ----------
// aPos = position (dust: home in its box, 0…1) · aLook = (tone, intensity, world size, group) ·
// aKind = (shape, mode, p1, p2) · aSlot = slot of its motion · shape 0 glow · 1 flare · 2 the "i" · 3 ring · 4 window
// mode 0 steady · 1 chase (p1 = position along the row, p2 = speed; the pulse grows with the slot) · 2 twinkle, switched
// on by the slot past p1 · 3 dust · 4 blink (p1 phase, p2 rate) · 5 appear over [p1, p2] · 6 breathe
export const spriteVertex = /* glsl */ `
  ${COMMON}
  attribute vec3 aPos; attribute vec4 aLook; attribute vec4 aKind; attribute float aSlot; attribute float aPortal;
  uniform float uMinPx; uniform vec3 uBoxMin; uniform vec3 uBoxSize;
  varying vec2 vUv; varying vec3 vCol; varying float vI; varying float vShape; varying vec3 vW; varying float vPortal;
  void main() {
    int mode = int(aKind.y + 0.5);
    float s = uSlot[int(aSlot + 0.5)];
    vec3 p = aPos; float b = 1.0;
    if (mode == 1) {
      float u = fract(uTime * aKind.w - aKind.z);
      b = 0.55 + s * 1.6 * exp(-u * u * 90.0) + s * 0.5 * exp(-(1.0 - u) * (1.0 - u) * 400.0);
    } else if (mode == 2) {
      b = smoothstep(aKind.z, aKind.z + 0.08, s) * (0.75 + 0.25 * sin(uTime * (0.6 + aKind.w) + aKind.z * 60.0)) + 0.06;
    } else if (mode == 3) {
      vec3 drift = vec3(sin(uTime * 0.11 + aKind.z * 6.28) * 0.6, uTime * (0.04 + aKind.w * 0.05), cos(uTime * 0.09 + aKind.w * 6.28) * 0.5);
      vec3 q = fract((aPos * uBoxSize + drift - uBoxMin) / uBoxSize);   // world-fixed specks, wrapped around the camera
      vec3 e = min(q, 1.0 - q);
      b = smoothstep(0.0, 0.12, min(e.x, min(e.y, e.z))) * (0.5 + 0.5 * sin(uTime * (0.8 + aKind.z) + aKind.w * 30.0));
      p = q * uBoxSize + uBoxMin;
    } else if (mode == 4) {
      b = 0.25 + 1.6 * step(fract(uTime * aKind.w + aKind.z), 0.07);
    } else if (mode == 5) {
      b = smoothstep(aKind.z, aKind.w, s);
    } else if (mode == 6) {
      b = (0.35 + 0.65 * s) * (0.8 + 0.2 * sin(uTime * 1.4 + aKind.z));
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float px = aLook.z * projectionMatrix[1][1] * uRes.y * 0.5 / max(-mv.z, 1e-3);
    float grow = max(1.0, uMinPx / max(px, 1e-3));
    float size = aLook.z * grow;
    b /= grow * grow;                                  // a far light shrinks to a dim point, never a fat blob
    mv.xy += position.xy * size;
    gl_Position = projectionMatrix * mv;
    vUv = position.xy * 2.0;
    vShape = aKind.x;
    vCol = uTones[int(aLook.x + 0.5)];
    vI = aLook.y * b * uGroup[int(aLook.w + 0.5)] * fogAt(-mv.z) * smoothstep(0.15, 0.6, -mv.z);
    vW = (modelMatrix * vec4(p, 1.0)).xyz;
    vPortal = aPortal;
  }
`;
export const spriteFragment = /* glsl */ `
  ${COMMON}
  varying vec2 vUv; varying vec3 vCol; varying float vI; varying float vShape; varying vec3 vW; varying float vPortal;
  float box(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  void main() {
    if (vI < 0.002) discard;
    vec2 p = vUv; float r2 = dot(p, p);
    float v;
    int shape = int(vShape + 0.5);
    if (shape == 0) v = exp(-r2 * 4.5) * smoothstep(1.0, 0.7, r2);
    else if (shape == 1) v = exp(-r2 * 40.0) * 1.3 + exp(-r2 * 5.0) * 0.35 + (exp(-abs(p.y) * 60.0) * exp(-p.x * p.x * 3.0) + exp(-abs(p.x) * 60.0) * exp(-p.y * p.y * 5.0)) * 0.22;
    else if (shape == 2) {                             // the "i": a dot, a stem and a soft ring — a pictogram, not a word
      float dot_ = length(p - vec2(0.0, 0.36)) - 0.09;
      float stem = box(p - vec2(0.0, -0.12), vec2(0.075, 0.27), 0.07);
      float ring = abs(length(p) - 0.72) - 0.022;
      float d = min(min(dot_, stem), ring);
      v = (1.0 - smoothstep(0.0, 0.025, d)) * 1.2 + exp(-max(d, 0.0) * 18.0) * 0.45 + exp(-r2 * 2.5) * 0.12;
      v *= smoothstep(1.0, 0.8, r2);
    } else if (shape == 3) v = exp(-pow(abs(sqrt(r2) - 0.7) * 9.0, 2.0)) * smoothstep(1.0, 0.85, r2);
    else { float d = box(p, vec2(0.55, 0.7), 0.15); v = (1.0 - smoothstep(-0.05, 0.12, d)) * 0.9 + exp(-max(d, 0.0) * 6.0) * 0.25; v *= smoothstep(1.0, 0.85, r2); }
    float I = v * vI * portal(vPortal, vW);
    gl_FragColor = vec4(vCol * I, I);
  }
`;

// ---------- finish: grain + vignette, one quad blended over everything ----------
export const finishVertex = skyVertex;
export const finishFragment = /* glsl */ `
  ${NOISE}
  uniform float uTime; uniform float uAspect; uniform float uVig; uniform float uGrain;
  varying vec2 vNdc;
  void main() {
    vec2 d = vNdc * 0.5 * vec2(uAspect, 1.0);
    float v = smoothstep(0.45, 1.3, length(d)) * uVig;
    float n = hash(floor(gl_FragCoord.xy) + floor(uTime * 24.0) * 17.0) - 0.5;
    float a = clamp(v + max(-n, 0.0) * uGrain, 0.0, 1.0);
    gl_FragColor = vec4(vec3(max(n, 0.0) * uGrain * 0.6), a);
  }
`;

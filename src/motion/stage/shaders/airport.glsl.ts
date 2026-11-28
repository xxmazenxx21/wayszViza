/**
 * "Airport" full-screen shader — Visa Services «رحلة في المطار» (docs/visa-services-creative-treatment.md).
 * Two footage plates (A = the current chapter's video, B = the next chapter's during a cut), kept at FULL quality:
 *   plate     cover-fit at 1:1 (the canvas is drawn at the device pixel ratio and the video is chosen for the screen:
 *             no zoom, no warp, no upscaling). Video frames arrive top-down (no flip on upload): v = 1 − y.
 *   match     per chapter: white balance gains + exposure + a gentle contrast curve, only to match the clips to each
 *             other (they are natural already); a very light vignette; grain at the edge of visibility.
 *   cuts      0 door: frosted glass panels come up in front of us, the next place shows through them, then the two
 *               panels slide apart with lit edges — the Visa identity (sky blue) lives in the cut, not in the footage
 *             1 light: a soft band of Visa sky light sweeps across in the reading direction and carries B in
 *   exit      the film fades into the page navy (the calm FAQ follows).
 *   FINALE    the mullions of a big terminal window in front of the plate (UI navy, a thin sky-blue lip), with their
 *             own pointer parallax: the frame is near, the sky is far.
 * Display (sRGB) space: footage in → footage out. Colours of the cuts come from the semantic tokens (acts/airport.ts).
 */
export { vertex } from './flight.glsl';

export const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uASize;
uniform vec2 uBSize;
uniform vec4 uAMatch;     // white balance r · g · b gains (×), contrast
uniform vec4 uBMatch;
uniform float uMix;       // 0…1 cut A → B
uniform float uWipe;      // 0 door · 1 light
uniform float uExit;      // 0…1 fades into the page navy
uniform float uSide;      // 1 ltr · −1 rtl
uniform float uCompact;   // portrait screens
uniform vec2 uPointer;    // −1…1, eased (FINALE: the window frame only)
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBg;
uniform vec3 uSky;
uniform vec3 uInk;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// screen uv → plate uv: cover-fit, centred, 1:1 (no zoom)
vec2 plateUv(vec2 uv, vec2 size) {
  float ra = uRes.x / uRes.y, ri = size.x / size.y;
  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);
  vec2 p = (uv - 0.5) * s + 0.5;
  return vec2(p.x, 1.0 - p.y);
}

vec3 match(vec3 c, vec4 m) {
  c *= m.rgb;
  return clamp((c - 0.5) * m.a + 0.5, 0.0, 1.0);
}

vec3 plate(sampler2D t, vec2 p, vec4 m) { return match(texture2D(t, p).rgb, m); }

// frosted glass of a door panel: the plate softened by a ring of taps (only during the cut), cool and a little lighter
vec3 frosted(sampler2D t, vec2 p, vec4 m, vec2 local) {
  vec2 px = 1.0 / uRes;
  vec2 n = (vec2(noise(local * vec2(14.0, 40.0)), noise(local * vec2(16.0, 37.0) + 7.0)) - 0.5) * 0.006;
  vec3 c = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    float a = float(i) * 2.39996;
    float r = 6.0 + 2.2 * float(i);
    c += texture2D(t, p + n + vec2(cos(a), sin(a)) * r * px).rgb;
  }
  c = match(c / 12.0, m);
  c = mix(c, uInk, 0.08) + uSky * 0.04;
  float streak = smoothstep(0.16, 0.0, abs(local.x * 1.4 + local.y * 0.55 - 0.42)) * 0.1
               + smoothstep(0.05, 0.0, abs(local.x * 1.4 + local.y * 0.55 - 0.66)) * 0.05;
  return c + mix(uSky, uInk, 0.6) * streak;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float m = uMix;
  vec3 col;

  if (m <= 0.0) {
    col = plate(uA, plateUv(uv, uASize), uAMatch);
  } else if (uWipe < 0.5) {
    // ---- door: the glass comes up in front of us, the next place shows through it, the panels slide apart
    float frost = smoothstep(0.0, 0.32, m);
    float through = smoothstep(0.26, 0.62, m);
    float open = smoothstep(0.56, 1.0, m);
    float gap = open * 0.56;
    vec2 pA = plateUv(uv, uASize), pB = plateUv(uv, uBSize);
    float dx = uv.x - 0.5;
    float inPanel = step(gap, abs(dx));
    vec2 local = vec2((abs(dx) - gap) * aspect, uv.y);
    vec3 clearA = plate(uA, pA, uAMatch), clearB = plate(uB, pB, uBMatch);
    vec3 glass = mix(frosted(uA, pA, uAMatch, local), frosted(uB, pB, uBMatch, local), through);
    vec3 panel = mix(mix(clearA, clearB, through), glass, frost);
    col = mix(clearB, panel, inPanel);
    float edge = smoothstep(0.004, 0.0, abs(abs(dx) - gap) - 0.0008) * frost;
    col += mix(uSky, uInk, 0.55) * edge * 0.6;
    float rail = (smoothstep(0.035, 0.03, uv.y) + smoothstep(0.955, 0.96, uv.y)) * frost * (1.0 - open);
    col = mix(col, uBg, rail * 0.9);
  } else {
    // ---- light: a soft band of Visa sky light sweeps across in the reading direction and carries B in
    vec2 dir = normalize(vec2(uSide * aspect, 0.42));
    float s = dot((uv - 0.5) * vec2(aspect, 1.0), dir) / (0.5 * length(vec2(aspect, 1.0)) * 1.05);
    float front = mix(-1.25, 1.25, m);
    float k = smoothstep(front + 0.03, front - 0.03, s);
    col = mix(plate(uA, plateUv(uv, uASize), uAMatch), plate(uB, plateUv(uv, uBSize), uBMatch), k);
    float band = exp(-pow((s - front) / 0.16, 2.0));
    float rays = 0.75 + 0.25 * noise(vec2(dot(uv, vec2(-dir.y, dir.x)) * 40.0, uTime * 0.2));
    col = mix(col, mix(uSky, uInk, 0.45) * 1.1, band * 0.75 * rays);
    col += uSky * exp(-pow((s - front) / 0.5, 2.0)) * 0.12;
  }

#ifdef FINALE
  // ---- the window frame (UI navy, a thin sky-blue lip), nearer than the sky: it follows the pointer more
  vec2 q = uv + uPointer * vec2(0.012, 0.008);
  float bw = 0.008;
  float xs = uCompact > 0.5 ? abs(q.x - 0.5) : min(min(abs(q.x - 0.17), abs(q.x - 0.5)), abs(q.x - 0.83));
  float vx = xs * aspect;
  float bars = smoothstep(bw + 0.0015, bw, vx);
  float transom = smoothstep(0.011, 0.0095, abs(q.y - 0.82));
  float sill = smoothstep(0.065, 0.06, q.y);
  float frame = max(max(bars, transom), sill);
  float lip = smoothstep(0.0022, 0.0, abs(vx - bw)) * (1.0 - sill) + smoothstep(0.002, 0.0, abs(q.y - 0.065));
  col = mix(col, uBg * 0.6, frame);
  col += uSky * lip * 0.25;
#endif

  col = mix(col, uBg, uExit);
  // a very light vignette · grain at the edge of visibility
  vec2 v = (uv - 0.5) * vec2(mix(aspect, 1.0, 0.4), 1.0);
  col *= 1.0 - smoothstep(0.55, 1.1, length(v) * 1.1) * 0.14;
  col += (hash(uv * uRes + fract(uTime * 0.37) * 91.0) - 0.5) * 0.012;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

/**
 * Shaders of the act `atlas` (acts/atlas.ts) — «خريطة الرحلة» / "The Route Map", the Visa Service Details template.
 * The night Earth of Home §1.5 / the explore globe, made the stage of ONE page's destinations:
 *   earth   NASA Black Marble + the land mask of the borders; warm city lights, sky-blue limb, a dusk glow whose
 *           strength and side come from the page's group (the mood) · uDim veils it while text is read over it
 *   halo    the atmosphere (back faces of a bigger sphere), gain from the mood
 *   country the page's destination countries: fill (normal blend) + outline (additive), lit when their route lands
 *           (uIntro) and brighter for the country the camera is visiting (uFocus)
 *   routes  ONE merged mesh of every route from Egypt: drawn from Egypt on arrival (uIntro, staggered per route),
 *           then light travels along them (two pulses per route); far side fades by itself (no depth buffer)
 *   sprites ONE instanced mesh: the destination marks, Egypt's home mark (a ripple) and the travelling lights that ride
 *           the routes — positions computed HERE from the same analytic arc as the route meshes (slerp + a lift)
 *   finish  grain + vignette on top
 * Display (sRGB) space; colours are the semantic tokens read by acts/util.ts token(). No hex here.
 */

/** the route timeline shared by countries, routes and sprites: when route i is drawn, when its country lands */
const LIT = /* glsl */ `
  uniform float uIntro;      // seconds since the routes began to draw (large = all drawn)
  uniform float uStagger;    // seconds between two routes
  uniform float uDraw;       // seconds a route takes from Egypt to its country
  uniform float uFocus;      // the destination the camera is visiting (fractions = flying), −10 = none
  uniform float uTime;
  uniform float uSpeed;      // mood: how fast the light travels along the routes
  float drawn(float i) { return clamp((uIntro - i * uStagger) / uDraw, 0.0, 1.0); }
  float landed(float i) { return clamp((uIntro - i * uStagger - uDraw * 0.85) / 0.6, 0.0, 1.0); }
  float focusOf(float i) { return max(0.0, 1.0 - abs(i - uFocus)); }
  float h1(float n) { return fract(sin(n * 12.9898 + 4.1) * 43758.5453); }
  // where light k (0 or 1) of route i is along it: −0.15 … 1.15 (it enters and leaves softly); the sprites ride it
  float runOf(float i, float k) { return fract(uTime * uSpeed * (0.75 + 0.5 * h1(i + 3.0)) + h1(i) + k * 0.5) * 1.3 - 0.15; }
`;

export const earthVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

export const earthFragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorld;
uniform sampler2D uMap;      // NASA Black Marble (city lights)
uniform sampler2D uLand;     // land mask drawn from the border polygons
uniform vec3 uNavy;
uniform vec3 uSky;
uniform vec3 uWarm;          // warm white: the ink warmed by the travel tone (city lights, dusk)
uniform vec3 uSunDir;
uniform float uFade;
uniform float uLights;       // mood: how bright the cities are
uniform float uDusk;         // mood: how strong the last light on the limb is
uniform float uDim;          // 0…1: a veil while text is read over the globe

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorld);
  float ndv = max(dot(N, V), 0.0);
  vec3 tex = texture2D(uMap, vUv).rgb;
  float land = texture2D(uLand, vUv).r;
  float lights = smoothstep(0.3, 0.85, max(tex.r, tex.g));
  vec3 col = uNavy * 0.5 + tex * vec3(0.3, 0.5, 0.95) * 0.14;             // sea: cold and dark
  col = mix(col, uNavy * 1.04 + uSky * 0.06, land);                       // land: one step lighter, so coasts read
  col += uWarm * lights * (0.55 + 0.5 * lights) * uLights;                // cities: warm white points
  col *= 0.4 + 0.6 * smoothstep(0.0, 0.5, ndv);                           // limb darkening
  float dusk = smoothstep(0.4, 1.0, dot(N, uSunDir));
  col += mix(uWarm, uSky, 0.45) * dusk * (0.03 + 0.3 * pow(1.0 - ndv, 2.0)) * uDusk;
  col += uSky * pow(1.0 - ndv, 3.4) * 0.42;                               // thin blue atmosphere on the limb
  col = mix(col, uNavy, uDim * 0.72);
  gl_FragColor = vec4(mix(uNavy, col, uFade), 1.0);
}`;

export const haloFragment = /* glsl */ `
precision highp float;
varying vec3 vNormalW;
varying vec3 vWorld;
uniform vec3 uSky;
uniform vec3 uWarm;
uniform vec3 uSunDir;
uniform float uFade;
uniform float uGain;         // mood
uniform float uDim;
void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorld);
  float d = clamp(-dot(N, V) / 0.46, 0.0, 1.0);           // 0 at the outer edge → 1 at the globe's limb
  float dusk = smoothstep(-0.2, 0.9, dot(N, uSunDir));
  vec3 col = mix(uSky, uWarm, dusk * 0.35) * pow(d, 3.4) * (0.28 + dusk * 0.22) * uGain;
  gl_FragColor = vec4(col * uFade * (1.0 - uDim * 0.5), 1.0);
}`;

/** the page's countries (fills and outlines): `aIndex` = the destination's place in the page's list */
export const countryVertex = /* glsl */ `
attribute float aIndex;
uniform vec3 uCenter;
varying float vFacing;
varying float vIndex;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vFacing = dot(normalize(world.xyz - uCenter), normalize(cameraPosition - uCenter));
  vIndex = aIndex;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const COUNTRY = /* glsl */ `
precision highp float;
varying float vFacing;
varying float vIndex;
uniform vec3 uColor;
uniform float uBase;         // every destination, once its route has landed
uniform float uBoost;        // + the one the camera is visiting
uniform float uHorizon;      // cosine of the angle where the limb is
uniform float uFade;
${LIT}
float countryLight() {
  float vis = smoothstep(uHorizon, uHorizon + 0.12, vFacing);
  float breathe = 0.86 + 0.14 * sin(uTime * 1.5 + vIndex * 1.7);
  return (uBase * breathe + uBoost * focusOf(vIndex)) * landed(vIndex) * vis * uFade;
}
`;
export const countryFill = /* glsl */ `${COUNTRY}
void main() {
  float a = countryLight();
  if (a <= 0.001) discard;
  gl_FragColor = vec4(uColor, a);
}`;
export const countryLine = /* glsl */ `${COUNTRY}
void main() {
  float a = countryLight();
  if (a <= 0.001) discard;
  gl_FragColor = vec4(uColor * a, 1.0);
}`;

/** the routes: merged tubes, uv.x = 0 at Egypt → 1 at the country, `aArc` = destination index */
export const routeVertex = /* glsl */ `
attribute float aArc;
varying float vS;
varying float vArc;
varying vec3 vWorld;
void main() {
  vS = uv.x;
  vArc = aArc;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

export const routeFragment = /* glsl */ `
precision highp float;
varying float vS;
varying float vArc;
varying vec3 vWorld;
uniform vec3 uColor;
uniform vec3 uCenter;
uniform float uAlpha;
uniform float uPulse;        // mood: strength of the travelling light
uniform float uFade;
uniform float uDim;
${LIT}
// a comet: bright at its head, a tail behind it (toward Egypt)
float comet(float c, float s) { return s <= c ? exp(-(c - s) * 11.0) : exp(-(s - c) * 70.0); }
void main() {
  float head = drawn(vArc);
  if (vS > head) discard;
  float facing = dot(normalize(vWorld - uCenter), normalize(cameraPosition - uCenter));
  float vis = smoothstep(-0.05, 0.2, facing);
  float f = focusOf(vArc);
  float base = 0.3 + 0.7 * f;
  float tip = exp(-(head - vS) * 14.0) * step(head, 0.999);              // the drawing head, while it draws
  float pulse = (comet(runOf(vArc, 0.0), vS) + comet(runOf(vArc, 1.0), vS)) * uPulse * step(0.999, head);
  float ends = smoothstep(0.0, 0.04, vS) * 0.7 + 0.3;                     // the route leaves the ground softly
  float light = (base * uAlpha + tip * 0.85 + pulse * (0.55 + 0.8 * f)) * ends * (1.0 - uDim * 0.45);
  gl_FragColor = vec4(uColor * light * vis * uFade, 1.0);
}`;

/** instanced billboards: kind 0 = destination mark · 1 = travelling light · 2 = Egypt (home) */
export const spriteVertex = /* glsl */ `
attribute vec3 aA;           // mark / home: the point · traveller: Egypt
attribute vec3 aB;           // traveller: the country
attribute vec4 aP;           // kind, light (0 | 1: which of the route's two lights), −, lift
attribute float aI;          // destination index
uniform float uScale;        // grows a little with the zoom
uniform float uSize;
uniform float uHorizon;
uniform vec3 uCenter;
uniform float uHome;         // finale: Egypt's mark brightens before the take-off
${LIT}
varying vec2 vUv;
varying float vKind;
varying float vAlpha;
varying float vFocus;
vec3 arcPoint(vec3 a, vec3 b, float lift, float t) {
  float w = acos(clamp(dot(a, b), -1.0, 1.0));
  vec3 p = (sin((1.0 - t) * w) * a + sin(t * w) * b) / max(sin(w), 1e-4);
  return p * (1.0 + lift * sin(3.14159265 * t));
}
void main() {
  float kind = aP.x;
  vec3 p = aA * 1.004;
  float alpha = 1.0;
  float size = uSize;
  vFocus = 0.0;
  if (kind > 0.5 && kind < 1.5) {
    float t = runOf(aI, aP.y);
    p = arcPoint(aA, aB, aP.w, clamp(t, 0.0, 1.0)) * 1.003;
    alpha = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.94, t) * step(0.999, drawn(aI));
    size *= 0.8;
  } else if (kind < 0.5) {
    vFocus = focusOf(aI);
    alpha = landed(aI);
    size *= 1.0 + 0.7 * vFocus;
  } else {
    size *= 1.3 + 0.5 * uHome;
  }
  vec4 world = modelMatrix * vec4(p, 1.0);
  float facing = dot(normalize(world.xyz - uCenter), normalize(cameraPosition - uCenter));
  alpha *= kind > 0.5 && kind < 1.5 ? smoothstep(-0.05, 0.2, facing) : smoothstep(uHorizon, uHorizon + 0.1, facing);
  vec4 mv = viewMatrix * world;
  mv.xy += position.xy * size * uScale;
  gl_Position = projectionMatrix * mv;
  vUv = position.xy * 2.0;
  vKind = kind;
  vAlpha = alpha;
}`;

export const spriteFragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying float vKind;
varying float vAlpha;
varying float vFocus;
uniform vec3 uColor;
uniform vec3 uInk;
uniform float uTime;
uniform float uFade;
uniform float uHome;
void main() {
  float r = length(vUv);
  if (r > 1.0 || vAlpha <= 0.001) discard;
  float a;
  vec3 col;
  if (vKind > 0.5 && vKind < 1.5) {                                      // a travelling light: halo + white core
    float core = smoothstep(0.24, 0.0, r);
    a = exp(-r * r * 7.0) * 0.8 + core;
    col = mix(uColor, uInk, core * 0.8);
  } else if (vKind < 0.5) {                                              // a destination: ring + dot, a glow when visited
    float ring = smoothstep(0.09, 0.0, abs(r - 0.56));
    float dot0 = smoothstep(0.24, 0.15, r);
    float glow = exp(-r * r * 3.5) * (0.12 + 0.5 * vFocus);
    a = ring * (0.6 + 0.4 * vFocus) + dot0 + glow;
    col = mix(uColor, uInk, dot0 * 0.45 + vFocus * 0.25);
  } else {                                                               // Egypt: ring + dot + a ripple that leaves it
    float ripple = fract(uTime * 0.42);
    float wave = smoothstep(0.07, 0.0, abs(r - ripple)) * (1.0 - ripple);
    float ring = smoothstep(0.08, 0.0, abs(r - 0.4));
    float dot0 = smoothstep(0.2, 0.12, r);
    a = ring * 0.9 + dot0 + wave * (0.7 + 0.6 * uHome) + exp(-r * r * 4.0) * 0.25 * uHome;
    col = mix(uColor, uInk, 0.3 + dot0 * 0.5);
  }
  gl_FragColor = vec4(col * a * vAlpha * uFade, 1.0);
}`;

/** grain + vignette on top of everything (premultiplied alpha) */
export const finishVertex = /* glsl */ `
varying vec2 vNdc;
void main() { vNdc = position.xy; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
export const finishFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uAspect;
uniform float uVig;
uniform float uGrain;
varying vec2 vNdc;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main() {
  vec2 d = vNdc * 0.5 * vec2(uAspect, 1.0);
  float v = smoothstep(0.45, 1.3, length(d)) * uVig;
  float n = hash(floor(gl_FragCoord.xy) + floor(uTime * 24.0) * 17.0) - 0.5;
  float a = clamp(v + max(-n, 0.0) * uGrain, 0.0, 1.0);
  gl_FragColor = vec4(vec3(max(n, 0.0) * uGrain * 0.6), a);
}`;

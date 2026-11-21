/**
 * Shaders of the act `paper` (acts/paper.ts) — «رحلة الورق», WaysZ Visa Home.
 * Five programs: the night background · paper flakes (instanced) · book pages (hinge, page curl, foil) ·
 * pop-up dioramas (one merged geometry each: hinges, slides, swings, spins and fades per vertex) · the finish
 * overlay (grain + vignette, blended on top — no render target).
 * Light is fake on purpose: normal → shade, a soft rim from the accent light, foil sheen from the pointer.
 * Colours are display-space values read from the tokens (acts/util.ts token()); no hex here.
 * Everything blends PREMULTIPLIED (the shared canvas has no depth buffer: pieces are drawn back to front).
 */

const NOISE = /* glsl */ `
  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  // paper fibre: long soft streaks + a fine tooth (p in world-ish units)
  float fibre(vec2 p) {
    return noise(p * vec2(38.0, 9.0)) * 0.45 + noise(p * vec2(11.0, 46.0)) * 0.3 + noise(p * 160.0) * 0.25;
  }
`;

// ---------- the night ----------
export const bgVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
export const bgFragment = /* glsl */ `
  uniform vec3 uTop; uniform vec3 uLow; uniform vec3 uGlow;
  uniform vec2 uGlowPos; uniform float uGlowAmt; uniform float uAspect; uniform float uDim;
  varying vec2 vUv;
  void main() {
    vec3 col = mix(uLow, uTop, smoothstep(0.0, 1.0, vUv.y));
    vec2 d = (vUv - uGlowPos) * vec2(uAspect, 1.0);
    col += uGlow * exp(-dot(d, d) * 2.6) * uGlowAmt;            // the accent light behind the booklet
    col += uGlow * exp(-dot(d, d) * 18.0) * uGlowAmt * 0.35;
    gl_FragColor = vec4(col * (1.0 - uDim), 1.0);
  }
`;

// ---------- paper flakes (instanced quads, tumbling, wrapped in a box) ----------
export const flakeVertex = /* glsl */ `
  attribute vec4 aSeed; attribute vec3 aHome;
  uniform float uTime; uniform vec3 uBoxMin; uniform vec3 uBoxSize; uniform float uScale;
  uniform float uFogNear; uniform float uFogFar;
  varying vec3 vN; varying vec3 vW; varying vec2 vUv; varying float vFade; varying float vSeed;
  mat3 rotXYZ(vec3 a) {
    vec3 s = sin(a), c = cos(a);
    return mat3(c.y * c.z, c.y * s.z, -s.y,
                s.x * s.y * c.z - c.x * s.z, s.x * s.y * s.z + c.x * c.z, s.x * c.y,
                c.x * s.y * c.z + s.x * s.z, c.x * s.y * s.z - s.x * c.z, c.x * c.y);
  }
  void main() {
    vec3 drift = vec3(sin(uTime * 0.13 + aSeed.x * 6.283) * 0.08,
                      -uTime * (0.03 + aSeed.y * 0.035),
                      cos(uTime * 0.11 + aSeed.z * 6.283) * 0.06);
    vec3 q = fract(aHome + drift / uBoxSize);                   // wrap inside the box …
    vec3 e = min(q, 1.0 - q);
    vFade = smoothstep(0.0, 0.08, min(e.x, min(e.y, e.z)));      // … and fade at its walls
    vec3 p = q * uBoxSize + uBoxMin;
    float s = mix(0.03, 0.075, aSeed.w) * uScale;
    vec3 ang = vec3(uTime * (0.18 + aSeed.x * 0.45) + aSeed.y * 6.283,
                    uTime * (0.14 + aSeed.z * 0.35) + aSeed.w * 6.283, aSeed.x * 3.0);
    mat3 R = rotXYZ(ang);
    vec3 local = R * vec3(position.x * s, position.y * s * 1.32, 0.0);
    vec4 w = modelMatrix * vec4(p + local, 1.0);
    vN = normalize(mat3(modelMatrix) * (R * vec3(0.0, 0.0, 1.0)));
    vW = w.xyz; vUv = uv; vSeed = aSeed.x;
    float dist = distance(cameraPosition, w.xyz);
    vFade *= smoothstep(0.35, 0.9, dist) * (1.0 - smoothstep(uFogNear, uFogFar, dist));
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
export const flakeFragment = /* glsl */ `
  uniform vec3 uPaper; uniform vec3 uAccent; uniform vec3 uLight; uniform float uAlpha; uniform float uSoft;
  varying vec3 vN; varying vec3 vW; varying vec2 vUv; varying float vFade; varying float vSeed;
  void main() {
    vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - vW);
    float lit = 0.5 + 0.5 * max(dot(N, uLight), 0.0);
    float rim = pow(1.0 - abs(dot(N, V)), 3.0);
    vec3 col = uPaper * lit * (0.82 + 0.18 * vSeed) + uAccent * rim * 0.9;
    vec2 e = abs(vUv - 0.5) * 2.0;
    float a = (1.0 - smoothstep(1.0 - uSoft, 1.0, max(e.x, e.y))) * vFade * uAlpha;
    gl_FragColor = vec4(col * a, a);
  }
`;

// ---------- the booklet: cover, pages, the turning page, edges, ribbon ----------
// uMode 0 = flat plane (the mesh carries its own transform, e.g. the cover's hinge) · 1 = the turning page:
// the plane spans u = position.x in 0…1 from the spine; it rotates over the spine with a curl (the outer part
// lags behind, the corner leads), all here in the vertex shader.
export const pageVertex = /* glsl */ `
  uniform float uMode; uniform float uTurn; uniform float uCurl; uniform float uSide; uniform float uW; uniform float uH;
  varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying vec3 vT; varying vec3 vB; varying float vU;
  const float PI = 3.14159265;
  void main() {
    vec3 p = position; vec3 n = vec3(0.0, 0.0, 1.0); vec3 t = vec3(1.0, 0.0, 0.0);
    vU = uv.x;
    if (uMode > 0.5) {
      float s = position.x * uW;                                // arc length from the spine
      float th = uTurn * PI;
      float b = max(uCurl * sin(uTurn * PI) * (1.0 + 0.45 * position.y), 1e-3);
      float phi = th - b * s;
      p = vec3(uSide * (sin(th) - sin(phi)) / b, position.y * uH, (cos(phi) - cos(th)) / b);
      n = vec3(-uSide * sin(phi), 0.0, cos(phi));
      t = vec3(uSide * cos(phi), 0.0, sin(phi));
      vU = position.x;
    }
    vec4 w = modelMatrix * vec4(p, 1.0);
    vW = w.xyz; vUv = uv;
    vN = normalize(mat3(modelMatrix) * n);
    vT = normalize(mat3(modelMatrix) * t);
    vB = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0));
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
export const pageFragment = /* glsl */ `
  ${NOISE}
  uniform sampler2D uAtlas;
  uniform vec4 uFront; uniform vec4 uBack; uniform vec4 uFoil;     // atlas rects (u0, v0, u1, v1); uFoil.z = 0 → none
  uniform float uMode; uniform float uSide; uniform float uMirror;   // uMirror: the geometry is mirrored (RTL turning page)
  uniform vec3 uLight; uniform vec3 uAccent; uniform vec3 uTint; uniform vec3 uTintBack;
  uniform float uAlpha; uniform float uRim; uniform float uGutter; uniform vec3 uFoilLight; uniform float uFibre;
  varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying vec3 vT; varying vec3 vB; varying float vU;
  vec2 at(vec4 r, vec2 uv) { return mix(r.xy, r.zw, uv); }
  void main() {
    bool front = uMirror > 0.5 ? !gl_FrontFacing : gl_FrontFacing;
    vec2 uv = vUv;
    if (uMode > 0.5) {                                               // the turning page: texture runs from the fore-edge
      float fx = uSide > 0.0 ? vU : 1.0 - vU;
      uv.x = front ? fx : 1.0 - fx;
    } else if (!front) uv.x = 1.0 - uv.x;
    vec4 tex = texture2D(uAtlas, at(front ? uFront : uBack, uv));
    vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - vW);
    float lit = 0.66 + 0.34 * max(dot(N, uLight), 0.0);
    vec3 col = tex.rgb * (front ? uTint : uTintBack);
    col *= 1.0 + (fibre(uv * vec2(3.2, 4.4)) - 0.5) * uFibre;
    if (uFoil.z > 0.0 && front) {                                    // debossed mark + sky-blue foil
      vec2 fu = at(uFoil, uv);
      vec2 px = vec2(1.0 / 2048.0) * 1.6;
      float m = texture2D(uAtlas, fu).r;
      float gx = texture2D(uAtlas, fu + vec2(px.x, 0.0)).r - texture2D(uAtlas, fu - vec2(px.x, 0.0)).r;
      float gy = texture2D(uAtlas, fu + vec2(0.0, px.y)).r - texture2D(uAtlas, fu - vec2(0.0, px.y)).r;
      vec3 Np = normalize(N - (vT * gx + vB * gy) * 1.6);            // pressed edges catch the light
      float edge = clamp(dot(Np, uFoilLight) - dot(N, uFoilLight), -1.0, 1.0);
      col *= 1.0 - m * 0.18;                                          // the pressed area sits a little deeper
      col += edge * 0.22;
      vec3 R = reflect(-uFoilLight, Np);
      float sheen = pow(max(dot(R, V), 0.0), 18.0);
      vec3 foil = uAccent * (0.55 + 0.45 * max(dot(Np, uLight), 0.0)) + (uAccent * 0.5 + 0.5) * sheen * 1.4;
      col = mix(col, foil, m);
    }
    col *= lit;
    if (uGutter > 0.5) col *= mix(0.72, 1.0, smoothstep(0.0, 0.16, uGutter > 1.5 ? 1.0 - vU : vU));   // the gutter (1: spine at u = 0 · 2: at u = 1)
    col += uAccent * pow(1.0 - abs(dot(N, V)), 2.5) * uRim;
    float a = tex.a * uAlpha;
    gl_FragColor = vec4(col * a, a);
  }
`;

// ---------- pop-up dioramas ----------
// One merged geometry per diorama. Per vertex:
//   position  (cx, cy, kind)          corner in the piece's own plane (x along its base line, y up the piece); kind 1 = soft shadow
//   aBase     (x, y, z)               the piece's hinge point on the spread (spread space: x across, y away from the viewer, z up)
//   aOrient   (yaw, tilt, lift, turns) turn around z · standing angle once risen (0 = flat, π/2 = upright) · offset along its
//                                     normal (overlays) · spin: how many turns over its window
//   aWin      (r0, r1, a0, a1)        windows on uRise (pop-up) and on uAct (its own motion)
//   aFrom     (x, y, z)               travel: where it comes from (spread space) · spin: the pivot in its plane ·
//                                     swing: x = its hinge line in its plane
//   aMode     (motion, fade, w, h)    motion 0 none · 1 travel · 2 swing · 3 spin   fade 0 none · 1 in · 2 out · 3 glow in
export const popVertex = /* glsl */ `
  attribute vec3 aBase; attribute vec4 aOrient; attribute vec4 aWin; attribute vec3 aFrom; attribute vec4 aMode;
  uniform float uRise; uniform float uAct; uniform float uFold; uniform float uShadow;
  varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vAlpha; varying float vGlow; varying float vKind; varying vec2 vLocal;
  const float PI = 3.14159265;
  void main() {
    float rise = smoothstep(aWin.x, aWin.y, uRise);
    float act = smoothstep(aWin.z, aWin.w, uAct);
    float phi = aOrient.y * rise;
    vec2 c = position.xy;
    float motion = aMode.x, fade = aMode.y;
    if (motion > 2.5) {                                              // spin in its own plane around the pivot (clock hands)
      float a = -act * aOrient.w * 2.0 * PI;
      vec2 d = c - aFrom.xy;
      c = aFrom.xy + vec2(d.x * cos(a) - d.y * sin(a), d.x * sin(a) + d.y * cos(a));
    }
    vec3 right = vec3(1.0, 0.0, 0.0);
    vec3 up = vec3(0.0, cos(phi), sin(phi));                          // flat: lies back toward +y · risen: stands up
    vec3 nrm = vec3(0.0, -sin(phi), cos(phi));                        // faces the viewer once standing
    vec3 local;
    if (position.z > 0.5) {                                          // its soft shadow, flat on the page behind it
      float len = aMode.w * (0.12 + 0.5 * sin(phi));
      local = vec3(c.x * 1.08, c.y / max(aMode.w, 1e-3) * len, 0.0006);
    } else if (motion > 1.5 && motion < 2.5) {                       // swing around its hinge line x = aFrom.x (doors open away)
      float r = c.x - aFrom.x;
      float beta = act * 1.35;
      local = right * (aFrom.x + r * cos(beta)) + up * c.y - nrm * (abs(r) * sin(beta)) + nrm * aOrient.z;
    } else {
      local = right * c.x + up * c.y + nrm * aOrient.z;
    }
    float cy = cos(aOrient.x), sy = sin(aOrient.x);
    mat3 yaw = mat3(cy, sy, 0.0, -sy, cy, 0.0, 0.0, 0.0, 1.0);
    vec3 p = aBase + yaw * local;
    if (motion > 0.5 && motion < 1.5) {                              // travel in from aFrom, on a small arc
      float k = 1.0 - act;
      vec3 off = aFrom * k;
      if (position.z > 0.5) off.z = 0.0;
      p += off + vec3(0.0, 0.0, sin(act * PI) * 0.1 * step(position.z, 0.5));
    }
    float alpha = uFold * smoothstep(0.0, 0.12, rise + step(aOrient.y, 0.01));
    if (fade > 0.5 && fade < 1.5) alpha *= act;
    else if (fade > 1.5 && fade < 2.5) alpha *= 1.0 - act;
    vGlow = fade > 2.5 ? act : 0.0;
    if (fade > 2.5) alpha *= act;
    if (position.z > 0.5) alpha *= uShadow * sin(phi) * (1.0 - c.y / max(aMode.w, 1e-3) * 0.15);
    vAlpha = alpha;
    vKind = position.z;
    vLocal = vec2(c.x / max(aMode.z, 1e-3) + 0.5, c.y / max(aMode.w, 1e-3));
    vec4 w = modelMatrix * vec4(p, 1.0);
    vW = w.xyz; vUv = uv;
    vN = normalize(mat3(modelMatrix) * (yaw * nrm));
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
export const popFragment = /* glsl */ `
  ${NOISE}
  uniform sampler2D uAtlas; uniform vec3 uLight; uniform vec3 uAccent; uniform vec3 uPaper; uniform vec3 uShade;
  varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vAlpha; varying float vGlow; varying float vKind; varying vec2 vLocal;
  void main() {
    if (vAlpha < 0.002) discard;
    if (vKind > 0.5) {                                               // gradient shadow: dark at the hinge, soft at the edges
      vec2 e = abs(vLocal - vec2(0.5, 0.0)) * vec2(2.0, 1.0);
      float a = vAlpha * (1.0 - smoothstep(0.55, 1.0, e.x)) * (1.0 - smoothstep(0.0, 1.0, e.y));
      gl_FragColor = vec4(uShade * a, a);
      return;
    }
    vec4 tex = texture2D(uAtlas, vUv);
    if (tex.a < 0.01) discard;
    vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - vW);
    float lit = 0.62 + 0.38 * max(dot(N, uLight), 0.0);
    vec3 base = gl_FrontFacing ? tex.rgb : uPaper * tex.a * 0.86;   // the back of a piece: plain paper
    base *= 1.0 + (fibre(vLocal * 2.0) - 0.5) * 0.08;
    float rim = pow(1.0 - abs(dot(N, V)), 2.4);
    vec3 col = base * lit + uAccent * tex.a * (rim * 0.35 + vGlow * 0.4);
    float a = tex.a * vAlpha;
    gl_FragColor = vec4(col * vAlpha, a);
  }
`;

// ---------- finish: grain + vignette, one quad blended over everything ----------
export const finishVertex = bgVertex;
export const finishFragment = /* glsl */ `
  ${NOISE}
  uniform float uTime; uniform float uAspect; uniform float uVig; uniform float uGrain;
  varying vec2 vUv;
  void main() {
    vec2 d = (vUv - 0.5) * vec2(uAspect, 1.0);
    float v = smoothstep(0.42, 1.25, length(d)) * uVig;
    float n = hash(floor(gl_FragCoord.xy) + floor(uTime * 24.0) * 17.0) - 0.5;
    float a = clamp(v + max(-n, 0.0) * uGrain, 0.0, 1.0);
    gl_FragColor = vec4(vec3(max(n, 0.0) * uGrain * 0.6), a);
  }
`;

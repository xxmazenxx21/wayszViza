/**
 * Act "airport" — Visa Services «رحلة في المطار» (docs/visa-services-creative-treatment.md). Real footage at full
 * quality: the scenes (airport-thread · airport-cta) own scroll and the videos (motion/reel.ts) and leave the videos to
 * show in bridge.airport; this act uploads a video frame as a texture only when a new one is presented (the browser's
 * GPU path for <video>) and draws ONE full-screen quad (no render target, 1 draw call) with the match, the cuts and the
 * finale window of shaders/airport.glsl.ts.
 * Two instances: 'journey' (the sticky host behind hero → §2.2) and 'finale' (§2.4, the window mullions on).
 * The footage is drawn at the device pixel ratio (cap 2) and never below 1 (`ratio`): linear filtering, 1:1 sampling.
 * Every visitor gets the full shader (quality policy).
 */
import { gsap } from 'gsap';
import {
  LinearFilter, Mesh, NoColorSpace, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Texture, Vector2, Vector4,
} from 'three';
import type { Act } from '../stage';
import { airport, type AirportPlate } from '../bridge';
import { fragment, vertex } from '../shaders/airport.glsl';
import { token } from './util';

/** per chapter (approach · corridor · gates · takeoff): white balance gains r · g · b and contrast — a light match only */
const MATCH: [number, number, number, number][] = [
  [1.0, 1.0, 1.0, 1.02],
  [1.0, 1.0, 1.0, 1.0],
  [1.0, 1.0, 0.99, 1.0],
  [0.99, 1.0, 1.01, 1.0],
];

function plateTexture() {
  const t = new Texture();
  t.flipY = false;                                        // frames arrive top-down; the shader reads v = 1 − y
  t.premultiplyAlpha = false;
  t.colorSpace = NoColorSpace;                            // display space: footage in → footage out
  t.minFilter = t.magFilter = LinearFilter;
  t.generateMipmaps = false;
  return t;
}

export function createAirportAct(host: HTMLElement, mode: 'journey' | 'finale', desktop: boolean): Act {
  const state: AirportPlate = airport[mode];
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const tA = plateTexture(), tB = plateTexture();
  let shownA = -1, shownB = -1, videoA: HTMLVideoElement | null = null, videoB: HTMLVideoElement | null = null;

  const uniforms = {
    uA: { value: tA }, uB: { value: tB },
    uASize: { value: new Vector2(16, 9) }, uBSize: { value: new Vector2(16, 9) },
    uAMatch: { value: new Vector4(...MATCH[0]) }, uBMatch: { value: new Vector4(...MATCH[1]) },
    uMix: { value: 0 }, uWipe: { value: 0 }, uExit: { value: 0 },
    uSide: { value: airport.side }, uCompact: { value: 0 },
    uPointer: { value: new Vector2(0, 0) },
    uRes: { value: new Vector2(1, 1) },
    uTime: { value: 0 },
    uBg: { value: token('--color-bg', host) },
    uSky: { value: token('--color-accent', host) },
    uInk: { value: token('--color-ink', host) },
  };
  const material = new ShaderMaterial({
    uniforms, vertexShader: vertex, fragmentShader: fragment,
    defines: mode === 'finale' ? { FINALE: 1 } : {},
    depthTest: false, depthWrite: false,
  });
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const pointer = uniforms.uPointer.value;
  const xTo = gsap.quickTo(pointer, 'x', { duration: 1.4, ease: 'power3.out' });
  const yTo = gsap.quickTo(pointer, 'y', { duration: 1.4, ease: 'power3.out' });

  /** upload the video's current frame (a GPU copy in the browser) — only once it has one (HAVE_CURRENT_DATA): before
   *  that the upload is empty (Firefox: "uploading zeros"); the caller retries on the next tick */
  const upload = (t: Texture, video: HTMLVideoElement, size: Vector2) => {
    if (video.readyState < 2) return false;
    t.image = video;
    t.needsUpdate = true;
    size.set(video.videoWidth || 16, video.videoHeight || 9);
    return true;
  };

  return {
    host,
    scene,
    camera,
    ratio: { max: 2, min: 1 },
    ready: () => !!state.a && shownA >= 0,
    update(time) {
      uniforms.uTime.value = time;
      if (desktop && mode === 'finale') { xTo(airport.pointer.x); yTo(airport.pointer.y); }
      if (state.a && (state.aId !== shownA || state.a !== videoA)) {
        if (upload(tA, state.a, uniforms.uASize.value)) { shownA = state.aId; videoA = state.a; }
      }
      if (state.b && state.mix > 0 && (state.bId !== shownB || state.b !== videoB)) {
        if (upload(tB, state.b, uniforms.uBSize.value)) { shownB = state.bId; videoB = state.b; }
      }
      uniforms.uAMatch.value.set(...(MATCH[state.aChapter] ?? MATCH[0]));
      uniforms.uBMatch.value.set(...(MATCH[state.bChapter] ?? MATCH[0]));
      uniforms.uMix.value = state.b && shownB >= 0 ? state.mix : 0;
      uniforms.uWipe.value = state.wipe;
      uniforms.uExit.value = state.exit;
      uniforms.uSide.value = airport.side;
    },
    resize(width, height) {
      uniforms.uRes.value.set(width, height);
      uniforms.uCompact.value = width < height ? 1 : 0;
    },
    dispose() {
      gsap.killTweensOf(pointer);
      mesh.geometry.dispose();
      material.dispose();
      tA.dispose();
      tB.dispose();                                       // the videos belong to the reel
    },
  };
}

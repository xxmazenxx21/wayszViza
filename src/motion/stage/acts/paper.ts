/**
 * Act "paper" — WaysZ Visa Home, «رحلة الورق» / "The Paper Journey" (docs/home-creative-treatment.md).
 * A pop-up book in the night: a travel booklet (navy cover, the WaysZ mark debossed with sky-blue foil) among
 * drifting paper flakes. It opens, lies down, and every spread pops up a paper diorama.
 *
 *   journey  host `.paper__stage` behind hero → §1.1 → §1.2–1.5 (bridge.paper.shot · fix · turn · act)
 *   finale   host `.pcta__stage` in §1.8: the booklet returns closed, a ribbon slides out (ribbon), the DOM seal
 *            «ملف جاهز» lands and the booklet bounces once (seal)
 *
 * BUDGET (lighter than WaysZ's theatre on purpose): planes only — the cover hinge, the page curl and every pop-up
 * hinge / slide / swing / spin run in the vertex shader; one merged geometry (= one draw call, shadows included)
 * per diorama; 480 instanced flakes; ONE canvas atlas (2048²) drawn at runtime from our own vector drawings; fake
 * light; no shadow maps, render targets, MSAA targets, bloom, models or HDRI; one overlay quad for grain + vignette.
 * ~12 draw calls per frame. The shared canvas has no depth buffer: everything is transparent, ordered by
 * renderOrder (parts) and by merge order (pieces, back to front).
 * Art is never mirrored: in RTL the layout mirrors (hinge on the right, pages turn the other way), the drawings don't.
 * Decorative only: every word lives in the DOM.
 */
import {
  BufferAttribute, BufferGeometry, CanvasTexture, Color, DoubleSide, Group, InstancedBufferAttribute,
  InstancedBufferGeometry, LinearFilter, LinearMipmapLinearFilter, Mesh, PerspectiveCamera, PlaneGeometry, Scene,
  ShaderMaterial, Vector2, Vector3, type IUniform,
} from 'three';
import type { Act } from '../stage';
import { paper } from '../bridge';
import {
  bgFragment, bgVertex, finishFragment, finishVertex, flakeFragment, flakeVertex, pageFragment, pageVertex,
  popFragment, popVertex,
} from '../shaders/paper.glsl';
import { token } from './util';
import markSvg from '../../../assets/logo/waysz-mark.svg?raw';

const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ramp = (v: number, a: number, b: number) => smooth(clamp((v - a) / (b - a)));

// ---------- the booklet (world units; the spread is x −1…1, y −0.71…0.71) ----------
const W = 1;            // page width
const H = 1.42;         // page height
const T = 0.05;         // thickness of the page block
const PX = 500;         // atlas pixels per world unit
const SIZE = 2048;      // atlas side

// ---------- colours (semantic tokens only) ----------
type Palette = Record<'paper' | 'paperDark' | 'ink' | 'muted' | 'navy' | 'night' | 'low' | 'accent' | 'accentInk' | 'accentSoft', Color>;
function palette(host: HTMLElement): Palette {
  const light = document.documentElement;
  return {
    paper: token('--color-surface', light, ['--color-bg', 78]),
    paperDark: token('--color-bg-alt', light),
    ink: token('--color-ink', light),
    muted: token('--color-ink-muted', light),
    navy: token('--color-brand', light),
    night: token('--color-bg', host),
    low: token('--color-bg', host, ['--color-accent', 88]),
    accent: token('--color-accent', light),
    accentInk: token('--color-accent-ink', light),
    accentSoft: token('--color-accent', light, ['--color-surface', 34]),
  };
}
const css = (c: Color, a = 1) => `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;

// ---------- the atlas: our own vector drawings, painted once per page ----------
type Rect = [number, number, number, number];                     // u0 v0 u1 v1 (v up, like the texture)
type Draw = (w: number, h: number) => void;   // draws into the atlas context, cell origin at its top-left
interface Atlas { texture: CanvasTexture; rect: Record<string, Rect>; size: Record<string, [number, number]>; users: number }
let atlasPromise: Promise<Atlas> | null = null;

async function loadMark(): Promise<HTMLImageElement> {
  const svg = markSvg.replace(/<!--[\s\S]*?-->/g, '').replace(/var\(--logo-(mark|plane), currentColor\)/g, 'white');
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const img = new Image();
  img.src = url;
  try { await img.decode(); } finally { URL.revokeObjectURL(url); }
  return img;
}

function buildAtlas(C: Palette, mark: HTMLImageElement): Atlas {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const g = canvas.getContext('2d')!;
  const lw = (w: number) => Math.max(1.4, w * 0.011);
  const ink = (a: number) => css(C.ink, a);
  const rr = (x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  const line = (x0: number, y0: number, x1: number, y1: number) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  const bars = (x: number, y: number, w: number, h: number, n: number, gap: number, a = 0.16) => {
    g.fillStyle = ink(a);
    for (let i = 0; i < n; i++) { rr(x, y + i * gap, w * (i === n - 1 ? 0.62 : 0.92 - (i % 3) * 0.08), h, h / 2); g.fill(); }
  };
  const sheet = (x: number, y: number, w: number, h: number, path?: () => void) => {
    const grad = g.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, css(C.paper)); grad.addColorStop(1, css(C.paper.clone().lerp(C.paperDark, 0.55)));
    g.fillStyle = grad;
    if (path) path(); else { rr(x, y, w, h, Math.min(w, h) * 0.025); }
    g.fill();
    g.strokeStyle = ink(0.16); g.lineWidth = lw(w); g.stroke();
  };
  const markAt = (cx: number, cy: number, mw: number, color: string) => {
    const mh = mw * (535 / 752);
    const tmp = document.createElement('canvas');
    tmp.width = Math.ceil(mw); tmp.height = Math.ceil(mh);
    const t = tmp.getContext('2d')!;
    t.drawImage(mark, 0, 0, mw, mh);
    t.globalCompositeOperation = 'source-in'; t.fillStyle = color; t.fillRect(0, 0, mw, mh);
    g.drawImage(tmp, cx - mw / 2, cy - mh / 2);
  };
  const check = (cx: number, cy: number, r: number) => {
    g.fillStyle = css(C.accent); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = css(C.paper); g.lineWidth = r * 0.24; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(cx - r * 0.42, cy + r * 0.02); g.lineTo(cx - r * 0.1, cy + r * 0.34); g.lineTo(cx + r * 0.46, cy - r * 0.3); g.stroke();
  };
  const blurred = (fn: () => void, r: number) => {           // a soft blur that works in every browser (no ctx.filter)
    const n = 14;
    g.save(); g.globalAlpha = 1 / 4;
    for (let i = 0; i < n; i++) { g.save(); g.translate(Math.cos(i * 2.4) * r * (i / n), Math.sin(i * 2.4) * r * (i / n)); fn(); g.restore(); }
    g.restore();
  };

  // name: [world w, world h, drawing]
  const items: Record<string, [number, number, Draw]> = {
    // --- the booklet ---
    cover: [W, H, (w, h) => {
      const grad = g.createLinearGradient(0, 0, w * 0.4, h);
      grad.addColorStop(0, css(C.navy.clone().lerp(C.accent, 0.12))); grad.addColorStop(0.55, css(C.navy)); grad.addColorStop(1, css(C.night));
      g.fillStyle = grad; g.fillRect(0, 0, w, h);
      g.strokeStyle = css(C.navy.clone().lerp(C.paper, 0.1)); g.lineWidth = 2;
      g.strokeRect(w * 0.07, w * 0.07, w * 0.86, h - w * 0.14);
      for (let i = 0; i < 240; i++) {                          // the grain of the cloth
        g.strokeStyle = css(i % 2 ? C.paper : C.ink, 0.011);
        const y = (i * 37) % h; line(0, y, w, y + ((i * 13) % 9) - 4);
      }
    }],
    foil: [W, H, (w, h) => {
      g.fillStyle = 'black'; g.fillRect(0, 0, w, h);
      markAt(w / 2, h * 0.44, w * 0.5, 'white');
      g.strokeStyle = 'white'; g.lineWidth = 2.2;
      g.strokeRect(w * 0.095, w * 0.095, w * 0.81, h - w * 0.19);
      g.lineWidth = 1.6; line(w * 0.38, h * 0.68, w * 0.62, h * 0.68);
    }],
    page: [W, H, (w, h) => {
      g.fillStyle = css(C.paper); g.fillRect(0, 0, w, h);
      for (let i = 0; i < 34; i++) {                           // a generic wave pattern (not any country's design)
        g.strokeStyle = css(i % 3 ? C.accentInk : C.muted, 0.055); g.lineWidth = 1.2;
        g.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y = (i / 33) * h + Math.sin(x * 0.018 + i * 0.55) * 14 + Math.sin(x * 0.006 - i * 0.3) * 22;
          if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      }
      markAt(w / 2, h * 0.5, w * 0.46, css(C.accentInk, 0.07));
      g.strokeStyle = ink(0.08); g.lineWidth = 1.5; g.strokeRect(w * 0.06, w * 0.06, w * 0.88, h - w * 0.12);
    }],
    edgeV: [T, H, (w, h) => {
      g.fillStyle = css(C.paperDark); g.fillRect(0, 0, w, h);
      g.strokeStyle = ink(0.1); g.lineWidth = 1;
      for (let x = 1; x < w; x += 2.2) line(x, 0, x, h);
    }],
    edgeH: [W, T, (w, h) => {
      g.fillStyle = css(C.paperDark); g.fillRect(0, 0, w, h);
      g.strokeStyle = ink(0.1); g.lineWidth = 1;
      for (let y = 1; y < h; y += 2.2) line(0, y, w, y);
    }],
    ribbon: [0.055, 0.5, (w, h) => {
      g.fillStyle = 'white';
      g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(w / 2, h - w * 0.7); g.lineTo(0, h); g.closePath(); g.fill();
    }],

    // --- §1.1 the three problems, fixed ---
    doc: [0.36, 0.46, (w, h) => {
      const cw = w * 0.36, ch = h * 0.28;
      sheet(0, 0, w, h, () => { g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h - ch); g.lineTo(w - cw, h - ch); g.lineTo(w - cw, h); g.lineTo(0, h); g.closePath(); });
      g.fillStyle = css(C.accentSoft); rr(w * 0.1, h * 0.08, w * 0.5, h * 0.07, 4); g.fill();
      bars(w * 0.1, h * 0.24, w * 0.8, h * 0.028, 6, h * 0.075);
      g.setLineDash([6, 6]); g.strokeStyle = ink(0.32); g.lineWidth = lw(w); g.strokeRect(w - cw + 3, h - ch + 3, cw - 6, ch - 6); g.setLineDash([]);
    }],
    docPiece: [0.13, 0.13, (w, h) => {
      sheet(0, 0, w, h);
      bars(w * 0.14, h * 0.24, w * 0.7, h * 0.08, 3, h * 0.2);
    }],
    form: [0.38, 0.48, (w, h) => {
      sheet(0, 0, w, h);
      g.fillStyle = css(C.accentSoft); g.fillRect(0, 0, w, h * 0.11);
      for (let i = 0; i < 4; i++) {
        const y = h * (0.2 + i * 0.19);
        g.fillStyle = ink(0.2); rr(w * 0.1, y, w * 0.3, h * 0.025, 3); g.fill();
        if (i === 2) { g.setLineDash([6, 6]); g.strokeStyle = ink(0.32); } else { g.setLineDash([]); g.strokeStyle = ink(0.2); }
        g.lineWidth = lw(w); rr(w * 0.1, y + h * 0.045, w * 0.8, h * 0.075, 4); g.stroke();
      }
      g.setLineDash([]);
    }],
    formField: [0.304, 0.036, (w, h) => {
      g.fillStyle = css(C.paper); rr(1, 1, w - 2, h - 2, 4); g.fill();
      g.strokeStyle = css(C.accentInk, 0.7); g.lineWidth = 2; g.stroke();
      g.fillStyle = css(C.accent); g.fillRect(2, 2, w * 0.035, h - 4);
      g.fillStyle = ink(0.35); rr(w * 0.08, h * 0.38, w * 0.46, h * 0.24, 3); g.fill();
    }],
    signPole: [0.05, 0.6, (w, h) => {
      g.fillStyle = css(C.paperDark); g.strokeStyle = ink(0.22); g.lineWidth = 2;
      rr(w * 0.3, 0, w * 0.4, h * 0.97, 4); g.fill(); g.stroke();
      rr(0, h * 0.94, w, h * 0.06, 3); g.fill(); g.stroke();
    }],
    signBlur: [0.36, 0.16, (w, h) => {
      blurred(() => {
        g.fillStyle = css(C.paperDark.clone().lerp(C.muted, 0.2)); rr(w * 0.06, h * 0.12, w * 0.88, h * 0.76, 10); g.fill();
        g.fillStyle = ink(0.3); rr(w * 0.2, h * 0.4, w * 0.4, h * 0.12, 6); g.fill();
        g.beginPath(); g.moveTo(w * 0.68, h * 0.3); g.lineTo(w * 0.82, h * 0.5); g.lineTo(w * 0.68, h * 0.7); g.fill();
      }, w * 0.05);
    }],
    signClear: [0.36, 0.16, (w, h) => {
      g.fillStyle = css(C.paper); g.strokeStyle = css(C.accentInk, 0.6); g.lineWidth = 3;
      rr(w * 0.06, h * 0.12, w * 0.88, h * 0.76, 10); g.fill(); g.stroke();
      g.strokeStyle = css(C.accent); g.lineWidth = h * 0.13; g.lineCap = 'round'; g.lineJoin = 'round';
      line(w * 0.5, h * 0.74, w * 0.5, h * 0.3);
      g.beginPath(); g.moveTo(w * 0.4, h * 0.42); g.lineTo(w * 0.5, h * 0.28); g.lineTo(w * 0.6, h * 0.42); g.stroke();
    }],
    check: [0.08, 0.08, (w) => check(w / 2, w / 2, w * 0.42)],

    // --- §1.2 consultation ---
    roads: [1.1, 0.62, (w, h) => {
      const road = (x1: number, y1: number, c: string, dash: string) => {
        g.lineCap = 'round';
        g.strokeStyle = ink(0.16); g.lineWidth = h * 0.13; g.beginPath(); g.moveTo(w * 0.5, h); g.bezierCurveTo(w * 0.5, h * 0.66, x1, h * 0.5, x1, y1); g.stroke();
        g.strokeStyle = c; g.lineWidth = h * 0.11; g.stroke();
        g.setLineDash([h * 0.03, h * 0.04]); g.strokeStyle = dash; g.lineWidth = h * 0.012; g.stroke(); g.setLineDash([]);
      };
      road(w * 0.16, h * 0.08, css(C.paper), ink(0.25));
      road(w * 0.84, h * 0.1, css(C.paper), ink(0.25));
      road(w * 0.5, h * 0.04, css(C.paper), ink(0.25));
    }],
    roadLit: [1.1, 0.62, (w, h) => {
      g.lineCap = 'round';
      const glow = g.createLinearGradient(0, h, 0, 0); glow.addColorStop(0, css(C.accent, 0.0)); glow.addColorStop(1, css(C.accent, 0.35));
      g.strokeStyle = glow; g.lineWidth = h * 0.26; g.beginPath(); g.moveTo(w * 0.5, h); g.lineTo(w * 0.5, h * 0.04); g.stroke();
      g.strokeStyle = css(C.accent); g.lineWidth = h * 0.11; g.stroke();
      g.setLineDash([h * 0.03, h * 0.04]); g.strokeStyle = css(C.paper); g.lineWidth = h * 0.014; g.stroke(); g.setLineDash([]);
    }],
    table: [0.56, 0.3, (w, h) => {
      g.fillStyle = css(C.paper); g.strokeStyle = ink(0.22); g.lineWidth = lw(w);
      rr(w * 0.02, h * 0.18, w * 0.96, h * 0.12, 4); g.fill(); g.stroke();
      for (const x of [0.1, 0.84]) { rr(w * x, h * 0.3, w * 0.06, h * 0.7, 3); g.fill(); g.stroke(); }
      g.fillStyle = css(C.paperDark); rr(w * 0.08, h * 0.3, w * 0.84, h * 0.05, 2); g.fill();
      sheet(w * 0.3, h * 0.1, w * 0.22, h * 0.08);                 // papers on the table
      g.fillStyle = css(C.accentSoft); g.strokeStyle = ink(0.22); rr(w * 0.64, h * 0.02, w * 0.07, h * 0.16, 4); g.fill(); g.stroke();
    }],
    chair: [0.2, 0.32, (w, h) => {
      g.fillStyle = css(C.paper); g.strokeStyle = ink(0.24); g.lineWidth = lw(w) * 1.4;
      g.beginPath(); g.moveTo(w * 0.12, h * 0.02); g.lineTo(w * 0.26, h * 0.02); g.lineTo(w * 0.28, h * 0.54); g.lineTo(w * 0.9, h * 0.54);
      g.lineTo(w * 0.9, h * 0.64); g.lineTo(w * 0.24, h * 0.64); g.closePath(); g.fill(); g.stroke();
      for (const x of [0.2, 0.82]) { rr(w * x, h * 0.62, w * 0.07, h * 0.38, 3); g.fill(); g.stroke(); }
    }],
    lamp: [0.16, 0.44, (w, h) => {
      g.fillStyle = css(C.paper); g.strokeStyle = ink(0.24); g.lineWidth = lw(w) * 1.4;
      rr(w * 0.15, h * 0.94, w * 0.7, h * 0.06, 4); g.fill(); g.stroke();
      rr(w * 0.46, h * 0.28, w * 0.08, h * 0.68, 3); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(w * 0.24, h * 0.04); g.lineTo(w * 0.76, h * 0.04); g.lineTo(w * 0.96, h * 0.3); g.lineTo(w * 0.04, h * 0.3); g.closePath();
      g.fillStyle = css(C.accentSoft); g.fill(); g.stroke();
    }],
    lampGlow: [0.36, 0.32, (w, h) => {
      const r = g.createRadialGradient(w / 2, h * 0.08, 2, w / 2, h * 0.3, w * 0.62);
      r.addColorStop(0, css(C.accent, 0.62)); r.addColorStop(1, css(C.accent, 0));
      g.fillStyle = r; g.beginPath(); g.moveTo(w * 0.36, 0); g.lineTo(w * 0.64, 0); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
    }],

    // --- §1.3 document readiness ---
    sheet: [0.26, 0.34, (w, h) => {
      sheet(0, 0, w, h);
      g.fillStyle = css(C.accentSoft); rr(w * 0.12, h * 0.09, w * 0.42, h * 0.06, 3); g.fill();
      bars(w * 0.12, h * 0.25, w * 0.76, h * 0.03, 6, h * 0.1);
    }],
    folderBack: [0.5, 0.38, (w, h) => {
      g.fillStyle = css(C.accentSoft); g.strokeStyle = css(C.accentInk, 0.45); g.lineWidth = lw(w) * 1.4;
      g.beginPath(); g.moveTo(0, h * 0.12); g.lineTo(w * 0.3, h * 0.12); g.lineTo(w * 0.34, 0); g.lineTo(w * 0.56, 0); g.lineTo(w * 0.6, h * 0.12);
      g.lineTo(w, h * 0.12); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill(); g.stroke();
    }],
    folderFront: [0.5, 0.25, (w, h) => {
      const c = C.accentSoft.clone().lerp(C.accent, 0.18);
      g.fillStyle = css(c); g.strokeStyle = css(C.accentInk, 0.5); g.lineWidth = lw(w) * 1.4;
      rr(0, 0, w, h, 6); g.fill(); g.stroke();
      g.fillStyle = css(C.paper); rr(w * 0.34, h * 0.32, w * 0.32, h * 0.3, 4); g.fill();
      g.fillStyle = ink(0.2); rr(w * 0.38, h * 0.42, w * 0.24, h * 0.05, 2); g.fill(); rr(w * 0.38, h * 0.52, w * 0.16, h * 0.05, 2); g.fill();
    }],
    checklist: [0.24, 0.32, (w, h) => {
      sheet(0, 0, w, h);
      g.fillStyle = css(C.accentSoft); g.fillRect(0, 0, w, h * 0.12);
      for (let i = 0; i < 3; i++) {
        const y = h * (0.26 + i * 0.24);
        g.strokeStyle = ink(0.3); g.lineWidth = lw(w) * 1.3; rr(w * 0.12, y, h * 0.12, h * 0.12, 4); g.stroke();
        g.fillStyle = ink(0.18); rr(w * 0.38, y + h * 0.04, w * 0.48, h * 0.04, 2); g.fill();
      }
    }],

    // --- §1.4 application guidance ---
    formBig: [0.62, 0.78, (w, h) => {
      sheet(0, 0, w, h);
      g.fillStyle = css(C.accentSoft); g.fillRect(0, 0, w, h * 0.1);
      g.fillStyle = css(C.accentInk, 0.5); rr(w * 0.08, h * 0.035, w * 0.3, h * 0.03, 3); g.fill();
      for (let i = 0; i < 5; i++) {
        const y = h * (0.15 + i * 0.145);
        g.fillStyle = ink(0.22); rr(w * 0.08, y, w * 0.26, h * 0.018, 3); g.fill();
        g.strokeStyle = ink(0.22); g.lineWidth = lw(w); rr(w * 0.08, y + h * 0.03, w * 0.84, h * 0.06, 5); g.stroke();
      }
      g.strokeStyle = ink(0.3); line(w * 0.52, h * 0.95, w * 0.92, h * 0.95);
    }],
    fieldHi: [0.53, 0.05, (w, h) => {
      g.fillStyle = css(C.accent, 0.16); rr(1, 1, w - 2, h - 2, 6); g.fill();
      g.strokeStyle = css(C.accent, 0.95); g.lineWidth = 3; g.stroke();
      g.fillStyle = css(C.accentInk, 0.75); rr(w * 0.04, h * 0.36, w * 0.38, h * 0.28, 3); g.fill();
    }],
    pencil: [0.36, 0.05, (w, h) => {
      g.fillStyle = css(C.paperDark); g.strokeStyle = ink(0.3); g.lineWidth = 2;
      rr(0, h * 0.18, w * 0.12, h * 0.64, 3); g.fill(); g.stroke();
      g.fillStyle = css(C.accent); g.fillRect(w * 0.12, h * 0.18, w * 0.66, h * 0.64); g.strokeRect(w * 0.12, h * 0.18, w * 0.66, h * 0.64);
      g.fillStyle = css(C.paper); g.beginPath(); g.moveTo(w * 0.78, h * 0.18); g.lineTo(w * 0.97, h * 0.5); g.lineTo(w * 0.78, h * 0.82); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = ink(0.8); g.beginPath(); g.moveTo(w * 0.92, h * 0.4); g.lineTo(w, h * 0.5); g.lineTo(w * 0.92, h * 0.6); g.closePath(); g.fill();
    }],

    // --- §1.5 appointment preparation ---
    calendar: [0.36, 0.4, (w, h) => {
      sheet(0, h * 0.06, w, h * 0.94);
      g.fillStyle = css(C.accentSoft); g.fillRect(1, h * 0.06, w - 2, h * 0.16);
      g.strokeStyle = ink(0.45); g.lineWidth = lw(w) * 2; g.lineCap = 'round';
      line(w * 0.3, 0, w * 0.3, h * 0.12); line(w * 0.7, 0, w * 0.7, h * 0.12);
      g.fillStyle = ink(0.16);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { rr(w * (0.1 + c * 0.17), h * (0.32 + r * 0.155), w * 0.12, h * 0.09, 4); g.fill(); }
    }],
    ring: [0.08, 0.08, (w) => {
      g.strokeStyle = css(C.accent); g.lineWidth = w * 0.11; g.beginPath(); g.arc(w / 2, w / 2, w * 0.38, 0, Math.PI * 2); g.stroke();
    }],
    clock: [0.26, 0.34, (w, h) => {
      const cx = w / 2, cy = h * 0.38, r = w * 0.44;
      g.fillStyle = css(C.paper); g.strokeStyle = ink(0.26); g.lineWidth = lw(w) * 1.5;
      for (const x of [0.3, 0.64]) { rr(w * x, cy + r * 0.7, w * 0.06, h - (cy + r * 0.7), 3); g.fill(); g.stroke(); }
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); g.stroke();
      g.strokeStyle = css(C.accentInk, 0.6); g.lineWidth = lw(w) * 2.2; g.beginPath(); g.arc(cx, cy, r * 0.9, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = ink(0.4); g.lineWidth = lw(w) * 1.2;
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; line(cx + Math.cos(a) * r * 0.68, cy + Math.sin(a) * r * 0.68, cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78); }
      g.fillStyle = css(C.accent); g.beginPath(); g.arc(cx, cy, r * 0.07, 0, Math.PI * 2); g.fill();
    }],
    hand: [0.016, 0.1, (w, h) => { g.fillStyle = ink(0.75); rr(0, 0, w, h, w / 2); g.fill(); }],
    room: [0.34, 0.42, (w, h) => {
      const grad = g.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, css(C.paperDark)); grad.addColorStop(1, css(C.paper));
      g.fillStyle = grad; g.fillRect(0, 0, w, h);
      const win = g.createLinearGradient(0, h * 0.1, 0, h * 0.6); win.addColorStop(0, css(C.accentSoft)); win.addColorStop(1, css(C.paper));
      g.fillStyle = win; rr(w * 0.22, h * 0.12, w * 0.56, h * 0.44, 8); g.fill();
      g.strokeStyle = ink(0.16); g.lineWidth = 2; g.stroke(); line(w * 0.5, h * 0.12, w * 0.5, h * 0.56);
      const beam = g.createLinearGradient(0, h * 0.56, 0, h); beam.addColorStop(0, css(C.accent, 0.2)); beam.addColorStop(1, css(C.accent, 0));
      g.fillStyle = beam; g.beginPath(); g.moveTo(w * 0.22, h * 0.56); g.lineTo(w * 0.78, h * 0.56); g.lineTo(w * 0.95, h); g.lineTo(w * 0.05, h); g.closePath(); g.fill();
      g.fillStyle = ink(0.2);                                       // a plant and a chair, calm
      g.beginPath(); g.ellipse(w * 0.12, h * 0.7, w * 0.07, h * 0.12, -0.3, 0, Math.PI * 2); g.fill();
      rr(w * 0.08, h * 0.8, w * 0.1, h * 0.12, 3); g.fill();
      rr(w * 0.7, h * 0.72, w * 0.2, h * 0.05, 3); g.fill(); rr(w * 0.86, h * 0.56, w * 0.04, h * 0.36, 2); g.fill();
      g.strokeStyle = ink(0.12); line(0, h * 0.92, w, h * 0.92);
    }],
    arch: [0.42, 0.56, (w, h) => {
      const ow = w * 0.72, oh = h * 0.78, ox = (w - ow) / 2, oy = h - oh;
      g.fillStyle = css(C.paper); g.strokeStyle = ink(0.24); g.lineWidth = lw(w) * 1.4;
      g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.3); g.arc(w / 2, h * 0.3, w / 2, Math.PI, 0); g.lineTo(w, h); g.closePath(); g.fill(); g.stroke();
      g.save(); g.globalCompositeOperation = 'destination-out';
      g.beginPath(); g.moveTo(ox, h); g.lineTo(ox, oy + ow / 2); g.arc(w / 2, oy + ow / 2, ow / 2, Math.PI, 0); g.lineTo(ox + ow, h); g.closePath(); g.fill();
      g.restore();
      g.beginPath(); g.moveTo(ox, h); g.lineTo(ox, oy + ow / 2); g.arc(w / 2, oy + ow / 2, ow / 2, Math.PI, 0); g.lineTo(ox + ow, h); g.stroke();
      g.fillStyle = css(C.accentSoft); rr(w / 2 - w * 0.05, h * 0.02, w * 0.1, h * 0.06, 3); g.fill();
    }],
    door: [0.3, 0.43, (w, h) => {
      g.fillStyle = css(C.paperDark); g.strokeStyle = ink(0.26); g.lineWidth = lw(w) * 1.4;
      g.beginPath(); g.moveTo(0, h); g.lineTo(0, w / 2); g.arc(w / 2, w / 2, w / 2, Math.PI, 0); g.lineTo(w, h); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = ink(0.14);
      rr(w * 0.16, w * 0.5, w * 0.68, h * 0.3, 6); g.stroke(); rr(w * 0.16, h * 0.62, w * 0.68, h * 0.3, 6); g.stroke();
      g.fillStyle = css(C.accent); g.beginPath(); g.arc(w * 0.82, h * 0.58, w * 0.04, 0, Math.PI * 2); g.fill();
    }],
  };

  // shelf packing, tallest first, with padding against mip bleeding
  const PAD = 6;
  const order = Object.keys(items).sort((a, b) => items[b][1] - items[a][1]);
  const rect: Atlas['rect'] = {}, size: Atlas['size'] = {};
  let x = PAD, y = PAD, rowH = 0;
  for (const name of order) {
    const [ww, hh, draw] = items[name];
    const pw = Math.ceil(ww * PX), ph = Math.ceil(hh * PX);
    if (x + pw + PAD > SIZE) { x = PAD; y += rowH + PAD * 2; rowH = 0; }
    if (y + ph + PAD > SIZE) throw new Error(`[paper] atlas full at ${name}`);
    g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, pw, ph); g.clip(); draw(pw, ph); g.restore();
    rect[name] = [x / SIZE, 1 - (y + ph) / SIZE, (x + pw) / SIZE, 1 - y / SIZE];
    size[name] = [ww, hh];
    x += pw + PAD * 2; rowH = Math.max(rowH, ph);
  }
  const texture = new CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  texture.anisotropy = 4;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  return { texture, rect, size, users: 0 };
}

// ---------- pop-up dioramas: one merged geometry each ----------
interface Piece {
  img: string; x: number; y: number; z?: number;
  yaw?: number; tilt?: number; lift?: number;
  w?: number; h?: number; ox?: number; oy?: number;
  rise?: [number, number]; act?: [number, number];
  motion?: 'travel' | 'swing' | 'spin'; from?: [number, number, number]; turns?: number;
  fade?: 'in' | 'out' | 'glow'; shadow?: boolean; flip?: boolean;
  local?: boolean;       // travel `from` is measured in the piece's own plane: never mirrored in RTL
}
const UP = Math.PI / 2;

const POP = 1.3;          // pop-up pieces stand 30% larger than their drawing; flat ones lie on the page at size

function buildDiorama(pieces: Piece[], atlas: Atlas, side: number) {
  const ordered = pieces.map((p, i) => ({ p, i })).sort((a, b) => (b.p.y - a.p.y) || (a.i - b.i)).map((o) => o.p);
  const cols: Record<string, number[]> = { position: [], uv: [], aBase: [], aOrient: [], aWin: [], aFrom: [], aMode: [] };
  const index: number[] = [];
  const quad = (p: Piece, kind: 0 | 1) => {
    const [aw, ah] = atlas.size[p.img];
    const k = (p.tilt ?? UP) > 0.01 ? POP : 1;
    const w = (p.w ?? aw) * k, h = (p.h ?? ah) * k, ox = (p.ox ?? 0) * k, oy = (p.oy ?? 0) * k;
    let [u0, v0, u1, v1] = atlas.rect[p.img];
    if (p.flip) [u0, u1] = [u1, u0];
    const motion = { travel: 1, swing: 2, spin: 3 }[p.motion ?? 'travel'] * (p.motion ? 1 : 0);
    const fade = { in: 1, out: 2, glow: 3 }[p.fade ?? 'in'] * (p.fade ? 1 : 0);
    const from = (p.from ?? [0, 0, 0]).map((v) => (p.motion === 'travel' && !p.local ? v : v * k)) as [number, number, number];
    const fx = p.motion === 'travel' && !p.local ? from[0] * side : from[0];
    const base = cols.position.length / 3;
    const corners: [number, number, number, number][] = [[ox - w / 2, oy, u0, v0], [ox + w / 2, oy, u1, v0], [ox + w / 2, oy + h, u1, v1], [ox - w / 2, oy + h, u0, v1]];
    for (const [cx, cy, u, v] of corners) {
      cols.position.push(cx, cy, kind);
      cols.uv.push(u, v);
      cols.aBase.push(p.x * side, p.y, p.z ?? 0);
      cols.aOrient.push((p.yaw ?? 0) * side, p.tilt ?? UP, (p.lift ?? 0) * k, p.turns ?? 1);
      cols.aWin.push(...(p.rise ?? [0, 1]), ...(p.act ?? [0, 1]));
      cols.aFrom.push(fx, from[1], from[2]);
      cols.aMode.push(motion, fade, w, h);
    }
    index.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };
  // shadows first (under everything), then the pieces back to front
  for (const p of ordered) if (p.shadow ?? ((p.tilt ?? UP) > 0.3 && !p.oy && !p.fade && !p.lift)) quad(p, 1);
  for (const p of ordered) quad(p, 0);
  const geo = new BufferGeometry();
  const sizes: Record<string, number> = { position: 3, uv: 2, aBase: 3, aOrient: 4, aWin: 4, aFrom: 3, aMode: 4 };
  for (const k in cols) geo.setAttribute(k, new BufferAttribute(new Float32Array(cols[k]), sizes[k]));
  geo.setIndex(index);
  return geo;
}

// the five spreads (LTR layout; x is mirrored for RTL). Viewer at −y, far side +y.
const help = (): Piece[] => {
  const doc = { x: -0.6, y: 0.14, yaw: 0.22, tilt: 1.42, rise: [0.0, 0.55] as [number, number] };
  const form = { x: 0.0, y: 0.22, yaw: 0, tilt: 1.42, rise: [0.15, 0.7] as [number, number] };
  const sign = { x: 0.62, y: 0.08, yaw: -0.25, tilt: 1.5, rise: [0.3, 0.85] as [number, number] };
  return [
    { img: 'doc', ...doc },
    { img: 'docPiece', ...doc, ox: 0.115, oy: 0, lift: 0.004, motion: 'travel', from: [0.34, -0.36, 0.34], act: [0.02, 0.28], shadow: false },
    { img: 'check', ...doc, ox: 0.15, oy: 0.4, lift: 0.006, fade: 'in', act: [0.26, 0.33] },
    { img: 'form', ...form },
    { img: 'formField', ...form, ox: 0.0, oy: 0.48 * 0.3, lift: 0.004, motion: 'travel', from: [0.07, -0.04, 0.05], act: [0.36, 0.6], shadow: false },
    { img: 'check', ...form, ox: 0.16, oy: 0.42, lift: 0.006, fade: 'in', act: [0.6, 0.66] },
    { img: 'signPole', ...sign },
    { img: 'signBlur', ...sign, oy: 0.4, lift: 0.004, fade: 'out', act: [0.7, 0.9] },
    { img: 'signClear', ...sign, oy: 0.4, lift: 0.006, fade: 'in', act: [0.72, 0.93] },
    { img: 'check', ...sign, ox: 0.14, oy: 0.53, lift: 0.008, fade: 'in', act: [0.93, 1] },
  ];
};
const consultation = (): Piece[] => [
  { img: 'roads', x: -0.42, y: -0.32, tilt: 0, rise: [0, 0.4] },
  { img: 'roadLit', x: -0.42, y: -0.32, tilt: 0, lift: 0.002, fade: 'in', act: [0.35, 0.85] },
  { img: 'lamp', x: 0.7, y: 0.4, yaw: -0.3, rise: [0.1, 0.6] },
  { img: 'lampGlow', x: 0.7, y: 0.4, yaw: -0.3, oy: 0.12, lift: 0.01, fade: 'glow', act: [0.0, 0.3], w: 0.36, h: 0.32 },
  { img: 'chair', x: 0.75, y: 0.24, yaw: -1.1, flip: true, rise: [0.2, 0.7] },
  { img: 'table', x: 0.45, y: 0.16, yaw: -0.18, rise: [0.05, 0.6] },
  { img: 'chair', x: 0.18, y: 0.02, yaw: 0.6, rise: [0.25, 0.75] },
];
const readiness = (): Piece[] => {
  const folder = { x: 0.32, yaw: -0.15 };
  const sheets: Piece[] = [0, 1, 2, 3].map((i) => ({
    img: 'sheet', ...folder, y: 0.25 - i * 0.012, tilt: 1.2, oy: 0.03, lift: 0.004 + i * 0.004,
    motion: 'travel', from: [-1.1 + i * 0.15, -0.55 - i * 0.05, 0.62 + i * 0.08], act: [i * 0.13, i * 0.13 + 0.32], shadow: false,
  }));
  return [
    { img: 'folderBack', ...folder, y: 0.28, tilt: 1.28, rise: [0, 0.55] },
    ...sheets,
    { img: 'folderFront', ...folder, y: 0.2, tilt: 1.12, rise: [0.1, 0.65] },
    { img: 'checklist', x: -0.5, y: 0.02, yaw: 0.35, tilt: 1.45, rise: [0.2, 0.75] },
    ...[0, 1, 2].map((i): Piece => ({
      img: 'check', x: -0.5, y: 0.02, yaw: 0.35, tilt: 1.45, w: 0.05, h: 0.05, ox: -0.07, oy: 0.32 - (0.26 + i * 0.24) * 0.32 - 0.044,
      lift: 0.005, fade: 'in', act: [0.6 + i * 0.12, 0.68 + i * 0.12], rise: [0.2, 0.75],
    })),
  ];
};
const guidance = (): Piece[] => {
  const form = { x: 0.05, y: 0.18, yaw: 0, tilt: 1.32, rise: [0, 0.6] as [number, number] };
  const fields = [0, 1, 2, 3, 4].map((i): Piece => ({
    img: 'fieldHi', ...form, oy: 0.78 - (0.15 + i * 0.145 + 0.03 + 0.06) * 0.78 - 0.003, w: 0.53, h: 0.05,
    lift: 0.004, fade: 'in', act: [0.08 + i * 0.17, 0.2 + i * 0.17],
  }));
  // the pencil glides in the form's own plane: from its top-left field down to the last one
  const t = form.tilt, d: [number, number, number] = [0, Math.cos(t), Math.sin(t)];
  return [
    { img: 'formBig', ...form },
    ...fields,
    { img: 'pencil', ...form, ox: 0.16, oy: 0.08, lift: 0.012, motion: 'travel',
      from: [-0.34, d[1] * 0.5, d[2] * 0.5], act: [0.05, 0.95], shadow: false, local: true },
  ];
};
const appointment = (): Piece[] => {
  const arch = { x: 0.42, y: 0.32, yaw: -0.2, rise: [0.1, 0.65] as [number, number] };
  const clock = { x: -0.12, y: -0.06, yaw: 0.12, rise: [0.25, 0.8] as [number, number] };
  const pivot: [number, number, number] = [0, 0.34 - 0.38 * 0.34, 0];
  return [
    { img: 'room', ...arch, y: 0.36, w: 0.3, h: 0.4, rise: [0.05, 0.6] },
    { img: 'arch', ...arch },
    { img: 'door', ...arch, ox: -0.0, oy: 0, w: 0.302, h: 0.437, lift: 0.002, motion: 'swing', from: [-0.151, 0, 0], act: [0.25, 0.9], shadow: false },
    { img: 'calendar', x: -0.55, y: 0.2, yaw: 0.32, tilt: 1.42, rise: [0, 0.55] },
    { img: 'ring', x: -0.55, y: 0.2, yaw: 0.32, tilt: 1.42, w: 0.07, h: 0.07, ox: 0, oy: 0.4 - (0.32 + 2 * 0.155 + 0.045) * 0.4 - 0.035, lift: 0.005, fade: 'in', act: [0.0, 0.25], rise: [0, 0.55] },
    { img: 'clock', ...clock },
    { img: 'hand', ...clock, oy: pivot[1], w: 0.014, h: 0.085, lift: 0.004, motion: 'spin', from: pivot, turns: 1, act: [0, 1] },
    { img: 'hand', ...clock, oy: pivot[1], w: 0.018, h: 0.055, lift: 0.006, motion: 'spin', from: pivot, turns: 1 / 12, act: [0, 1] },
  ];
};

// ---------- camera: one node per moment (wide and compact screens) ----------
type Node = { p: [number, number, number]; t: [number, number, number]; shift: number; rise: number };
const N = (p: Node['p'], t: Node['t'], shift = 0, rise = 0): Node => ({ p, t, shift, rise });
const WIDE = {
  hero0: N([0, 0.02, 5.1], [0, 0, 0], 0.2),
  hero1: N([0, 4.0, 4.15], [0, -0.12, 0.08], 0.22),
  help: N([0, 3.9, 4.05], [0, -0.1, 0.06], 0.23),
  svc: N([0, 3.3, 4.65], [0, 0.12, 0.0], 0.23),
  finale: N([0, 0.05, 4.4], [0, 0, 0], 0.21),
};
// portrait screens see ~¼ of the camera distance across: the spread (2 wide) needs ~9 units, and the booklet
// holds the upper part of the screen above the text (rise)
const COMPACT: typeof WIDE = {
  hero0: N([0, 0.1, 7.8], [0, 0.1, 0], 0, 0.27),
  hero1: N([0, 6.9, 6.2], [0, -0.1, 0.1], 0, 0.23),
  help: N([0, 6.9, 6.1], [0, -0.1, 0.1], 0, 0.2),
  svc: N([0, 5.9, 7.2], [0, 0.15, 0.0], 0, 0.2),
  finale: N([0, 0.1, 6.6], [0, 0.05, 0], 0, 0.2),
};
const POSTER_WIDE = { hero: N([0, 0.02, 4.3], [0, 0, 0]), help: N([0, 2.5, 2.6], [0, -0.06, 0.06]), svc: N([0, 2.45, 3.2], [0, 0.2, 0]), finale: N([0, 0.05, 4.1], [0, -0.08, 0]) };
const POSTER_TALL = { hero: N([0, 0.06, 5.6], [0, 0.06, 0], 0, 0.2), help: N([0, 6.9, 6.1], [0, -0.1, 0.1], 0, 0.1), svc: N([0, 5.9, 7.2], [0, 0.15, 0], 0, 0.1), finale: N([0, 0.05, 6.6], [0, -0.05, 0], 0, 0.1) };

// ---------- the act ----------
export async function createPaperAct(host: HTMLElement, mode: 'journey' | 'finale'): Promise<Act> {
  const side = paper.side;
  const C = palette(host);
  atlasPromise ??= loadMark().then((m) => buildAtlas(C, m));
  const atlas = await atlasPromise;
  atlas.users++;
  const R = atlas.rect;
  const keep: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(x: T) => { keep.push(x); return x; };

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.05, 60);
  const light = new Vector3(-0.35, 0.75, 0.56).normalize();
  const time = { value: 0 };
  const shared = { uAtlas: { value: atlas.texture }, uLight: { value: light }, uAccent: { value: C.accent }, uPaper: { value: C.paper } };
  const blend = { transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false };

  // the night
  const quad = own(new PlaneGeometry(2, 2));
  const bgMat = own(new ShaderMaterial({
    vertexShader: bgVertex, fragmentShader: bgFragment, depthTest: false, depthWrite: false,
    uniforms: { uTop: { value: C.night.clone().multiplyScalar(0.8) }, uLow: { value: C.low }, uGlow: { value: C.accent.clone().multiplyScalar(0.3) },
      uGlowPos: { value: new Vector2(0.5, 0.5) }, uGlowAmt: { value: 1 }, uAspect: { value: 1 }, uDim: { value: 0 } },
  }));
  const bg = new Mesh(quad, bgMat); bg.frustumCulled = false; bg.renderOrder = -10; scene.add(bg);

  // the booklet rig: rig (bob, tilt, lay-down) → book (centring) → parts
  const rig = new Group(); scene.add(rig);
  const book = new Group(); rig.add(book);

  const pageMat = (front: Rect, back: Rect, opts: Partial<Record<string, unknown>> = {}) => own(new ShaderMaterial({
    vertexShader: pageVertex, fragmentShader: pageFragment, side: DoubleSide, ...blend,
    uniforms: {
      ...shared, uFront: { value: front }, uBack: { value: back }, uFoil: { value: [0, 0, 0, 0] },
      uMode: { value: 0 }, uTurn: { value: 0 }, uCurl: { value: 1.7 }, uSide: { value: side }, uW: { value: W }, uH: { value: H },
      uMirror: { value: 0 }, uTint: { value: new Color(1, 1, 1) }, uTintBack: { value: new Color(1, 1, 1) }, uAlpha: { value: 1 },
      uRim: { value: 0.18 }, uGutter: { value: 0 }, uFoilLight: { value: new Vector3(0, 0, 1) }, uFibre: { value: 0.06 },
      ...Object.fromEntries(Object.entries(opts).map(([k, v]) => [k, { value: v }])) as Record<string, IUniform>,
    },
  }));
  const plane = (w: number, h: number, sx = 1, sy = 1) => own(new PlaneGeometry(w, h, sx, sy));
  const gutter = side > 0 ? 1 : 2;
  const endTint = C.paper.clone().lerp(C.paperDark, 0.5).multiply(new Color(1 / Math.max(C.paper.r, 0.01), 1 / Math.max(C.paper.g, 0.01), 1 / Math.max(C.paper.b, 0.01)));

  const back = new Mesh(plane(W, H).translate(side * W / 2, 0, 0), pageMat(R.cover, R.cover, { uRim: 0.1 }));
  back.position.z = -T; back.renderOrder = 0;
  const fore = new Mesh(plane(T, H), pageMat(R.edgeV, R.edgeV, { uRim: 0.05, uFibre: 0 }));
  fore.rotation.y = side * UP; fore.position.set(side * W, 0, -T / 2); fore.renderOrder = 0;
  const foot = new Mesh(plane(W, T), pageMat(R.edgeH, R.edgeH, { uRim: 0.05, uFibre: 0 }));
  foot.rotation.x = UP; foot.position.set(side * W / 2, -H / 2, -T / 2); foot.renderOrder = 0;
  const right = new Mesh(plane(W, H).translate(side * W / 2, 0, 0), pageMat(R.page, R.page, { uGutter: gutter }));
  right.renderOrder = 1;
  const coverMat = pageMat(R.cover, R.page, { uFoil: R.foil, uRim: 0.32, uGutter: 0, uTintBack: endTint });
  const cover = new Mesh(plane(W, H).translate(side * W / 2, 0, 0), coverMat);
  const hinge = new Group(); hinge.position.z = 0.0035; hinge.add(cover);
  // the left half's thickness, faded in as the cover lands (an open pop-up book shows two boards)
  const leftFoot = new Mesh(plane(W, T), pageMat(R.edgeH, R.edgeH, { uRim: 0.05, uFibre: 0, uAlpha: 0 }));
  leftFoot.rotation.x = UP; leftFoot.position.set(-side * W / 2, -H / 2, -T / 2 + 0.0035); leftFoot.renderOrder = 0;
  const leftFore = new Mesh(plane(T, H), pageMat(R.edgeV, R.edgeV, { uRim: 0.05, uFibre: 0, uAlpha: 0 }));
  leftFore.rotation.y = -side * UP; leftFore.position.set(-side * W, 0, -T / 2 + 0.0035); leftFore.renderOrder = 0;
  book.add(back, fore, foot, leftFoot, leftFore, right, hinge);

  const turnMat = pageMat(R.page, R.page, { uMode: 1, uMirror: side < 0 ? 1 : 0, uGutter: 1, uTintBack: endTint });
  const turning = new Mesh(plane(1, 1, 28, 1).translate(0.5, 0, 0), turnMat);
  turning.position.z = 0.0015; turning.renderOrder = 2; turning.frustumCulled = false;
  book.add(turning);

  // pop-up dioramas (journey only)
  const dioramas: { mesh: Mesh; mat: ShaderMaterial }[] = [];
  if (mode === 'journey') {
    for (const make of [help, consultation, readiness, guidance, appointment]) {
      const mat = own(new ShaderMaterial({
        vertexShader: popVertex, fragmentShader: popFragment, side: DoubleSide, ...blend,
        uniforms: { ...shared, uShade: { value: C.night.clone().multiplyScalar(0.55) }, uRise: { value: 1 }, uAct: { value: 0 }, uFold: { value: 1 }, uShadow: { value: 0.42 } },
      }));
      const mesh = new Mesh(own(buildDiorama(make(), atlas, side)), mat);
      mesh.renderOrder = 3; mesh.frustumCulled = false; mesh.position.z = 0.002;
      book.add(mesh);
      dioramas.push({ mesh, mat });
    }
  }

  // the ribbon bookmark (finale only)
  const ribbonMat = pageMat(R.ribbon, R.ribbon, { uTint: C.accent, uTintBack: C.accent.clone().multiplyScalar(0.78), uRim: 0.35, uFibre: 0.12 });
  const ribbon = new Mesh(plane(0.055, 1).translate(0, -0.5, 0), ribbonMat);
  ribbon.position.set(side * W * 0.74, -H / 2 + 0.01, -T * 0.45); ribbon.renderOrder = 5; ribbon.visible = mode === 'finale';
  book.add(ribbon);

  // paper flakes: one instanced geometry, two meshes (behind the booklet · in front of the camera)
  const flakeGeo = (count: number, seed: number) => {
    const g = new InstancedBufferGeometry();
    const base = own(new PlaneGeometry(1, 1));
    g.index = base.index; g.setAttribute('position', base.getAttribute('position')); g.setAttribute('uv', base.getAttribute('uv'));
    let s = seed;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const home = new Float32Array(count * 3), sd = new Float32Array(count * 4);
    for (let i = 0; i < count * 3; i++) home[i] = rnd();
    for (let i = 0; i < count * 4; i++) sd[i] = rnd();
    g.setAttribute('aHome', new InstancedBufferAttribute(home, 3));
    g.setAttribute('aSeed', new InstancedBufferAttribute(sd, 4));
    g.instanceCount = count;
    return own(g);
  };
  const flakeMat = (min: Vector3, size: Vector3, alpha: number, scale: number, soft: number, near: number, far: number) => own(new ShaderMaterial({
    vertexShader: flakeVertex, fragmentShader: flakeFragment, side: DoubleSide, ...blend,
    uniforms: { ...shared, uTime: time, uBoxMin: { value: min }, uBoxSize: { value: size }, uScale: { value: scale }, uAlpha: { value: alpha },
      uSoft: { value: soft }, uFogNear: { value: near }, uFogFar: { value: far } },
  }));
  const behind = new Mesh(flakeGeo(380, 7), flakeMat(new Vector3(-4.2, -3.2, -4.6), new Vector3(8.4, 6.6, 4.1), 0.9, 1, 0.2, 6, 11));
  behind.renderOrder = -5; behind.frustumCulled = false; rig.add(behind);
  const camRig = new Group(); scene.add(camRig);
  const before = new Mesh(flakeGeo(100, 31), flakeMat(new Vector3(-1.7, -1.1, -2.6), new Vector3(3.4, 2.2, 1.7), 0.45, 0.8, 0.45, 2, 4));
  before.renderOrder = 8; before.frustumCulled = false; camRig.add(before);

  // finish: grain + vignette on top
  const finishMat = own(new ShaderMaterial({
    vertexShader: finishVertex, fragmentShader: finishFragment, ...blend,
    uniforms: { uTime: time, uAspect: { value: 1 }, uVig: { value: 0.62 }, uGrain: { value: 0.07 } },
  }));
  const finish = new Mesh(quad, finishMat); finish.frustumCulled = false; finish.renderOrder = 10; scene.add(finish);

  // ---------- state ----------
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  let width = 2, height = 2, aspect = 1, first = true;
  const camPos = new Vector3(), camAim = new Vector3();
  const goal = { p: new Vector3(), t: new Vector3(), shift: 0, rise: 0 };
  const cam = { shift: 0, rise: 0 };
  const a3 = new Vector3(), ndc = new Vector3();
  const take = (A: Node, B: Node, f: number) => {
    goal.p.set(...A.p).lerp(a3.set(...B.p), f); goal.t.set(...A.t).lerp(a3.set(...B.t), f);
    goal.shift = mix(A.shift, B.shift, f); goal.rise = mix(A.rise, B.rise, f);
  };
  let sealSeen = paper.seal, bounce = 0, bounceV = 0;

  const setDiorama = (i: number, rise: number, fold: number, act: number) => {
    const d = dioramas[i]; if (!d) return;
    d.mesh.visible = fold > 0.002;
    d.mat.uniforms.uRise.value = rise; d.mat.uniforms.uFold.value = fold; d.mat.uniforms.uAct.value = act;
  };

  const journey = (t: number, still: boolean) => {
    let s = paper.shot, fix = paper.fix, turn = paper.turn, act = paper.act;
    const P = paper.poster;
    if (P === 'hero') { s = 0; turn = 0; }
    else if (P === 'help') { s = 1.6; fix = 3; turn = 0; }
    else if (P && P[0] === 's') { s = 2.5; turn = Number(P[1]); act = 1; }
    const open = ramp(s, 0.4, 0.92), lay = ramp(s, 0.3, 1.05), riseHelp = ramp(s, 0.82, 1.24);
    const up = 1 - lay;
    rig.rotation.set(-UP * lay + up * (-pointer.sy * 0.2 + (still ? 0 : Math.sin(t * 0.5) * 0.03)), up * (pointer.sx * 0.3 + (still ? 0.12 * side : Math.sin(t * 0.37) * 0.07)), up * (still ? 0 : Math.sin(t * 0.29) * 0.025));
    rig.position.set(0, up * (still ? 0 : Math.sin(t * 0.6) * 0.04), 0);
    book.position.x = -side * W / 2 * (1 - open);
    hinge.rotation.y = -side * Math.PI * open;
    cover.renderOrder = open > 0.55 ? 1 : 4;
    const landed = ramp(open, 0.86, 1);
    (leftFoot.material as ShaderMaterial).uniforms.uAlpha.value = landed;
    (leftFore.material as ShaderMaterial).uniforms.uAlpha.value = landed;
    leftFoot.visible = leftFore.visible = landed > 0.001;

    // dioramas and page turns
    const tt = clamp(turn, 0, 4), k = Math.min(Math.floor(tt), 4), f = k >= 4 ? 0 : tt - k;
    dioramas.forEach((_, i) => setDiorama(i, 0, 0, 0));
    const curAct = k === 0 ? clamp(fix / 3) : (f > 0 ? 1 : act);
    const show = open > 0.6 ? 1 : 0;
    setDiorama(k, (k === 0 ? riseHelp : 1) * (1 - ramp(f, 0, 0.3)), show * (1 - ramp(f, 0.2, 0.32)) * (k === 0 ? (riseHelp > 0 ? 1 : 0) : 1), curAct);
    if (f > 0) setDiorama(k + 1, ramp(f, 0.62, 1), ramp(f, 0.6, 0.72), 0);
    const pageT = ramp(f, 0.12, 0.74);
    turning.visible = pageT > 0.001 && pageT < 0.999;
    turnMat.uniforms.uTurn.value = pageT;

    // camera
    const K = P ? (aspect < 0.8 ? POSTER_TALL : POSTER_WIDE) : (paper.compact || aspect < 0.8 ? COMPACT : WIDE);
    if (P) { const n = P === 'hero' ? (K as typeof POSTER_WIDE).hero : P === 'help' ? (K as typeof POSTER_WIDE).help : (K as typeof POSTER_WIDE).svc; take(n, n, 0); }
    else {
      const W2 = K as typeof WIDE;
      if (s < 1) take(W2.hero0, W2.hero1, ramp(s, 0.25, 1));
      else if (s < 2) take(W2.hero1, W2.help, ramp(s, 1, 1.4));
      else take(W2.help, W2.svc, ramp(s, 2, 2.15));
      if (s >= 2) goal.p.x += Math.sin(tt * 1.15) * 0.32 * side;          // a slow orbit from spread to spread
    }
  };

  const finale = (t: number, dt: number, still: boolean) => {
    book.position.x = -side * W / 2;
    hinge.rotation.y = 0; cover.renderOrder = 4;
    leftFoot.visible = leftFore.visible = false;
    if (paper.seal !== sealSeen) { sealSeen = paper.seal; bounceV = -0.9; }
    bounceV += (-bounce * 140 - bounceV * 9) * dt; bounce += bounceV * dt;
    rig.rotation.set(-pointer.sy * 0.18 + (still ? 0 : Math.sin(t * 0.5) * 0.03) - bounce * 0.6, side * -0.32 + pointer.sx * 0.28 + (still ? 0 : Math.sin(t * 0.37) * 0.05), still ? 0 : Math.sin(t * 0.29) * 0.02);
    rig.position.set(0, (still ? 0 : Math.sin(t * 0.6) * 0.035) + bounce * 0.12, 0);
    const r = paper.poster === 'finale' ? 0.72 : clamp(paper.ribbon);
    ribbon.visible = r > 0.01;
    ribbon.scale.y = 0.02 + r * 0.46;
    ribbon.rotation.z = still ? 0.04 : Math.sin(t * 0.8) * 0.06 * r;
    turning.visible = false;
    const K = paper.poster ? (aspect < 0.8 ? POSTER_TALL : POSTER_WIDE).finale : (paper.compact || aspect < 0.8 ? COMPACT : WIDE).finale;
    take(K, K, 0);
  };

  return {
    host, scene, camera,
    ready: () => true,
    update(t, deltaMs) {
      const dt = Math.min(deltaMs, 50) / 1000;
      const still = !!paper.poster;
      time.value = still ? 12.5 : t;
      const pk = 1 - Math.exp(-dt / 0.35);
      pointer.sx += ((still ? 0 : pointer.x) - pointer.sx) * pk; pointer.sy += ((still ? 0 : pointer.y) - pointer.sy) * pk;

      if (mode === 'journey') journey(t, still); else finale(t, dt, still);

      // the crane: eased toward the node, a breath of the pointer in it
      const k = first || still ? 1 : 1 - Math.exp(-dt / 0.42);
      first = false;
      camPos.lerp(goal.p, k); camAim.lerp(goal.t, k);
      cam.shift += (goal.shift - cam.shift) * k; cam.rise += (goal.rise - cam.rise) * k;
      camera.position.set(camPos.x + pointer.sx * 0.08, camPos.y + pointer.sy * 0.05, camPos.z);
      camera.lookAt(camAim);
      camera.aspect = aspect;
      camera.setViewOffset(width, height, -cam.shift * side * width, cam.rise * height, width, height);
      camera.updateMatrixWorld();
      camRig.position.copy(camera.position); camRig.quaternion.copy(camera.quaternion);

      // the accent light glows behind the booklet; the foil catches a light that follows the pointer
      rig.updateMatrixWorld();
      ndc.set(0, 0, 0).applyMatrix4(book.matrixWorld).project(camera);
      bgMat.uniforms.uGlowPos.value.set(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5);
      coverMat.uniforms.uFoilLight.value.set(-0.3 + pointer.sx * 0.9, 0.45 + pointer.sy * 0.7, 0.85).normalize();
    },
    resize(w, h) {
      width = Math.max(w, 2); height = Math.max(h, 2); aspect = width / height;
      bgMat.uniforms.uAspect.value = aspect; finishMat.uniforms.uAspect.value = aspect;
    },
    dispose() {
      window.removeEventListener('pointermove', onPointer);
      keep.forEach((d) => d.dispose());
      if (--atlas.users <= 0) { atlas.texture.dispose(); atlasPromise = null; }
    },
  };
}

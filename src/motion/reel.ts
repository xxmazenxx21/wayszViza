/**
 * Reel — the footage of the Visa Services page «رحلة في المطار» (docs/visa-services-creative-treatment.md).
 * Four chapters of REAL video, scrubbed by the scroll: public/media/video/airport-<chapter>.mp4 (1920×1080) ·
 * `-hd.mp4` (2560×1440, for screens that draw more than ~2200 px wide) · `-m.mp4` (816×1440 portrait crop for
 * phones). The same look everywhere at the right size, chosen once per page load. H.264 at 20 fps with a keyframe
 * every 12 frames, so a seek decodes at most a few frames and lands sharp.
 * - Each chapter is fetched whole as a Blob (then an object URL), so seeking never waits for the network. The scenes
 *   decide what may load: the hero after the first interaction, then one chapter ahead of the visitor.
 * - Scrubbing: `seek(c, progress)` stores a target; one seek is in flight at a time and the newest target wins (no
 *   queue). A new frame is announced by requestVideoFrameCallback (fallback: `seeked`), which bumps the chapter's
 *   frame id: the WebGL act uploads the <video> as a texture only then; the 2D canvas draws it.
 * One shared instance per page: the journey (scenes/airport-thread.ts) and the finale (scenes/airport-cta.ts).
 */
import { BP } from './config';

export const AIRPORT_FILES = ['approach', 'corridor', 'gates', 'takeoff'] as const;
const FPS = 20;
const HALF = 0.5 / FPS;

type FrameVideo = HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
interface Chapter {
  video: FrameVideo;
  url: string;
  state: 'idle' | 'loading' | 'ready';
  target: number;              // 0…1 wanted position
  seeking: boolean;
  id: number;                  // bumps whenever a new frame is on the video
}

export class Reel {
  readonly variant: '' | '-hd' | '-m';
  private chapters: Chapter[];
  private listeners = new Set<() => void>();
  private box: HTMLElement;

  constructor() {
    const small = matchMedia(BP.mobile).matches;
    const px = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
    this.variant = small ? '-m' : px > 2200 ? '-hd' : '';
    // the videos live in the document (some browsers only decode frames of videos that are in it), invisible
    this.box = document.createElement('div');
    this.box.setAttribute('aria-hidden', 'true');
    this.box.style.cssText = 'position:fixed;inset:0 auto auto 0;width:2px;height:2px;overflow:hidden;opacity:0;pointer-events:none';
    document.body.append(this.box);
    this.chapters = AIRPORT_FILES.map((name) => {
      const video: FrameVideo = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.disablePictureInPicture = true;
      return { video, url: `/media/video/airport-${name}${this.variant}.mp4`, state: 'idle', target: 0, seeking: false, id: 0 };
    });
  }

  /** a new frame is ready somewhere (repaint) */
  onFrame(fn: () => void) { this.listeners.add(fn); }

  /** fetch chapter `c` (once) */
  load(c: number) {
    const ch = this.chapters[c];
    if (!ch || ch.state !== 'idle') return;
    ch.state = 'loading';
    fetch(ch.url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((blob) => {
        const v = ch.video;
        v.addEventListener('loadeddata', () => {
          // three.js sizes a texture from an element's width / height attributes: give them the video's real size
          v.width = v.videoWidth;
          v.height = v.videoHeight;
          ch.state = 'ready';
          this.watch(ch);
          // iOS shows seeked frames only once the video has played (muted inline playback is always allowed)
          v.play().then(() => { v.pause(); this.seekNow(ch); }, () => this.seekNow(ch));
        }, { once: true });
        v.addEventListener('seeked', () => this.seeked(ch));
        v.src = URL.createObjectURL(blob);
        this.box.append(v);
      })
      .catch(() => { ch.state = 'idle'; /* the poster stays; the next chapter change tries again */ });
  }

  /** scrub chapter `c` to `progress` (0…1) */
  seek(c: number, progress: number) {
    const ch = this.chapters[c];
    if (!ch) return;
    ch.target = Math.min(Math.max(progress, 0), 1);
    if (ch.state === 'ready' && !ch.seeking) this.seekNow(ch);
  }

  /** the chapter's video and frame id once it shows a frame (null before) */
  get(c: number): { video: HTMLVideoElement; id: number } | null {
    const ch = this.chapters[c];
    return ch && ch.state === 'ready' && ch.id > 0 ? { video: ch.video, id: ch.id } : null;
  }

  private time(ch: Chapter) {
    return Math.max(0, ch.target * ((ch.video.duration || 0) - HALF));   // never past the last frame
  }

  private seekNow(ch: Chapter) {
    const t = this.time(ch);
    if (Math.abs(ch.video.currentTime - t) < HALF) { if (!ch.id) this.bump(ch); return; }
    ch.seeking = true;
    ch.video.currentTime = t;
  }

  private seeked(ch: Chapter) {
    ch.seeking = false;
    if (!ch.video.requestVideoFrameCallback) this.bump(ch);
    else { const before = ch.id; setTimeout(() => { if (ch.id === before) this.bump(ch); }, 80); }   // a missed callback
    if (Math.abs(ch.video.currentTime - this.time(ch)) >= HALF) this.seekNow(ch);   // the newest target wins
  }

  /** requestVideoFrameCallback fires when the seeked frame is presented: the moment to upload / draw it */
  private watch(ch: Chapter) {
    const v = ch.video;
    if (!v.requestVideoFrameCallback) return;
    const tick = () => { this.bump(ch); v.requestVideoFrameCallback!(tick); };
    v.requestVideoFrameCallback(tick);
  }

  private bump(ch: Chapter) {
    ch.id++;
    this.listeners.forEach((fn) => fn());
  }
}

let shared: Reel | null = null;
/** the page's one reel (created on first use) */
export const getAirportReel = () => (shared ??= new Reel());

/** 2D canvas (css tier, and until the WebGL stage draws): cover-fit a frame at full quality, never mirrored */
export function paintCover(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, alpha = 1) {
  const cw = ctx.canvas.width, chh = ctx.canvas.height;
  const vw = video.videoWidth, vh = video.videoHeight;
  if (!vw || !vh) return;
  const s = Math.max(cw / vw, chh / vh);
  const w = vw * s, h = vh * s;
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(video, (cw - w) / 2, (chh - h) / 2, w, h);
  ctx.globalAlpha = 1;
}

import { Injectable, NgZone, OnDestroy } from '@angular/core';

/**
 * ============================================================
 *  REVEAL ENGINE · efecto "DECRYPT / ENCRYPT" al hacer scroll
 * ============================================================
 *  - Todo lo marcado con la directiva `appReveal` empieza oculto ("cifrado").
 *  - Al entrar en pantalla se "descifra": un láser verde barre el bloque,
 *    deja una estela de código, los títulos se descifran letra a letra
 *    y aparecen esquinas tipo HUD.
 *  - Al salir de pantalla se vuelve a "cifrar", así que el efecto
 *    se repite al bajar y al subir.
 *  - Sabe hacia dónde haces scroll: al bajar el láser va de arriba abajo;
 *    al subir, de abajo arriba.
 *  - Un solo IntersectionObserver y un solo bucle de animación para toda la web
 *    (se ejecuta fuera de Angular para no gastar rendimiento).
 */

type Anchor = 'top' | 'bottom';

/** Textos que se "descifran" letra a letra (solo títulos cortos) */
const SCRAMBLE_SELECTOR = [
  '.section-title',
  '.eyebrow',
  '.hobbies__title',
  '.featured__title',
  '.pcard__title',
  '.skill__name',
  '.channel strong',
  '.certs__count strong',
  '.footer__nav a',
].join(',');

/** Caracteres para el descifrado (anchos parecidos para que el texto no "salte") */
const SCRAMBLE_GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&@<>/=+*';
/** Caracteres de la estela de código del láser */
const RAIN_GLYPHS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ#$%&<>/{}[]=+*ABCDEF';
const IS_ALNUM = /[A-Za-z0-9À-ÿ]/;

interface ScrambleTarget {
  el: HTMLElement;
  prevHeight: string;
  nodes: { node: Text; text: string }[];
}

class RevealItem {
  v = 0;                 // visibilidad actual 0..1
  target = 0;            // a dónde va (0 oculto, 1 visible)
  anchor: Anchor = 'top';
  from = 0;
  start = 0;
  dur = 0;
  running = false;
  w = 0;
  h = 0;
  band = 20;
  frame = 0;
  glitching = false;
  small = false;
  scrambles: ScrambleTarget[] = [];
  readonly addr = '0x' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');

  readonly scan: HTMLSpanElement;
  readonly glyphs: HTMLSpanElement;
  readonly label: HTMLSpanElement;
  readonly hud: HTMLSpanElement;

  constructor(public el: HTMLElement, public delay: number) {
    this.scan = document.createElement('span');
    this.scan.className = 'hx-scan';
    this.scan.setAttribute('aria-hidden', 'true');
    this.glyphs = document.createElement('span');
    this.glyphs.className = 'hx-scan__glyphs';
    this.label = document.createElement('span');
    this.label.className = 'hx-scan__label';
    this.scan.append(this.glyphs, this.label);

    this.hud = document.createElement('span');
    this.hud.className = 'hx-hud';
    this.hud.setAttribute('aria-hidden', 'true');
    this.hud.innerHTML = '<i></i><i></i><i></i><i></i>';
  }
}

@Injectable({ providedIn: 'root' })
export class RevealEngineService implements OnDestroy {
  /** false si el usuario prefiere menos movimiento o el navegador es muy antiguo */
  readonly enabled: boolean;
  /** Dirección actual del scroll (la usa también el HUD) */
  dir: 'down' | 'up' = 'down';

  private items = new Map<Element, RevealItem>();
  private active = new Set<RevealItem>();
  private io?: IntersectionObserver;
  private raf = 0;
  private edgeRaf = 0;
  private lastY = 0;

  constructor(private zone: NgZone) {
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.enabled = typeof IntersectionObserver !== 'undefined' && !reduced;
    if (!this.enabled) return;

    this.lastY = window.scrollY;
    this.zone.runOutsideAngular(() => {
      // La "ventana" activa deja un 6 % arriba y abajo: así el cifrado al salir se llega a ver
      this.io = new IntersectionObserver(entries => this.onIntersect(entries), {
        rootMargin: '-6% 0px -6% 0px',
        threshold: 0,
      });
      window.addEventListener('scroll', this.onScroll, { passive: true });
    });
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    window.removeEventListener('scroll', this.onScroll);
    cancelAnimationFrame(this.raf);
  }

  // ------------------------------------------------------------------
  //  Registro (lo llama la directiva appReveal)
  // ------------------------------------------------------------------

  register(el: HTMLElement, delay: number): void {
    if (!this.enabled || this.items.has(el)) return;
    const item = new RevealItem(el, delay);
    el.classList.add('hx', 'hx-off');
    el.append(item.scan, item.hud);
    this.items.set(el, item);
    this.io!.observe(el);
  }

  unregister(el: HTMLElement): void {
    const item = this.items.get(el);
    if (!item) return;
    this.io?.unobserve(el);
    this.active.delete(item);
    this.restoreScrambles(item);
    item.scan.remove();
    item.hud.remove();
    this.items.delete(el);
  }

  // ------------------------------------------------------------------
  //  Eventos
  // ------------------------------------------------------------------

  private onScroll = (): void => {
    const y = window.scrollY;
    if (Math.abs(y - this.lastY) > 1) {
      this.dir = y > this.lastY ? 'down' : 'up';
      this.lastY = y;
    }
    if (!this.edgeRaf) {
      this.edgeRaf = requestAnimationFrame(() => {
        this.edgeRaf = 0;
        this.checkEdges();
      });
    }
  };

  private onIntersect(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      const item = this.items.get(entry.target);
      if (item) this.setTarget(item, entry.isIntersecting ? 1 : 0);
    }
  }

  /**
   * Al llegar al final (o al principio) de la página, los últimos bloques
   * pueden quedarse en la franja del 6 %: los mostramos igualmente.
   */
  private checkEdges(): void {
    const doc = document.documentElement;
    const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
    const atTop = window.scrollY <= 4;
    if (!atBottom && !atTop) return;
    for (const item of this.items.values()) {
      if (item.target === 1) continue;
      const r = item.el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) this.setTarget(item, 1);
    }
  }

  // ------------------------------------------------------------------
  //  Animación
  // ------------------------------------------------------------------

  private setTarget(item: RevealItem, target: number): void {
    if (item.target === target) return;
    const now = performance.now();

    if (!item.running) {
      // Al bajar: aparece de arriba abajo y desaparece de arriba abajo.
      // Al subir: aparece de abajo arriba y desaparece de abajo arriba.
      item.anchor = (this.dir === 'down') === (target === 1) ? 'top' : 'bottom';
      item.w = item.el.offsetWidth;
      item.h = item.el.offsetHeight;
      item.small = item.w < 200 || item.h < 64;
      item.el.classList.toggle('hx--sm', item.small);
      item.band = Math.max(8, Math.min(26, item.h * 0.4));
      item.scan.style.height = `${item.band}px`;
      item.scan.classList.toggle('hx-scan--top', item.anchor === 'top');
      item.scan.classList.toggle('hx-scan--bottom', item.anchor === 'bottom');
    }

    item.target = target;
    item.from = item.v;
    const distance = Math.abs(target - item.v);
    const base = target === 1 ? 640 : 380;
    // Los bloques altos tardan un poco más para que el barrido se aprecie
    item.dur = (base + Math.min(700, item.h * 0.3)) * Math.max(0.3, distance);
    const delay = target === 1 && item.v === 0 ? item.delay * (this.dir === 'down' ? 1 : 0.5) : 0;
    item.start = now + delay;

    if (target === 1) {
      item.el.classList.remove('hx-off');
      this.apply(item);
      if (item.v === 0) this.collectScrambles(item);
    }

    item.running = true;
    item.el.classList.add('hx-run');
    this.active.add(item);
    if (!this.raf) this.raf = requestAnimationFrame(this.loop);
  }

  private loop = (now: number): void => {
    for (const item of this.active) {
      if (this.step(item, now)) this.active.delete(item);
    }
    this.raf = this.active.size ? requestAnimationFrame(this.loop) : 0;
  };

  /** Devuelve true cuando la animación de ese bloque ha terminado */
  private step(item: RevealItem, now: number): boolean {
    if (now < item.start) return false;
    const p = Math.min(1, (now - item.start) / item.dur);
    const eased = item.target === 1 ? 1 - Math.pow(1 - p, 3) : p * p;
    item.v = item.from + (item.target - item.from) * eased;
    item.frame++;
    this.apply(item);

    if (item.target === 1) {
      this.glitch(item);
      if (item.frame % 2 === 0) this.scramble(item, p);
    }

    if (p >= 1) {
      this.finish(item);
      return true;
    }
    return false;
  }

  /**
   * Muestra solo la parte ya "descifrada" del bloque (con una máscara)
   * y coloca el láser en la frontera.
   * Nota: usamos mask-image y no clip-path porque Chrome tiene en cuenta el clip-path
   * en el IntersectionObserver y el bloque nunca se detectaría en pantalla.
   */
  private apply(item: RevealItem): void {
    const v = item.v;
    const edge = item.anchor === 'top' ? v * item.h : (1 - v) * item.h;
    const a = (edge - 1).toFixed(1);
    const b = (edge + 1).toFixed(1);
    const mask = v <= 0
      ? 'linear-gradient(transparent, transparent)'
      : item.anchor === 'top'
        ? `linear-gradient(to bottom, #000 ${a}px, transparent ${b}px)`
        : `linear-gradient(to bottom, transparent ${a}px, #000 ${b}px)`;
    item.el.style.setProperty('mask-image', mask);
    item.el.style.setProperty('-webkit-mask-image', mask);

    const top = item.anchor === 'top' ? edge - item.band : edge;
    item.scan.style.transform = `translate3d(0, ${top.toFixed(1)}px, 0)`;

    if (item.frame % 3 === 0) {
      item.glyphs.textContent = this.rain(Math.min(140, Math.ceil(item.w / 7)));
      if (!item.small) {
        const pctTxt = String(Math.round(v * 100)).padStart(3, '0');
        item.label.textContent = `${item.target === 1 ? 'DECRYPT' : 'ENCRYPT'} ${item.addr} ▸ ${pctTxt}%`;
      }
    }
  }

  /** Pequeños saltos y separación RGB mientras se descifra */
  private glitch(item: RevealItem): void {
    const on = item.v > 0.05 && item.v < 0.85 && Math.random() < 0.22;
    if (on) {
      item.el.style.translate = `${(Math.random() * 6 - 3).toFixed(1)}px 0`;
      item.el.style.textShadow = '2px 0 rgba(255, 0, 90, 0.55), -2px 0 rgba(0, 255, 220, 0.55)';
      item.glitching = true;
    } else if (item.glitching) {
      item.el.style.translate = '';
      item.el.style.textShadow = '';
      item.glitching = false;
    }
  }

  private finish(item: RevealItem): void {
    item.running = false;
    item.el.classList.remove('hx-run');
    item.el.style.translate = '';
    item.el.style.textShadow = '';
    item.glitching = false;
    this.restoreScrambles(item);
    item.el.style.removeProperty('mask-image');
    item.el.style.removeProperty('-webkit-mask-image');
    if (item.target === 0) {
      item.v = 0;
      item.el.classList.add('hx-off');
    } else {
      item.v = 1;
    }
  }

  // ------------------------------------------------------------------
  //  Descifrado de títulos
  // ------------------------------------------------------------------

  private collectScrambles(item: RevealItem): void {
    const targets: HTMLElement[] = [];
    if (item.el.matches(SCRAMBLE_SELECTOR)) targets.push(item.el);
    item.el.querySelectorAll<HTMLElement>(SCRAMBLE_SELECTOR).forEach(el => targets.push(el));

    for (const el of targets) {
      if (el.dataset['hxScr'] === '1') continue;
      const nodes: { node: Text; text: string }[] = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let total = 0;
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = (n as Text).data;
        if (!text.trim()) continue;
        total += text.length;
        if (total > 90) break; // solo textos cortos
        nodes.push({ node: n as Text, text });
      }
      if (!nodes.length) continue;
      el.dataset['hxScr'] = '1';
      const prevHeight = el.style.height;
      // Bloqueamos la altura para que el texto aleatorio no mueva la página
      if (getComputedStyle(el).display !== 'inline') el.style.height = `${el.offsetHeight}px`;
      item.scrambles.push({ el, prevHeight, nodes });
    }
  }

  private scramble(item: RevealItem, p: number): void {
    if (!item.scrambles.length) return;
    const q = Math.min(1, p * 1.25);
    for (const s of item.scrambles) {
      for (const n of s.nodes) {
        const fixed = Math.floor(q * n.text.length);
        let out = '';
        for (let i = 0; i < n.text.length; i++) {
          const ch = n.text[i];
          out += i < fixed || !IS_ALNUM.test(ch)
            ? ch
            : SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0];
        }
        n.node.data = out;
      }
    }
  }

  private restoreScrambles(item: RevealItem): void {
    for (const s of item.scrambles) {
      for (const n of s.nodes) n.node.data = n.text;
      s.el.style.height = s.prevHeight;
      delete s.el.dataset['hxScr'];
    }
    item.scrambles = [];
  }

  private rain(len: number): string {
    let out = '';
    for (let i = 0; i < len; i++) out += RAIN_GLYPHS[(Math.random() * RAIN_GLYPHS.length) | 0];
    return out;
  }
}

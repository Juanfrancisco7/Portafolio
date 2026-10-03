import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';

interface Column {
  head: number;    // posición (px) de la "cabeza" de la lluvia
  speed: number;   // px por frame (a 60 fps)
  reveal: number;  // hasta dónde se ha reconstruido la foto en esta columna
  delay: number;   // ms antes de empezar a reconstruir
}

/**
 * Foto con intro "Matrix":
 *  1) Lluvia de código verde sobre negro.
 *  2) La lluvia "pinta" la foto columna a columna, primero en bloques grandes,
 *     con tinte verde y glitches, y se va enfocando hasta verse nítida.
 *  3) Barrido de luz final y queda solo la foto.
 * Mientras tanto, las etiquetas van cambiando entre todos los lenguajes con efecto "descifrado".
 * Dura ~9 s y se repite cada vez que se abre o recarga la página.
 */
@Component({
  selector: 'app-matrix-photo',
  standalone: true,
  templateUrl: './matrix-photo.component.html',
  styleUrl: './matrix-photo.component.css'
})
export class MatrixPhotoComponent implements AfterViewInit, OnDestroy {
  @Input() src = '';
  @Input() alt = '';

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('frame', { static: true }) frameRef!: ElementRef<HTMLElement>;

  /** Todo lo que manejas: las etiquetas irán pasando por esta lista */
  readonly langs = [
    { name: 'Angular', icon: 'fa-brands fa-angular' },
    { name: 'Kotlin', icon: 'fa-solid fa-k' },
    { name: 'Android', icon: 'fa-brands fa-android' },
    { name: 'TypeScript', icon: 'fa-solid fa-code' },
    { name: 'JavaScript', icon: 'fa-brands fa-js' },
    { name: 'Python', icon: 'fa-brands fa-python' },
    { name: 'Node.js', icon: 'fa-brands fa-node-js' },
    { name: 'React', icon: 'fa-brands fa-react' },
    { name: 'SQL', icon: 'fa-solid fa-database' },
    { name: 'SQLite', icon: 'fa-solid fa-hard-drive' },
    { name: 'Redis', icon: 'fa-solid fa-layer-group' },
    { name: 'HTML5', icon: 'fa-brands fa-html5' },
    { name: 'CSS3', icon: 'fa-brands fa-css3-alt' },
    { name: 'Vercel', icon: 'fa-solid fa-play fa-rotate-270' },
    { name: 'Gemini AI', icon: 'fa-solid fa-wand-magic-sparkles' },
  ];

  /** Estado de las 3 etiquetas flotantes */
  chips = [
    { text: '', icon: 'fa-brands fa-angular', idx: 0 },
    { text: '', icon: 'fa-solid fa-k', idx: 1 },
    { text: '', icon: 'fa-brands fa-android', idx: 2 },
  ];

  phase: 'intro' | 'done' = 'intro';

  /** Duración total de la intro (ms). Cámbiala aquí si la quieres más larga o más corta. */
  private readonly DURATION = 9000;
  /** Factor de escala: todas las fases se reparten proporcionalmente en DURATION */
  private readonly S = this.DURATION / 5000;
  private readonly glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789{}[]<>/=+*#$%&ABCDEFJKLMNXYZ';
  private ctx!: CanvasRenderingContext2D;
  private img = new Image();
  private src0 = document.createElement('canvas'); // foto ya recortada al tamaño del marco
  private small = document.createElement('canvas'); // para pixelar
  private pix = document.createElement('canvas');   // foto pixelada a tamaño completo
  private cols: Column[] = [];
  private fontSize = 14;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private start = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private intervals: ReturnType<typeof setInterval>[] = [];

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!ctx || reduced) { this.timers.push(setTimeout(() => this.finish(true))); return; }
    this.ctx = ctx;

    this.startChips();

    this.img.decoding = 'async';
    this.img.onload = () => this.zone.runOutsideAngular(() => this.begin());
    this.img.onerror = () => this.finish(true);
    this.img.src = this.src;
    // Seguridad: si algo tarda demasiado, mostramos la foto igualmente
    this.timers.push(setTimeout(() => this.finish(), this.DURATION + 3000));
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.timers.forEach(t => clearTimeout(t));
    this.intervals.forEach(i => clearInterval(i));
  }

  // ===================== Etiquetas que cambian =====================

  private startChips(): void {
    this.chips.forEach((c, i) => this.scrambleTo(i, this.langs[c.idx].name));
    let k = 3;
    // Cada ~420 ms una etiqueta cambia al siguiente lenguaje (en rotación)
    this.intervals.push(setInterval(() => {
      const chipIndex = k % 3;
      const chip = this.chips[chipIndex];
      chip.idx = k % this.langs.length;
      chip.icon = this.langs[chip.idx].icon;
      this.scrambleTo(chipIndex, this.langs[chip.idx].name);
      k++;
    }, 1100));
  }

  /** Efecto "descifrado": letras aleatorias que se van fijando */
  private scrambleTo(chipIndex: number, word: string): void {
    const chars = '01<>/{}#$%&*+=ABCDEFXYZアカサタナ';
    let frame = 0;
    const total = 14;
    const id = setInterval(() => {
      frame++;
      const fixed = Math.floor((frame / total) * word.length);
      this.chips[chipIndex].text = word
        .split('')
        .map((ch, i) => (i < fixed || ch === ' ' ? ch : chars[Math.floor(Math.random() * chars.length)]))
        .join('');
      if (frame >= total) {
        this.chips[chipIndex].text = word;
        clearInterval(id);
      }
    }, 45);
    this.intervals.push(id);
  }

  // ===================== Canvas Matrix =====================

  private begin(): void {
    this.setup();
    this.start = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private setup(): void {
    const frame = this.frameRef.nativeElement.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, Math.round(frame.width));
    this.h = Math.max(1, Math.round(frame.height));
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.w * this.dpr;
    canvas.height = this.h * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Recorte "cover" igual que object-fit: cover; object-position: 50% 30%
    this.src0.width = this.w;
    this.src0.height = this.h;
    const s = this.src0.getContext('2d')!;
    const ir = this.img.naturalWidth / this.img.naturalHeight;
    const fr = this.w / this.h;
    let sw = this.img.naturalWidth, sh = this.img.naturalHeight, sx = 0, sy = 0;
    if (ir > fr) { sw = sh * fr; sx = (this.img.naturalWidth - sw) * 0.5; }
    else { sh = sw / fr; sy = (this.img.naturalHeight - sh) * 0.3; }
    s.drawImage(this.img, sx, sy, sw, sh, 0, 0, this.w, this.h);

    this.pix.width = this.w;
    this.pix.height = this.h;

    this.fontSize = this.w < 280 ? 11 : 14;
    const n = Math.ceil(this.w / this.fontSize);
    this.cols = Array.from({ length: n }, () => ({
      head: -Math.random() * this.h,
      speed: (3 + Math.random() * 4) / this.S,
      reveal: 0,
      delay: (900 + Math.random() * 1300) * this.S,
    }));
  }

  private frame = (now: number): void => {
    // t = tiempo real; u = tiempo "normalizado" a 5 s para que las fases escalen con DURATION
    const t = now - this.start;
    const u = t / this.S;
    const { ctx, w, h, fontSize } = this;
    const p = Math.min(1, t / this.DURATION);

    // Progreso de "enfoque": de bloques grandes a nítido (entre 1.1 s y 4.2 s)
    const focus = this.ease(this.clamp((u - 1100) / 3100));
    const block = Math.max(1, Math.round(this.lerp(26, 1, focus)));
    this.renderPixelated(block);

    // Fondo negro
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#020403';
    ctx.fillRect(0, 0, w, h);

    // 1) Foto reconstruida por columnas
    const colW = fontSize;
    this.cols.forEach((c, i) => {
      c.head += c.speed * (u > 3600 ? 2.2 : 1);
      if (t > c.delay) c.reveal = Math.max(c.reveal, c.head);
      if (u > 3900) c.reveal = Math.max(c.reveal, this.lerp(c.reveal, h, 0.12)); // completamos lo que falte
      if (c.head > h + 200) c.head = -Math.random() * 120;
      const x = i * colW;
      const rh = Math.min(h, c.reveal);
      if (rh > 0) ctx.drawImage(this.pix, x, 0, colW, rh, x, 0, colW, rh);
    });

    // 2) Tinte verde que se va quitando
    const tint = 1 - this.ease(this.clamp((u - 2400) / 2000));
    if (tint > 0.01) {
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = `rgba(90, 255, 130, ${0.85 * tint})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }

    // 3) Glitches: franjas desplazadas
    if (u > 1200 && u < 4200 && Math.random() < 0.12) {
      for (let g = 0; g < 2; g++) {
        const y = Math.random() * h;
        const sh = 4 + Math.random() * 18;
        const dx = (Math.random() - 0.5) * 24;
        ctx.drawImage(this.canvasRef.nativeElement, 0, y * this.dpr, w * this.dpr, sh * this.dpr, dx, y, w, sh);
      }
    }

    // 4) Lluvia de caracteres (se desvanece al final)
    const rainAlpha = 1 - this.clamp((u - 3800) / 900);
    if (rainAlpha > 0) {
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      ctx.textBaseline = 'top';
      this.cols.forEach((c, i) => {
        const x = i * colW;
        for (let k = 0; k < 14; k++) {
          const y = c.head - k * fontSize;
          if (y < -fontSize || y > h) continue;
          const ch = this.glyphs[(Math.random() * this.glyphs.length) | 0];
          const a = (k === 0 ? 1 : (1 - k / 14) * 0.75) * rainAlpha;
          ctx.fillStyle = k === 0 ? `rgba(230, 255, 230, ${a})` : `rgba(141, 230, 110, ${a})`;
          ctx.fillText(ch, x, y);
        }
      });
    }

    // 5) Líneas de escaneo CRT
    if (p < 0.92) {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.18 * (1 - p)})`;
      for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    }

    // 6) Barrido de luz final
    const sweep = this.clamp((u - 4000) / 700);
    if (sweep > 0 && sweep < 1) {
      const y = sweep * (h + 80) - 40;
      const grad = ctx.createLinearGradient(0, y - 40, 0, y + 40);
      grad.addColorStop(0, 'rgba(168, 236, 106, 0)');
      grad.addColorStop(0.5, 'rgba(220, 255, 200, 0.55)');
      grad.addColorStop(1, 'rgba(168, 236, 106, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - 40, w, 80);
    }

    if (t < this.DURATION) {
      this.raf = requestAnimationFrame(this.frame);
    } else {
      // Último fotograma: la foto nítida, y luego quitamos el canvas
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(this.src0, 0, 0, w, h);
      this.finish();
    }
  };

  private lastBlock = -1;
  private renderPixelated(block: number): void {
    if (block === this.lastBlock) return;
    this.lastBlock = block;
    const pctx = this.pix.getContext('2d')!;
    if (block <= 1) {
      pctx.clearRect(0, 0, this.w, this.h);
      pctx.drawImage(this.src0, 0, 0);
      return;
    }
    const sw = Math.max(1, Math.round(this.w / block));
    const sh = Math.max(1, Math.round(this.h / block));
    this.small.width = sw;
    this.small.height = sh;
    const sctx = this.small.getContext('2d')!;
    sctx.drawImage(this.src0, 0, 0, sw, sh);
    pctx.imageSmoothingEnabled = false;
    pctx.clearRect(0, 0, this.w, this.h);
    pctx.drawImage(this.small, 0, 0, sw, sh, 0, 0, this.w, this.h);
  }

  private finish(immediate = false): void {
    if (this.phase === 'done') return;
    cancelAnimationFrame(this.raf);
    this.zone.run(() => {
      this.phase = 'done';
      this.intervals.forEach(i => clearInterval(i));
      this.intervals = [];
      if (immediate) this.canvasRef.nativeElement.style.display = 'none';
    });
  }

  private clamp(v: number): number { return Math.max(0, Math.min(1, v)); }
  private lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
  private ease(t: number): number { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
}

import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';

interface Dot {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
}

/**
 * Fondo interactivo: una red de partículas que reacciona al ratón o al dedo.
 * Se ejecuta fuera de Angular (NgZone) para no afectar al rendimiento,
 * y solo se anima cuando la sección está en pantalla.
 */
@Component({
  selector: 'app-particles',
  standalone: true,
  template: `<canvas #canvas aria-hidden="true"></canvas>`,
  styles: [`
    :host { position: absolute; inset: 0; display: block; pointer-events: none; }
    canvas { width: 100%; height: 100%; display: block; }
  `]
})
export class ParticlesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private dots: Dot[] = [];
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private visible = false;
  private pointer = { x: -9999, y: -9999, active: false };
  private observer?: IntersectionObserver;
  private resizeObs?: ResizeObserver;
  private cleanup: (() => void)[] = [];
  private reduced = false;

  constructor(private zone: NgZone, private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    this.zone.runOutsideAngular(() => {
      this.resize();
      this.resizeObs = new ResizeObserver(() => this.resize());
      this.resizeObs.observe(this.host.nativeElement);

      // El "padre" (la sección) recibe los eventos del puntero
      const section = this.host.nativeElement.parentElement ?? this.host.nativeElement;
      const move = (e: PointerEvent) => {
        const rect = this.canvasRef.nativeElement.getBoundingClientRect();
        this.pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
      };
      const leave = () => (this.pointer.active = false);
      section.addEventListener('pointermove', move, { passive: true });
      section.addEventListener('pointerdown', move, { passive: true });
      section.addEventListener('pointerleave', leave);
      this.cleanup.push(() => {
        section.removeEventListener('pointermove', move);
        section.removeEventListener('pointerdown', move);
        section.removeEventListener('pointerleave', leave);
      });

      this.observer = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        if (this.visible && !this.raf) this.loop();
      });
      this.observer.observe(this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.observer?.disconnect();
    this.resizeObs?.disconnect();
    this.cleanup.forEach(fn => fn());
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = this.host.nativeElement.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = rect.width;
    this.h = rect.height;
    canvas.width = Math.round(this.w * this.dpr);
    canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Menos partículas en pantallas pequeñas
    const count = Math.round(Math.min(110, Math.max(36, (this.w * this.h) / 14000)));
    this.dots = Array.from({ length: count }, () => ({
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
    }));
    if (this.reduced) this.draw();
  }

  private loop = (): void => {
    if (!this.visible) { this.raf = 0; return; }
    if (!this.reduced) this.step();
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private step(): void {
    const { w, h, pointer } = this;
    for (const d of this.dots) {
      // Atracción suave hacia el puntero
      if (pointer.active) {
        const dx = pointer.x - d.x;
        const dy = pointer.y - d.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 1) {
          d.vx += (dx / dist) * 0.025;
          d.vy += (dy / dist) * 0.025;
        }
      }
      d.vx *= 0.985;
      d.vy *= 0.985;
      // velocidad mínima para que nunca se queden quietas
      if (Math.abs(d.vx) < 0.05) d.vx += (Math.random() - 0.5) * 0.05;
      if (Math.abs(d.vy) < 0.05) d.vy += (Math.random() - 0.5) * 0.05;
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      d.x = Math.max(0, Math.min(w, d.x));
      d.y = Math.max(0, Math.min(h, d.y));
    }
  }

  private draw(): void {
    const { ctx, dots, pointer } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    const maxDist = 120;

    for (let i = 0; i < dots.length; i++) {
      const a = dots[i];
      for (let j = i + 1; j < dots.length; j++) {
        const b = dots[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < maxDist * maxDist) {
          const alpha = 1 - Math.sqrt(dist2) / maxDist;
          ctx.strokeStyle = `rgba(141, 200, 85, ${alpha * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      // líneas hacia el puntero
      if (pointer.active) {
        const pd = Math.hypot(pointer.x - a.x, pointer.y - a.y);
        if (pd < 170) {
          ctx.strokeStyle = `rgba(168, 236, 106, ${(1 - pd / 170) * 0.55})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
    }

    for (const d of dots) {
      ctx.fillStyle = 'rgba(168, 236, 106, 0.75)';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

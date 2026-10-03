import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { RevealEngineService } from '../../services/reveal-engine.service';

/**
 * HUD de escaneo:
 *  - Escritorio: raíl lateral con las secciones, % de página y dirección del scroll.
 *  - Móvil/tablet: barra de progreso verde arriba del todo.
 *  - Capa CRT con líneas de escaneo muy sutiles en toda la pantalla.
 * Todo se actualiza directamente en el DOM y fuera de Angular (no gasta rendimiento).
 */
@Component({
  selector: 'app-scroll-hud',
  standalone: true,
  templateUrl: './scroll-hud.component.html',
  styleUrl: './scroll-hud.component.css'
})
export class ScrollHudComponent implements AfterViewInit, OnDestroy {
  readonly sections = [
    { id: 'inicio', label: 'inicio' },
    { id: 'sobre-mi', label: 'sobre-mi' },
    { id: 'skills', label: 'skills' },
    { id: 'proyectos', label: 'proyectos' },
    { id: 'certificaciones', label: 'certificaciones' },
    { id: 'galeria', label: 'galeria' },
    { id: 'contactame', label: 'contacto' },
  ];

  @ViewChild('rail', { static: true }) rail!: ElementRef<HTMLElement>;
  @ViewChild('fill', { static: true }) fill!: ElementRef<HTMLElement>;
  @ViewChild('head', { static: true }) head!: ElementRef<HTMLElement>;
  @ViewChild('bar', { static: true }) bar!: ElementRef<HTMLElement>;
  @ViewChild('pct', { static: true }) pct!: ElementRef<HTMLElement>;
  @ViewChild('arrow', { static: true }) arrow!: ElementRef<HTMLElement>;

  private tops: number[] = [];
  private ticks: HTMLElement[] = [];
  private raf = 0;
  private activeIdx = -1;
  private ro?: ResizeObserver;
  private measureTimer?: ReturnType<typeof setTimeout>;

  constructor(private zone: NgZone, private engine: RevealEngineService) {}

  ngAfterViewInit(): void {
    this.ticks = Array.from(this.rail.nativeElement.querySelectorAll<HTMLElement>('.rail__tick'));
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.schedule, { passive: true });
      window.addEventListener('resize', this.remeasure, { passive: true });
      if (typeof ResizeObserver !== 'undefined') {
        this.ro = new ResizeObserver(() => this.remeasure());
        this.ro.observe(document.body);
      }
      this.measureTimer = setTimeout(this.remeasure, 300);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.schedule);
    window.removeEventListener('resize', this.remeasure);
    this.ro?.disconnect();
    cancelAnimationFrame(this.raf);
    if (this.measureTimer) clearTimeout(this.measureTimer);
  }

  private remeasure = (): void => {
    this.measure();
    this.update();
  };

  private schedule = (): void => {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.update();
    });
  };

  private maxScroll(): number {
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  /** Posición de cada sección en el raíl (proporcional a la página) */
  private measure(): void {
    const max = this.maxScroll();
    this.tops = this.sections.map(s => {
      const el = document.getElementById(s.id);
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    });
    this.ticks.forEach((tick, i) => {
      tick.style.top = `${Math.min(100, Math.max(0, (this.tops[i] / max) * 100))}%`;
    });
  }

  private update(): void {
    const y = window.scrollY;
    const p = Math.min(1, Math.max(0, y / this.maxScroll()));

    this.fill.nativeElement.style.transform = `scaleY(${p})`;
    this.head.nativeElement.style.top = `${p * 100}%`;
    this.bar.nativeElement.style.transform = `scaleX(${p})`;
    this.pct.nativeElement.textContent = String(Math.round(p * 100)).padStart(3, '0');
    this.arrow.nativeElement.textContent = this.engine.dir === 'down' ? '▼' : '▲';
    this.rail.nativeElement.classList.toggle('is-on', y > 120);

    // Sección activa: la última cuyo inicio ya pasó el 45 % de la pantalla
    const probe = y + window.innerHeight * 0.45;
    let idx = 0;
    this.tops.forEach((top, i) => { if (top <= probe) idx = i; });
    if (idx !== this.activeIdx) {
      this.ticks.forEach((tick, i) => tick.classList.toggle('is-active', i === idx));
      this.activeIdx = idx;
    }
  }
}

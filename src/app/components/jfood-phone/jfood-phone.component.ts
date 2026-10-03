import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy } from '@angular/core';

type Phase = 'idle' | 'scanning' | 'detecting' | 'results';

interface Detection {
  name: string;
  grams: number;
  kcal: number;
  /** Posición de la caja sobre la foto, en % */
  x: number; y: number; w: number; h: number;
  /** Lado de la etiqueta para que no se salga de la foto */
  labelBottom?: boolean;
}

/**
 * Mockup animado de J-Food: un plato saludable que la "IA" analiza en bucle.
 * idle → scanning (barrido + %) → detecting (cajas una a una) → results (kcal y macros) → vuelve a empezar
 */
@Component({
  selector: 'app-jfood-phone',
  standalone: true,
  imports: [],
  templateUrl: './jfood-phone.component.html',
  styleUrl: './jfood-phone.component.css'
})
export class JfoodPhoneComponent implements AfterViewInit, OnDestroy {
  readonly detections: Detection[] = [
    { name: 'Salmón', grams: 120, kcal: 250, x: 13, y: 17, w: 40, h: 28 },
    { name: 'Huevo', grams: 50, kcal: 72, x: 50, y: 4, w: 27, h: 18 },
    { name: 'Aguacate', grams: 70, kcal: 112, x: 58, y: 23, w: 31, h: 31 },
    { name: 'Tomate', grams: 50, kcal: 9, x: 38, y: 44, w: 26, h: 21 },
    { name: 'Quinoa', grams: 90, kcal: 108, x: 12, y: 52, w: 38, h: 32 },
    { name: 'Espinacas', grams: 40, kcal: 10, x: 58, y: 58, w: 31, h: 28 },
  ];

  readonly totalKcal = 561;
  readonly macros = [
    { label: 'Hidratos', value: 29, color: '#8a6a2e' },
    { label: 'Grasa', value: 33, color: '#b0452f' },
    { label: 'Proteína', value: 37, color: '#6b4aa0' },
  ];

  phase: Phase = 'idle';
  progress = 0;
  shownBoxes = 0;
  kcal = 0;
  macroValues = [0, 0, 0];

  private timers: ReturnType<typeof setTimeout>[] = [];
  private observer?: IntersectionObserver;
  private running = false;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit(): void {
    // Solo animamos cuando el teléfono está en pantalla (ahorra batería en móvil)
    if (typeof IntersectionObserver === 'undefined') {
      this.start();
      return;
    }
    this.observer = new IntersectionObserver(([entry]) => {
      this.zone.run(() => (entry.isIntersecting ? this.start() : this.stop()));
    }, { threshold: 0.25 });
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.stop();
    this.observer?.disconnect();
  }

  private start(): void {
    if (this.running) return;
    this.running = true;
    this.cycle();
  }

  private stop(): void {
    this.running = false;
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
  }

  private later(fn: () => void, ms: number): void {
    this.timers.push(setTimeout(fn, ms));
  }

  private cycle(): void {
    if (!this.running) return;
    this.phase = 'idle';
    this.progress = 0;
    this.shownBoxes = 0;
    this.kcal = 0;
    this.macroValues = [0, 0, 0];

    // 1) Escaneo con porcentaje
    this.later(() => {
      this.phase = 'scanning';
      const step = () => {
        if (!this.running) return;
        this.progress = Math.min(100, this.progress + 3 + Math.round(Math.random() * 4));
        if (this.progress < 100) this.later(step, 70);
        else this.later(() => this.detect(), 250);
      };
      step();
    }, 900);
  }

  // 2) Aparecen las cajas de detección una a una
  private detect(): void {
    this.phase = 'detecting';
    this.detections.forEach((_, i) => this.later(() => (this.shownBoxes = i + 1), 260 * i));
    this.later(() => this.results(), 260 * this.detections.length + 400);
  }

  // 3) Las calorías y los macros "cuentan" hasta su valor
  private results(): void {
    this.phase = 'results';
    const frames = 30;
    for (let f = 1; f <= frames; f++) {
      this.later(() => {
        const t = 1 - Math.pow(1 - f / frames, 3); // easeOutCubic
        this.kcal = Math.round(this.totalKcal * t);
        this.macroValues = this.macros.map(m => Math.round(m.value * t));
      }, f * 35);
    }
    // 4) Mantenemos el resultado y repetimos
    this.later(() => this.cycle(), frames * 35 + 4200);
  }
}

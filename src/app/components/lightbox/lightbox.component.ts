import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

export interface LightboxItem {
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Visor de imágenes a pantalla completa reutilizable.
 * Se usa en Proyectos, Certificaciones y Galería.
 *  - Flechas / teclado (← → Esc) / deslizar con el dedo en móvil
 */
@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.css'
})
export class LightboxComponent implements OnChanges, OnDestroy {
  @Input() items: LightboxItem[] = [];
  @Input() index: number | null = null;
  @Input() title = '';
  @Output() indexChange = new EventEmitter<number | null>();

  private touchStartX = 0;
  private touchStartY = 0;

  get current(): LightboxItem | null {
    return this.index === null ? null : this.items[this.index] ?? null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['index']) {
      document.body.classList.toggle('no-scroll', this.index !== null);
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  close(): void {
    this.indexChange.emit(null);
  }

  next(): void {
    if (this.index === null || this.items.length < 2) return;
    this.indexChange.emit((this.index + 1) % this.items.length);
  }

  prev(): void {
    if (this.index === null || this.items.length < 2) return;
    this.indexChange.emit((this.index - 1 + this.items.length) % this.items.length);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (this.index === null) return;
    if (event.key === 'Escape') this.close();
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.prev();
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].clientX;
    this.touchStartY = event.changedTouches[0].clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    const dx = event.changedTouches[0].clientX - this.touchStartX;
    const dy = event.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? this.next() : this.prev();
    } else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
      this.close(); // deslizar hacia abajo cierra
    }
  }
}

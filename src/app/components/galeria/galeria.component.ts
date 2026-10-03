import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { LightboxComponent, LightboxItem } from '../lightbox/lightbox.component';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [RevealDirective, LightboxComponent],
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.css'
})
export class GaleriaComponent {
  // Nombres de archivo dentro de public/img/opt (los GIF ahora son WebP animados, mucho más ligeros).
  private readonly files = [
    'p1', 'g1c', 'a1', 'a3', 'a4', 'a6', 'a5', 'a7', 'a8', 'g5c', 'a10',
    'g3', 'a13', 'g4c', 'a14', 'g8', 'p7', 'g9', 'p9', 'g2c', 'p11', 'g10',
  ];

  readonly images: LightboxItem[] = this.files.map((f, i) => ({
    src: `img/opt/${f}.webp`,
    alt: `Foto ${i + 1} de la galería`,
  }));
  readonly thumbs = this.files.map(f => `img/opt/thumb/${f}.webp`);

  readonly initialCount = 12;
  showAll = false;
  lightboxIndex: number | null = null;

  isVisible(i: number): boolean {
    return this.showAll || i < this.initialCount;
  }
}

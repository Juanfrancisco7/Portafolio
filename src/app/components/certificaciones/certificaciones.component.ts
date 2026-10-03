import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { LightboxComponent, LightboxItem } from '../lightbox/lightbox.component';

@Component({
  selector: 'app-certificaciones',
  standalone: true,
  imports: [RevealDirective, LightboxComponent],
  templateUrl: './certificaciones.component.html',
  styleUrl: './certificaciones.component.css'
})
export class CertificacionesComponent {
  // Nombres de archivo dentro de public/img/opt (orden en que se muestran).
  // 👉 Para añadir una nueva: optimízala a .webp, ponla en img/opt y en img/opt/thumb y añade su nombre aquí.
  private readonly files = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '18', '11', '12', '13', '14', '15', '16', '17'];

  readonly certs: LightboxItem[] = this.files.map((f, i) => ({
    src: `img/opt/${f}.webp`,
    alt: `Certificación ${i + 1}`,
  }));
  readonly thumbs = this.files.map(f => `img/opt/thumb/${f}.webp`);

  readonly initialCount = 8;
  showAll = false;
  lightboxIndex: number | null = null;

  isVisible(i: number): boolean {
    return this.showAll || i < this.initialCount;
  }
}

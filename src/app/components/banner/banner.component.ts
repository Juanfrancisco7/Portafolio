import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatrixPhotoComponent } from '../matrix-photo/matrix-photo.component';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [MatrixPhotoComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent implements OnInit, OnDestroy {
  // --- Textos (cámbialos aquí cuando quieras) ---
  readonly fullName = 'Juan Francisco';
  readonly roles = [
    'Web Developer',
    'Angular · TypeScript · JavaScript',
    'Python & Node.js',
    'Kotlin · Apps Android con IA',
    'Bases de datos SQL & Redis',
  ];
  readonly stats = [
    { value: '12+', label: 'Proyectos' },
    { value: '18', label: 'Certificaciones' },
    { value: '1', label: 'App Android' },
  ];

  displayedName = '';
  roleIndex = 0;

  private timers: ReturnType<typeof setTimeout>[] = [];
  private roleInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.typeName();
    this.roleInterval = setInterval(() => {
      this.roleIndex = (this.roleIndex + 1) % this.roles.length;
    }, 2600);
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearTimeout(t));
    if (this.roleInterval) clearInterval(this.roleInterval);
  }

  /** Efecto de máquina de escribir para el nombre */
  private typeName(): void {
    let i = 0;
    const tick = () => {
      if (i <= this.fullName.length) {
        this.displayedName = this.fullName.slice(0, i++);
        this.timers.push(setTimeout(tick, 85));
      }
    };
    this.timers.push(setTimeout(tick, 350));
  }
}

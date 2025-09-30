import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para usar @if

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule], // Importamos CommonModule
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  // Propiedad para el año de copyright dinámico
  currentYear: number;

  // Propiedad para mostrar u ocultar el botón "Volver Arriba"
  showBackToTop = false;

  constructor() {
    // Inicializamos el año actual al crear el componente
    this.currentYear = new Date().getFullYear();
  }

  // Escucha el evento de scroll en toda la página
  @HostListener('window:scroll')
  onWindowScroll() {
    // Muestra el botón si el usuario ha bajado más de 300px
    this.showBackToTop = window.pageYOffset > 300;
  }

  // Función para hacer scroll suave hasta el inicio de la página
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
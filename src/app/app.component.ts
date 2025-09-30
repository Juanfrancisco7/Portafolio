import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Necesario para @if
import { RouterOutlet } from '@angular/router';

// Importamos todos nuestros componentes
import { HeaderComponent } from './components/header/header.component';
import { BannerComponent } from './components/banner/banner.component';
import { SobreMiComponent } from './components/sobre-mi/sobre-mi.component';
import { SkillsHobbiesComponent } from './components/skills-hobbies/skills-hobbies.component';
import { CertificacionesComponent } from './components/certificaciones/certificaciones.component';
import { ProyectosComponent } from './components/proyectos/proyectos.component';
import { GaleriaComponent } from './components/galeria/galeria.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, // <-- Añadido aquí
    RouterOutlet,
    HeaderComponent,
    BannerComponent,
    SobreMiComponent,
    SkillsHobbiesComponent,
    CertificacionesComponent,
    ProyectosComponent,
    GaleriaComponent,
    ContactoComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  // Propiedad para controlar la visibilidad de la notificación
  showWelcomeNotification = false;

  // ngOnInit se ejecuta una vez que el componente está listo
  ngOnInit(): void {
    // Replicamos la lógica de sessionStorage
    if (sessionStorage.getItem('pageReloaded')) {
      // Si la página se recargó, muestra la notificación inmediatamente
      this.showNotification();
      sessionStorage.removeItem('pageReloaded');
    } else {
      // Si es la primera visita, espera 10 segundos
      setTimeout(() => {
        this.showNotification();
      }, 10000);
      sessionStorage.setItem('pageReloaded', 'true');
    }
  }

  private showNotification(): void {
    this.showWelcomeNotification = true;
    // Oculta la notificación después de 8 segundos
    setTimeout(() => {
      this.showWelcomeNotification = false;
    }, 8000);
  }
}


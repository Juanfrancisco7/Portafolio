import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './services/notification.service'; // <-- 1. IMPORTAMOS EL SERVICIO

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
  imports: [ CommonModule, RouterOutlet, HeaderComponent, BannerComponent, SobreMiComponent, SkillsHobbiesComponent, CertificacionesComponent, ProyectosComponent, GaleriaComponent, ContactoComponent, FooterComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  showWelcomeNotification = false;

  // 2. INYECTAMOS el servicio en el constructor
  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Lógica original para mostrar la notificación al cargar la página
    if (sessionStorage.getItem('pageReloaded')) {
      this.showWelcomeNotificationWithDelay(0); // Muestra inmediatamente
      sessionStorage.removeItem('pageReloaded');
    } else {
      this.showWelcomeNotificationWithDelay(10000); // Espera 10 segundos
      sessionStorage.setItem('pageReloaded', 'true');
    }

    // 3. ¡NOS SUSCRIBIMOS PARA ESCUCHAR MENSAJES!
    this.notificationService.notification$.subscribe(event => {
      if (event === 'formSentSuccess') {
        // Cuando oímos que el formulario se envió, esperamos un poco
        // a que termine el scroll y volvemos a mostrar la notificación.
        this.showWelcomeNotificationWithDelay(1500); // Espera 1.5 segundos
      }
    });
  }

  // Hemos movido la lógica a una función reutilizable para no repetir código
  private showWelcomeNotificationWithDelay(delay: number): void {
    setTimeout(() => {
      this.showWelcomeNotification = true;
      // La notificación se ocultará después de 8 segundos
      setTimeout(() => {
        this.showWelcomeNotification = false;
      }, 8000);
    }, delay);
  }
}
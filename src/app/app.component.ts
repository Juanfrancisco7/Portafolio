import { Component, OnInit } from '@angular/core';
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
import { ScrollHudComponent } from './components/scroll-hud/scroll-hud.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet, HeaderComponent, BannerComponent, SobreMiComponent, SkillsHobbiesComponent, CertificacionesComponent, ProyectosComponent, GaleriaComponent, ContactoComponent, FooterComponent, ScrollHudComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  showWelcomeNotification = false;

  // 2. INYECTAMOS el servicio en el constructor
  constructor(private notificationService: NotificationService) {}

  /** Cuándo aparece el aviso tras abrir/recargar la página y cuánto dura (ms) */
  private readonly WELCOME_DELAY = 15000;
  private readonly WELCOME_DURATION = 10000;
  private hideTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    // Cada vez que se abre o recarga la página: aparece a los 15 s y se quita a los 10 s
    this.showWelcomeNotificationWithDelay(this.WELCOME_DELAY);

    // Después de enviar un mensaje en Contacto, lo volvemos a mostrar
    this.notificationService.notification$.subscribe(event => {
      if (event === 'formSentSuccess') {
        this.showWelcomeNotificationWithDelay(1500);
      }
    });
  }

  private showWelcomeNotificationWithDelay(delay: number): void {
    setTimeout(() => {
      this.showWelcomeNotification = true;
      if (this.hideTimer) clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => (this.showWelcomeNotification = false), this.WELCOME_DURATION);
    }, delay);
  }
}

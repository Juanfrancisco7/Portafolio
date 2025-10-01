import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service'; // <-- 1. IMPORTAMOS EL SERVICIO

declare var emailjs: any;

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  isSending = false;
  notification = { message: '', type: '' };

  // 2. INYECTAMOS el servicio en el constructor para poder usarlo
  constructor(private notificationService: NotificationService) {
    emailjs.init("MozjG_1EF6MduDcEx");
  }

  sendEmail(form: NgForm) {
    if (form.invalid) {
      this.showNotification('Por favor, completa todos los campos requeridos.', 'error');
      return;
    }

    this.isSending = true;
    const serviceID = 'service_1fd29qg';
    const templateID = 'template_lhkn88h';

    emailjs.send(serviceID, templateID, form.value)
      .then(() => {
        this.isSending = false;
        // Muestra la notificación de éxito inmediata
        this.showNotification(
          'Gracias por tu mensaje. Me pondré en contacto contigo pronto.',
          'success'
        );
        form.resetForm();

        // 3. AÑADIMOS LA NUEVA LÓGICA
        // Esperamos a que la notificación de éxito desaparezca (7 segundos)
        setTimeout(() => {
          // Hacemos el scroll suave hacia arriba
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // Y "gritamos" el mensaje para que AppComponent lo escuche
          this.notificationService.notify('formSentSuccess');
        }, 7000);

      }, (err: any) => {
        this.isSending = false;
        this.showNotification('Hubo un error al enviar el mensaje. Inténtalo de nuevo.', 'error');
        console.error('Error al enviar email:', err);
      });
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = { message: '', type: '' };
    }, 7000);
  }
}
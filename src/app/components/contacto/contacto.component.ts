import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // <-- Necesario para los formularios
import { CommonModule } from '@angular/common'; // <-- Necesario para *ngIf/@if

// Le decimos a TypeScript que confíe en que la variable 'emailjs' existirá globalmente
declare var emailjs: any;

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [
    FormsModule,  // <-- Importamos el módulo de formularios
    CommonModule  // <-- Importamos el módulo común
  ],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  // Propiedades para manejar el estado del formulario y las notificaciones
  isSending = false;
  notification = { message: '', type: '' };

  constructor() {
    // Inicializamos EmailJS una sola vez. Asegúrate de que tu Public Key es correcta.
    emailjs.init("MozjG_1EF6MduDcEx");
  }

  // Esta función se llamará cuando se envíe el formulario
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
        this.showNotification('¡Mensaje enviado con éxito! Gracias por contactarme.', 'success');
        form.resetForm();
      }, (err: any) => {
        this.isSending = false;
        this.showNotification('Hubo un error al enviar el mensaje. Inténtalo de nuevo.', 'error');
        console.error('Error al enviar email:', err);
      });
  }

  // Función para mostrar y ocultar las notificaciones
  private showNotification(message: string, type: 'success' | 'error') {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = { message: '', type: '' };
    }, 7000); // La notificación desaparecerá después de 7 segundos
  }
}
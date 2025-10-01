import { Component, OnInit, ElementRef, ViewChild, HostListener, Renderer2, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Helper interface for iOS permission
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit, OnDestroy {
  // --- Textos para las animaciones ---
  readonly titleText = 'Hola, soy Juan Francisco';
  readonly subtitle1Text = 'Web Developer | Python | JavaScript | Angular';
  readonly subtitle2Text = 'Creando soluciones web eficientes.';

  // --- Propiedades para el estado de las animaciones de texto ---
  displayedTitle = '';
  showSubtitles = false;

  @ViewChild('bannerImage') bannerImage!: ElementRef;

  private isTouchDevice = false;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this.startTypingAnimation();
    // Detectamos si es un dispositivo táctil para activar el giroscopio
    this.isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (this.isTouchDevice) {
      this.requestDeviceOrientationPermission();
    }
  }

  // --- LÓGICA PARA EL EFECTO 3D ---

  // Para ESCRITORIO: se activa con el movimiento del ratón
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isTouchDevice || !this.bannerImage) return;
    this.apply3dTransform(event.clientX, event.clientY);
  }

  // Para MÓVIL: se activa con el giroscopio
  @HostListener('window:deviceorientation')
  onDeviceOrientation(event: DeviceOrientationEvent): void {
    if (!this.isTouchDevice || !this.bannerImage || event.beta === null || event.gamma === null) return;
    
    // Convertimos los grados del giroscopio a un movimiento similar al del ratón
    const x = (event.gamma + 90) * (window.innerWidth / 180); // Gamma (-90 a 90) -> X
    const y = (event.beta + 180) * (window.innerHeight / 360); // Beta (-180 a 180) -> Y
    
    this.apply3dTransform(x, y);
  }

  // Función central que calcula y aplica la transformación 3D
  private apply3dTransform(mouseX: number, mouseY: number): void {
    const imgElement = this.bannerImage.nativeElement;
    const { left, top, width, height } = imgElement.getBoundingClientRect();

    const elementX = mouseX - left;
    const elementY = mouseY - top;

    const rotateX = (elementY / height - 0.5) * -20; // Inclinación vertical (máx 20 grados)
    const rotateY = (elementX / width - 0.5) * 20;  // Inclinación horizontal (máx 20 grados)

    this.renderer.setStyle(
      imgElement,
      'transform',
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
    );
  }
  
  // Resetea la posición de la imagen cuando el ratón sale (solo en escritorio)
  resetImageTransform(): void {
    if (this.isTouchDevice || !this.bannerImage) return;
    this.renderer.setStyle(this.bannerImage.nativeElement, 'transform', 'perspective(1000px) rotateX(0) rotateY(0) scale(1)');
  }

  // --- Lógica para pedir permiso en iOS ---
  private requestDeviceOrientationPermission(): void {
    const navigatorEvent = window as any;
    const deviceOrientationEvent = navigatorEvent.DeviceOrientationEvent as DeviceOrientationEventiOS;

    if (deviceOrientationEvent && typeof deviceOrientationEvent.requestPermission === 'function') {
      // En iOS 13+, necesitamos pedir permiso al usuario.
      // Lo hacemos en la primera interacción (click/touch).
      window.addEventListener('click', () => {
        deviceOrientationEvent.requestPermission!()
          .then(permissionState => {
            if (permissionState === 'granted') {
              // Permiso concedido, el listener ya funciona
            }
          })
          .catch(console.error);
      }, { once: true }); // El listener se ejecuta solo una vez
    }
  }


  // --- Lógica de la animación de texto ---
  private startTypingAnimation(): void {
    let charIndex = 0;
    const typingSpeed = 150;

    const typeCharacter = () => {
      if (charIndex < this.titleText.length) {
        this.displayedTitle += this.titleText.charAt(charIndex);
        charIndex++;
        setTimeout(typeCharacter, typingSpeed);
      } else {
        setTimeout(() => {
          this.showSubtitles = true;
        }, 500);
      }
    };
    typeCharacter();
  }

  ngOnDestroy(): void {
      // Limpia listeners si es necesario
  }
}
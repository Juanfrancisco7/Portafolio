import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit, AfterViewInit {
  // --- Textos para las animaciones ---
  readonly titleText = 'Hola, soy Juan Francisco';
  readonly subtitle1Text = 'Web Developer | Python | JavaScript | Angular';
  readonly subtitle2Text = 'Creando soluciones web eficientes.';

  // --- Propiedades para controlar el estado de las animaciones ---
  displayedTitle = '';
  showSubtitles = false;
  imageAnimationFinished = false;

  // Obtenemos una referencia al elemento de la imagen
  @ViewChild('bannerImageContainer') bannerImageContainer!: ElementRef;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    // La animación de texto ya no empieza aquí
  }

  ngAfterViewInit(): void {
    // Escuchamos el evento 'animationend' en el contenedor de la imagen.
    // Esto nos permite saber cuándo ha terminado la animación de rebote.
    this.renderer.listen(this.bannerImageContainer.nativeElement, 'animationend', () => {
      this.imageAnimationFinished = true;
      // Una vez que la imagen se asienta, empezamos a escribir el texto.
      this.startTypingAnimation();
    });
  }

  private startTypingAnimation(): void {
    let charIndex = 0;
    const typingSpeed = 100;

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
}


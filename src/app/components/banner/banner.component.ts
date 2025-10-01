import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {
  // --- Textos para las animaciones ---
  readonly titleText = 'Hola, soy Juan Francisco';
  readonly subtitle1Text = 'Web Developer | Python | JavaScript | Angular';
  readonly subtitle2Text = 'Creando soluciones web eficientes.';

  // --- Propiedades para controlar el estado de las animaciones ---
  displayedTitle = '';
  showSubtitles = false;

  constructor() { }

  ngOnInit(): void {
    this.startTypingAnimation();
  }

  private startTypingAnimation(): void {
    let charIndex = 0;
    const typingSpeed = 125; // Milisegundos por caracter

    const typeCharacter = () => {
      if (charIndex < this.titleText.length) {
        this.displayedTitle += this.titleText.charAt(charIndex);
        charIndex++;
        setTimeout(typeCharacter, typingSpeed);
      } else {
        // Cuando termina de escribir el título, activamos la animación de los subtítulos
        setTimeout(() => {
          this.showSubtitles = true;
        }, 800); // Pequeña pausa antes de mostrar los subtítulos
      }
    };

    typeCharacter();
  }
}
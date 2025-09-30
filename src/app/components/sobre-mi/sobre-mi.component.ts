import { Component, ElementRef, QueryList, ViewChildren, HostListener, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sobre-mi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sobre-mi.component.html',
  styleUrl: './sobre-mi.component.css'
})
export class SobreMiComponent implements AfterViewInit {
  // 1. Usamos @ViewChildren para obtener una LISTA de todos los elementos con #animText
  @ViewChildren('animText') textos!: QueryList<ElementRef>;

  private lastScrollTop = 0;

  // Inyectamos Renderer2, la forma segura de manipular el DOM en Angular
  constructor(private renderer: Renderer2) {}

  @HostListener('window:scroll')
  onWindowScroll() {
    this.triggerSobreMiAnimation();
  }

  ngAfterViewInit() {
    // Disparamos la animación al cargar por si algún elemento ya es visible
    this.triggerSobreMiAnimation();
  }

  private triggerSobreMiAnimation() {
    if (!this.textos) {
      return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollingDown = scrollTop > this.lastScrollTop;

    // 2. Iteramos sobre cada elemento de la lista
    this.textos.forEach(el => {
      const element = el.nativeElement;
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

      if (isVisible) {
        // 3. Usamos Renderer2 para añadir y quitar clases de forma segura
        this.renderer.removeClass(element, 'visible-up');
        this.renderer.removeClass(element, 'visible-down');
        
        const classToAdd = scrollingDown ? 'visible-down' : 'visible-up';
        this.renderer.addClass(element, classToAdd);
      } else {
        this.renderer.removeClass(element, 'visible-up');
        this.renderer.removeClass(element, 'visible-down');
      }
    });

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
}
import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';

interface NavLink {
  id: string;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  readonly links: NavLink[] = [
    { id: 'sobre-mi', label: 'Sobre mí' },
    { id: 'skills', label: 'Skills' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'certificaciones', label: 'Certificaciones' },
    { id: 'galeria', label: 'Galería' },
    { id: 'contactame', label: 'Contacto' },
  ];

  isMenuOpen = false;
  isHeaderHidden = false;
  isScrolled = false;
  activeSection = '';

  private lastScrollTop = 0;
  private observer?: IntersectionObserver;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.classList.toggle('no-scroll', this.isMenuOpen);
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    document.body.classList.remove('no-scroll');
  }

  ngAfterViewInit(): void {
    // "Scroll spy": resalta en el menú la sección que se está viendo
    if (typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) this.activeSection = entry.target.id;
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    // Esperamos un tick para que todas las secciones estén en el DOM
    setTimeout(() => {
      this.links.forEach(link => {
        const section = document.getElementById(link.id);
        if (section) this.observer?.observe(section);
      });
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    this.isScrolled = scrollTop > 20;
    if (scrollTop < 120) this.activeSection = '';

    if (Math.abs(scrollTop - this.lastScrollTop) <= 8) return;
    // Oculta el header al bajar, lo muestra al subir
    this.isHeaderHidden = scrollTop > this.lastScrollTop && scrollTop > 200;
    this.lastScrollTop = Math.max(scrollTop, 0);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 992 && this.isMenuOpen) this.closeMenu();
  }
}

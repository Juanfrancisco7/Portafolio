import { Component, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var Swiper: any;

interface GalleryImage {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.css'
})
export class GaleriaComponent implements AfterViewInit {

  images: GalleryImage[] = [
    { src: 'img/p1.jpg', alt: 'Trabajo 1' }, { src: 'img/g1c.gif', alt: 'Trabajo 2' },
    { src: 'img/a1.jpg', alt: 'Trabajo 3' }, { src: 'img/a3.gif', alt: 'Trabajo 4' },
    { src: 'img/a4.jpg', alt: 'Trabajo 5' }, { src: 'img/a6.gif', alt: 'Trabajo 6' },
    { src: 'img/a5.jpg', alt: 'Trabajo 7' }, { src: 'img/a7.gif', alt: 'Trabajo 8' },
    { src: 'img/a8.jpg', alt: 'Trabajo 9' }, { src: 'img/g5c.gif', alt: 'Trabajo 10' },
    { src: 'img/a10.jpg', alt: 'Trabajo 11' }, { src: 'img/g3.gif', alt: 'Trabajo 12' },
    { src: 'img/a13.jpg', alt: 'Trabajo 13' }, { src: 'img/g4c.gif', alt: 'Trabajo 14' },
    { src: 'img/a14.jpg', alt: 'Trabajo 15' }, { src: 'img/g8.gif', alt: 'Trabajo 16' },
    { src: 'img/p7.jpg', alt: 'Trabajo 17' }, { src: 'img/g9.gif', alt: 'Trabajo 18' },
    { src: 'img/p9.jpg', alt: 'Trabajo 19' }, { src: 'img/g2c.gif', alt: 'Trabajo 20' },
    { src: 'img/p11.jpg', alt: 'Trabajo 21' }, { src: 'img/g10.gif', alt: 'Trabajo 22' },
  ];

  // Propiedades para controlar nuestro lightbox de galería
  currentIndex: number | null = null;

  // Getters para obtener fácilmente las imágenes actual, previa y siguiente
  get currentImage(): GalleryImage | null {
    if (this.currentIndex === null) return null;
    return this.images[this.currentIndex];
  }

  get prevImage(): GalleryImage | null {
    if (this.currentIndex === null) return null;
    const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    return this.images[prevIndex];
  }

  get nextImage(): GalleryImage | null {
    if (this.currentIndex === null) return null;
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    return this.images[nextIndex];
  }

  constructor() { }

  ngAfterViewInit(): void {
    new Swiper('.trabajosSwiper', {
      slidesPerView: 1, spaceBetween: 30, loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 40 },
      }
    });
  }

  // Funciones para nuestro lightbox
  openLightbox(index: number): void {
    this.currentIndex = index;
  }

  closeLightbox(): void {
    this.currentIndex = null;
  }

  // ¡FUNCIÓN RENOMBRADA!
  goToNextImage(): void {
    if (this.currentIndex === null) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  // ¡FUNCIÓN RENOMBRADA!
  goToPrevImage(): void {
    if (this.currentIndex === null) return;
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  // Escuchadores de teclado para una mejor experiencia de usuario
  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    this.closeLightbox();
  }

  // ¡LLAMADA ACTUALIZADA!
  @HostListener('document:keydown.arrowright')
  handleArrowRight(): void {
    this.goToNextImage();
  }

  // ¡LLAMADA ACTUALIZADA!
  @HostListener('document:keydown.arrowleft')
  handleArrowLeft(): void {
    this.goToPrevImage();
  }
}
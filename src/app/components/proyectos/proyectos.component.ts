import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

// Definimos una "plantilla" para la información de cada proyecto
interface Project {
  img: string;
  alt: string;
  text: string;
  rowClass: 'fila-izquierda' | 'fila-derecha';
}

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule], // Necesario para usar *ngIf y [ngClass]
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.css'
})
export class ProyectosComponent {
  // Aquí guardamos la información de todos tus proyectos
  projects: Project[] = [
    {
      img: 'img/111.jpg', alt: 'Proyecto 1', rowClass: 'fila-izquierda',
      text: 'Este fue mi primer proyecto web profesional, desarrollado con una estructura modular utilizando TypeScript y JavaScript para la lógica interactiva. La interfaz fue construida con HTML semántico y estilos personalizados en CSS, aplicando principios de diseño responsivo y buenas prácticas en accesibilidad. Representa el punto de partida en mi camino como desarrollador.'
    },
    {
      img: 'img/222.jpg', alt: 'Proyecto 2', rowClass: 'fila-derecha',
      text: 'Este es mi proyecto personal, una tienda en línea con carrito de compras y diseño responsivo. Desarrollado utilizando técnicas avanzadas que se integrarán próximamente en React, con soporte para base de datos y pasarelas de pago para garantizar una experiencia de usuario optimizada y escalable.'
    },
    {
      img: 'img/333.jpg', alt: 'Proyecto 3', rowClass: 'fila-izquierda',
      text: 'Diseño web personalizado para una empresa de persianas y mosquiteros. Este proyecto fue desarrollado en colaboración con mi equipo de trabajo, ofreciendo una solución a medida para el cliente con un enfoque en la funcionalidad y la estética.'
    },
    {
      img: 'img/444.jpg', alt: 'Proyecto 4', rowClass: 'fila-derecha',
      text: 'Juego interactivo del ahorcado desarrollado utilizando JavaScript puro. Este proyecto incluye una interfaz de usuario dinámica y animaciones en tiempo real, con un sistema de control de puntuación, manejo de intentos y lógica avanzada para gestionar el flujo del juego.'
    },
    // Añade el resto de tus proyectos aquí siguiendo el mismo formato...
     {
      img: 'img/555.jpg', alt: 'Proyecto 5', rowClass: 'fila-izquierda',
      text: 'Tienda en línea especializada en la venta de repuestos Ford, desarrollada con Angular. Esta plataforma emplea componentes reutilizables y un enfoque modular para garantizar un rendimiento óptimo y una experiencia de usuario fluida.'
    },
     {
      img: 'img/666.jpg', alt: 'Proyecto 6', rowClass: 'fila-derecha',
      text: 'Proyecto ExOfera 3.0 en Angular. Plataforma de gestión integral con login, dashboards y múltiples módulos.'
    },
     {
      img: 'img/777.png', alt: 'Proyecto 7', rowClass: 'fila-izquierda',
      text: 'Este fue un proyecto de calculadora creado con React, su función principal es realizar operaciones matemáticas básicas. Utiliza los componentes de React para manejar la lógica y actualizar la interfaz de forma dinámica.'
    },
    {
      img: 'img/888.png', alt: 'Proyecto 8', rowClass: 'fila-derecha',
      text: 'Juego interactivo inspirado en Dragon Ball, desarrollado con HTML, CSS y JavaScript puro, este proyecto combina imágenes, audio y video para crear una experiencia dinámica y envolvente.'
    },
    {
      img: 'img/999.png', alt: 'Proyecto 9', rowClass: 'fila-izquierda',
      text: 'Proyecto de listado de usuarios con Node.js y SQLite, que conecta una base de datos con una aplicación web creada en Node.js usando Express para mostrar un listado de usuarios.'
    },
    {
      img: 'img/101010.png', alt: 'Proyecto 10', rowClass: 'fila-derecha',
      text: 'Pagina web simple en proceso de creacion para un cliente.'
    },
    {
      img: 'img/111111.png', alt: 'Proyecto 11', rowClass: 'fila-izquierda',
      text: 'Página web desarrollada para un cliente con el objetivo de transformar su carta física en un formato digital, accesible mediante un código QR. Este proyecto moderniza la presentación del contenido.'
    }
  ];

  // Propiedades para controlar el Lightbox
  lightboxVisible = false;
  lightboxImage = '';
  lightboxCaption = '';

  // Función para abrir el Lightbox
  openLightbox(project: Project): void {
    this.lightboxVisible = true;
    this.lightboxImage = project.img;
    this.lightboxCaption = project.text;
    // Opcional: añade un estado al historial del navegador para el botón "atrás"
    history.pushState({ lightbox: 'open' }, '');
  }

  // Función para cerrar el Lightbox
  closeLightbox(): void {
    this.lightboxVisible = false;
  }

  // Escucha el evento 'popstate' (cuando el usuario presiona el botón "atrás" del navegador)
  @HostListener('window:popstate')
  onPopState(): void {
    if (this.lightboxVisible) {
      this.closeLightbox();
    }
  }

  // Escucha la tecla 'Escape' para cerrar el Lightbox
  @HostListener('document:keydown.escape')
  onKeydownHandler(): void {
    this.closeLightbox();
  }
}
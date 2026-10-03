import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { LightboxComponent, LightboxItem } from '../lightbox/lightbox.component';
import { JfoodPhoneComponent } from '../jfood-phone/jfood-phone.component';

interface Project {
  title: string;
  img: string;     // imagen optimizada (img/opt/...)
  thumb: string;   // miniatura para la tarjeta
  text: string;
  tags: string[];
  demo?: string;   // 👉 Pon aquí la URL de la web en vivo (si la tienes)
  code?: string;   // 👉 Pon aquí la URL del repositorio de GitHub (si es público)
}

interface Feature {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [RevealDirective, LightboxComponent, JfoodPhoneComponent],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.css'
})
export class ProyectosComponent {

  /* =========================================================
     PROYECTO DESTACADO · J-Food (app Android)
     ========================================================= */
  readonly jfoodFeatures: Feature[] = [
    { icon: 'fa-solid fa-camera', title: 'Foto y listo', text: 'Haces una foto a tu plato y la IA reconoce cada alimento.' },
    { icon: 'fa-solid fa-scale-balanced', title: 'Gramos editables', text: 'Estima los gramos de cada alimento y puedes ajustarlos para recalcular.' },
    { icon: 'fa-solid fa-barcode', title: 'Modo etiqueta', text: 'Lee la tabla nutricional de productos envasados según tu porción.' },
    { icon: 'fa-solid fa-heart-pulse', title: 'Health Connect', text: 'Envía las comidas a la plataforma de salud de Android con un toque.' },
    { icon: 'fa-solid fa-clock-rotate-left', title: 'Historial propio', text: 'Cada comida con foto, fecha y 15 nutrientes guardada en la app.' },
    { icon: 'fa-solid fa-user-group', title: 'Modo compartir', text: 'Familia y amigos pueden usarla y ver sus comidas desde una web.' },
  ];

  readonly jfoodShots: (LightboxItem & { thumb: string })[] = [
    { src: 'img/opt/jfood-principal.webp', thumb: 'img/opt/thumb/jfood-principal.webp', alt: 'J-Food: pantalla principal', caption: 'Pantalla principal: calorías del día, meta y macronutrientes.' },
    { src: 'img/opt/jfood-ajustes.webp', thumb: 'img/opt/thumb/jfood-ajustes.webp', alt: 'J-Food: ajustes', caption: 'Ajustes: perfil, idioma e instrucciones de uso.' },
  ];
  shotIndex: number | null = null;

  /** Stack técnico de J-Food agrupado por capa */
  readonly jfoodStack: { layer: string; icon: string; items: string[] }[] = [
    { layer: 'App Android', icon: 'fa-brands fa-android', items: ['Kotlin', 'Android Studio', 'Health Connect API', 'Cámara y galería (FileProvider)', 'Permisos en tiempo de ejecución', 'Historial local en el dispositivo'] },
    { layer: 'Backend e IA', icon: 'fa-solid fa-server', items: ['Node.js', 'Vercel (funciones serverless)', 'API REST propia', 'Google Gemini AI'] },
    { layer: 'Base de datos', icon: 'fa-solid fa-database', items: ['Redis (Upstash)', 'Datos compartidos entre usuarios'] },
  ];

  /* =========================================================
     RESTO DE PROYECTOS
     ========================================================= */
  readonly projects: Project[] = [
    {
      title: 'MundoJuan · Tienda online',
      img: 'img/opt/222.webp', thumb: 'img/opt/thumb/222.webp',
      text: 'Mi proyecto personal: una tienda en línea con carrito de compras y diseño responsivo, preparada para base de datos y pasarelas de pago.',
      tags: ['E-commerce', 'Responsive', 'JavaScript'],
      demo: 'https://www.mundojuan.com',
    },
    {
      title: 'Tienda de repuestos Ford',
      img: 'img/opt/555.webp', thumb: 'img/opt/thumb/555.webp',
      text: 'Tienda en línea especializada en repuestos Ford con componentes reutilizables y arquitectura modular para un rendimiento óptimo.',
      tags: ['Angular', 'TypeScript', 'E-commerce'],
    },
    {
      title: 'ExOfera 3.0',
      img: 'img/opt/666.webp', thumb: 'img/opt/thumb/666.webp',
      text: 'Plataforma de gestión integral con login, dashboards y múltiples módulos.',
      tags: ['Angular', 'Dashboards', 'Auth'],
    },
    {
      title: 'Carta digital con QR',
      img: 'img/opt/111111.webp', thumb: 'img/opt/thumb/111111.webp',
      text: 'Web para un cliente que transforma su carta física en un formato digital accesible mediante código QR.',
      tags: ['Cliente', 'Mobile first', 'QR'],
    },
    {
      title: 'Juego Dragon Ball',
      img: 'img/opt/888.webp', thumb: 'img/opt/thumb/888.webp',
      text: 'Juego interactivo inspirado en Dragon Ball que combina imágenes, audio y vídeo para una experiencia envolvente.',
      tags: ['HTML', 'CSS', 'JavaScript'],
    },
    {
      title: 'Web para empresa de persianas',
      img: 'img/opt/333.webp', thumb: 'img/opt/thumb/333.webp',
      text: 'Diseño web a medida para una empresa de persianas y mosquiteros, desarrollado en equipo con foco en funcionalidad y estética.',
      tags: ['Cliente', 'Diseño web', 'Equipo'],
    },
    {
      title: 'Listado de usuarios',
      img: 'img/opt/999.webp', thumb: 'img/opt/thumb/999.webp',
      text: 'Aplicación con Node.js y Express conectada a una base de datos SQLite para mostrar un listado de usuarios.',
      tags: ['Node.js', 'Express', 'SQLite', 'SQL'],
    },
    {
      title: 'Juego del Ahorcado',
      img: 'img/opt/444.webp', thumb: 'img/opt/thumb/444.webp',
      text: 'Juego con interfaz dinámica, animaciones en tiempo real, puntuación y control de intentos.',
      tags: ['JavaScript', 'Lógica de juego'],
    },
    {
      title: 'Calculadora en React',
      img: 'img/opt/777.webp', thumb: 'img/opt/thumb/777.webp',
      text: 'Calculadora con operaciones básicas usando componentes de React para manejar la lógica y la interfaz.',
      tags: ['React', 'Componentes'],
    },
    {
      title: 'Mi primer proyecto profesional',
      img: 'img/opt/111.webp', thumb: 'img/opt/thumb/111.webp',
      text: 'Estructura modular con TypeScript y JavaScript, HTML semántico y CSS responsivo. El punto de partida de mi camino como desarrollador.',
      tags: ['TypeScript', 'HTML', 'CSS'],
    },
    {
      title: 'Web para cliente (en proceso)',
      img: 'img/opt/101010.webp', thumb: 'img/opt/thumb/101010.webp',
      text: 'Página web sencilla en desarrollo para un cliente.',
      tags: ['Cliente', 'En progreso'],
    },
  ];

  /** Cuántos proyectos se ven antes de pulsar "Ver todos" */
  readonly initialCount = 6;
  showAll = false;

  get visibleProjects(): Project[] {
    return this.showAll ? this.projects : this.projects.slice(0, this.initialCount);
  }

  // ---- Visor de imágenes ----
  readonly lightboxItems: LightboxItem[] = this.projects.map(p => ({
    src: p.img,
    alt: p.title,
    caption: `${p.title} — ${p.text}`,
  }));
  lightboxIndex: number | null = null;

  open(project: Project): void {
    this.lightboxIndex = this.projects.indexOf(project);
  }
}

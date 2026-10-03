import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

interface Skill {
  name: string;
  icon: string;   // clase de Font Awesome ('' si usamos un logo de texto)
  badge?: string; // texto para logos sin icono (ej. TS)
  area: string;
}

interface Hobby {
  name: string;
  icon: string;
  flip?: boolean;
}

@Component({
  selector: 'app-skills-hobbies',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './skills-hobbies.component.html',
  styleUrl: './skills-hobbies.component.css'
})
export class SkillsHobbiesComponent {
  readonly skills: Skill[] = [
    { name: 'HTML5', icon: 'fa-brands fa-html5', area: 'Frontend' },
    { name: 'CSS3', icon: 'fa-brands fa-css3-alt', area: 'Frontend' },
    { name: 'JavaScript', icon: 'fa-brands fa-square-js', area: 'Frontend' },
    { name: 'TypeScript', icon: '', badge: 'TS', area: 'Frontend' },
    { name: 'Angular', icon: 'fa-brands fa-angular', area: 'Framework' },
    { name: 'React', icon: 'fa-brands fa-react', area: 'Framework' },
    { name: 'Kotlin', icon: '', badge: 'Kt', area: 'Mobile' },
    { name: 'Android', icon: 'fa-brands fa-android', area: 'Mobile' },
    { name: 'Node.js', icon: 'fa-brands fa-node-js', area: 'Backend' },
    { name: 'Python', icon: 'fa-brands fa-python', area: 'Backend' },
    { name: 'SQL', icon: 'fa-solid fa-database', area: 'Base de datos' },
    { name: 'SQLite', icon: 'fa-solid fa-hard-drive', area: 'Base de datos' },
    { name: 'Redis', icon: 'fa-solid fa-layer-group', area: 'Base de datos' },
    { name: 'Vercel', icon: '', badge: '▲', area: 'Cloud / Deploy' },
    { name: 'IA · Gemini', icon: 'fa-solid fa-wand-magic-sparkles', area: 'Inteligencia artificial' },
  ];

  readonly hobbies: Hobby[] = [
    { name: 'Motocross', icon: 'fa-solid fa-motorcycle' },
    { name: '4x4', icon: 'fa-solid fa-car-side' },
    { name: 'Enduro', icon: 'fa-solid fa-motorcycle', flip: true },
    { name: 'Paracaidismo', icon: 'fa-solid fa-parachute-box' },
    { name: 'Snowboard', icon: 'fa-solid fa-person-snowboarding' },
    { name: 'Edición de vídeo', icon: 'fa-solid fa-video' },
    { name: 'Música', icon: 'fa-solid fa-headphones-simple' },
    { name: 'Videojuegos', icon: 'fa-solid fa-gamepad' },
    { name: 'Viajar', icon: 'fa-solid fa-plane-departure' },
  ];
}

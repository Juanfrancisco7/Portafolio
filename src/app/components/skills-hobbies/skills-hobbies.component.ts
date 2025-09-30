import { Component, OnInit } from '@angular/core';

// Le decimos a TypeScript que confíe en que la variable 'AOS' existirá globalmente.
declare var AOS: any;

@Component({
  selector: 'app-skills-hobbies',
  standalone: true,
  imports: [],
  templateUrl: './skills-hobbies.component.html',
  styleUrl: './skills-hobbies.component.css'
})
export class SkillsHobbiesComponent implements OnInit {

  constructor() { }

  // ngOnInit es un "hook" de Angular que se ejecuta una vez cuando el componente está listo.
  // Es el lugar perfecto para inicializar librerías.
  ngOnInit(): void {
    AOS.init();
  }

}
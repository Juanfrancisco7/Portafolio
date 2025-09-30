import { Component, OnInit } from '@angular/core';

// Le decimos a TypeScript que la variable 'AOS' existirá globalmente
declare var AOS: any;

@Component({
  selector: 'app-certificaciones',
  standalone: true,
  imports: [],
  templateUrl: './certificaciones.component.html',
  styleUrl: './certificaciones.component.css'
})
export class CertificacionesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Inicializamos AOS cuando el componente está listo
    AOS.init();
  }

}

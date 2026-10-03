import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { RevealEngineService } from '../services/reveal-engine.service';

/**
 * Directiva appReveal: el elemento aparece "descifrándose" al entrar en pantalla
 * y se vuelve a "cifrar" al salir (al bajar y al subir).
 * Toda la lógica vive en RevealEngineService.
 *
 * Uso:  <div appReveal>...</div>
 *       <div appReveal [revealDelay]="150">...</div>   (retraso en ms al aparecer)
 */
@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input() revealDelay = 0;

  constructor(private el: ElementRef<HTMLElement>, private engine: RevealEngineService) {}

  ngOnInit(): void {
    this.engine.register(this.el.nativeElement, this.revealDelay);
  }

  ngOnDestroy(): void {
    this.engine.unregister(this.el.nativeElement);
  }
}

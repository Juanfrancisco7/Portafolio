import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Un "Subject" es como un canal de radio privado para nuestra app.
  private notificationSubject = new Subject<string>();

  // Otros componentes pueden "escuchar" este canal.
  public notification$ = this.notificationSubject.asObservable();

  // Un componente puede "gritar" un mensaje en este canal.
  notify(event: string) {
    this.notificationSubject.next(event);
  }

  constructor() { }
}

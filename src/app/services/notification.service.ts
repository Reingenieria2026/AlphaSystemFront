import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _has$ = new BehaviorSubject<boolean>(false);

  /** Observable: true si hay notificaciones relevantes */
  readonly hayNotificaciones$: Observable<boolean> = this._has$.asObservable();

  /** Cambia el estado global del “punto rojo” */
  setHayNotificaciones(value: boolean): void {
    this._has$.next(value);
  }

  /** Lectura sincrónica (útil para debug) */
  get current(): boolean {
    return this._has$.value;
  }
}

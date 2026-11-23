import { Component } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false,
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        // fijamos contenedor para que ambos abs. pos.
        query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
        group([
          // fade out
          query(':leave', [
            style({ opacity: 1 }),
            animate('300ms ease-out', style({ opacity: 0 }))
          ], { optional: true }),
          // fade in
          query(':enter', [
            style({ opacity: 0 }),
            animate('300ms ease-out', style({ opacity: 1 }))
          ], { optional: true }),
        ])
      ])
    ])
  ]
})
export class AppComponent {
  title = 'proyectoAlpha';
  prepareRoute(outlet: RouterOutlet) {
    // devuelve el dato “animation” de la ruta activa (o undefined)
    return outlet.activatedRouteData?.['animation'];
  }
}

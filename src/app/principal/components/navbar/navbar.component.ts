import { Component, OnInit } from '@angular/core';
import { LocalstorageService } from '../../../localstorage.service';
import { MessageService } from 'primeng/api';
import { ActivationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';
import { filter } from 'rxjs/operators';
import { HttpLaravelService } from '../../../acceso/services/http.service';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';


export interface User {
  idUsr: number;
  nombreUsr: string;
  apellidoP: string;
  apellidoM?: string;
  fotoUsr: string;
  correoUsr: string;
  contrasena: string;
  idTipoUsr: number;
  idEstadoUsr: number;
  token?: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
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
    ]),

    // animación fadeInOut para el mensaje del gato
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
  
})
export class NavbarComponent implements OnInit {

  user: User | null = null;
  items: any[] = [];
  searchTerm: string = '';

  options: AnimationOptions = {
    path: 'assets/cargar.json', 
    loop: true,
    autoplay: true
  };

  gato: AnimationOptions = {
    path: 'assets/cat.json', 
    loop: true,
    autoplay: true
  };

  logoutInProgress = false;

  mensajes: string[] = [
  'Tip: Recuerda devolver los libros antes de su fecha límite para evitar multas.',
  '¿Sabías que puedes ver tu historial de préstamos en tu perfil?',
  'Multas activas impiden nuevos préstamos. ¡Paga a tiempo!',
  'No olvides revisar la sinopsis antes de elegir un libro.',
  'Puedes tomar prestado un libro hasta por 30 días. Después se activa la multa.',
  'Tip: Usa el buscador para encontrar libros por título, autor o ISBN.',
  '¿Te gustó un libro? Recomiéndalo en tu próxima visita.',
  'Alpha System registra todos tus préstamos de forma segura.',
  'Consejo: Si un libro no está disponible, revisa en unos días. ¡Puede volver!',
  '¿Ya viste las nuevas funciones? Prueba los filtros de géneros y estado del libro.',
  'Miau',
  'Meow',
];
  mensajeActual: string = '';
  visible: boolean = false;
  letraMostrada: string = '';
  typingInterval: any;

 

constructor(private localStorage: LocalstorageService, private messageService: MessageService, private router: Router, private httpService: HttpLaravelService) {}

save(severity: string) {
        this.messageService.add({ severity: severity, summary: 'Success', detail: 'Data Saved' });
    }

    update() {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'En desarrollo' });
    }

    delete() {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data Deleted' });
    }

  
  
    ngOnInit() {
      // Recupera los datos del usuario desde localStorage
      const userData = this.localStorage.getItem('userData');
      if (userData) {
        this.user = userData ? JSON.parse(userData) : null;
      }

      if(this.user && this.user.idTipoUsr == 1) {
        this.items = [
          {
              label: 'Gestor de Biblioteca',
              routerLink: ['/admin']
          },
          {
              label: 'Perfil',
              routerLink: ['/admin/commingsoon']
          },
          { separator: true },
          { 
              label: 'Cerrar sesión', 
              command: () => this.logout(),
              routerLink: ['/']
          }
        ];
      } else if (this.user && this.user.idTipoUsr == 2){
        this.items = [
          {
              label: 'Gestor de Usuario',
              command: () => {
                  this.update();
              }
          },
          { separator: true },
          { 
              label: 'Cerrar sesión', 
              command: () => this.logout()
          }
        ];
      }
      if (typeof window !== 'undefined') {
  this.iniciarCicloMensajes();
}

    }

    logout() {
  this.logoutInProgress = true;

  this.httpService.logout().subscribe({
    next: (res: any) => {
      const msg = res.message || 'Sesión cerrada';
      this.localStorage.clean();
      this.user = null; 

      this.messageService.add({
        severity: 'success',
        summary: 'Logout',
        detail: msg,
      });

      this.logoutInProgress = false;
this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
  this.router.navigate([this.router.url]);
});
    },
    error: (err) => {
      this.localStorage.clean();
      this.user = null;  
      this.messageService.add({
        severity: 'success',
        summary: 'Logout exitoso',
        detail: 'Tu sesión local ha sido cerrada.',
      });

      this.logoutInProgress = false;
      location.reload(); // Refresca la página actual
    }
  });
}

  search() {
    const q = this.searchTerm.trim();
    if (q) {
      // Navega a /catalogo/buscar/:busqueda
      this.router.navigate(['/catalogo', 'buscar', q]);
    } else {
      // Si está vacío, llévalo al listado completo
      this.router.navigate(['/catalogo']);
    }
  }
    

mostrarMensajeAleatorio(): void {
  const mensaje = this.mensajes[Math.floor(Math.random() * this.mensajes.length)];
  if (!mensaje) return;

  console.log('Mostrando mensaje:', mensaje);

  this.letraMostrada = '';
  this.mensajeActual = mensaje;
  this.visible = true;

  let i = 0;

  this.typingInterval = setInterval(() => {
    if (i < mensaje.length) {
      this.letraMostrada += mensaje.charAt(i);
      i++;
    } else {
      clearInterval(this.typingInterval);
      setTimeout(() => this.ocultarMensaje(), 5000); // 5 segundos visible
    }
  }, 50);
}

  ocultarMensaje(): void {
    this.visible = false;
    this.letraMostrada = '';
  }

  obtenerTiempoRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  iniciarCicloMensajes(): void {
  const delay = this.obtenerTiempoRandom(30000, 60000); 

  setTimeout(() => {
    if (!this.visible) {
      try {
        this.mostrarMensajeAleatorio();
      } catch (e) {
        console.error('Error mostrando mensaje:', e);
      }
    }

    this.iniciarCicloMensajes();
  }, delay);
}


  }

  

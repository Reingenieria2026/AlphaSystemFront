import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, NgZone  } from '@angular/core';
import { LocalstorageService } from '../../../localstorage.service';
import { HttpLaravelService } from '../../../acceso/services/http.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { interval, Subscription } from 'rxjs';


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
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {

  user: User | null = null;
  logoutInProgress = false;
  ahora = new Date();

  timeString = '';
  private sub!: Subscription;

  constructor(private router: Router,private localStorage: LocalstorageService,private messageService: MessageService, private httpService: HttpLaravelService, private cd: ChangeDetectorRef,
    private ngZone: NgZone) {}

   options: AnimationOptions = {
      path: 'assets/cargar.json', 
      loop: true,
      autoplay: true
    };

  ngOnInit() {
    // Cargar el usuario desde el localStorage al iniciar
    const userData = this.localStorage.getItem('userData');
      if (userData) {
        this.user = userData ? JSON.parse(userData) : null;
      }
    
    this.ngZone.runOutsideAngular(() => {
      this.sub = interval(1000).subscribe(() => {
        const now = new Date();
        // Formateo en español sin cargar locale de Angular
        this.timeString = now.toLocaleString('es-MX', {
          weekday: 'long',
          day:     'numeric',
          month:   'long',
          year:    'numeric',
          hour:    '2-digit',
          minute:  '2-digit'
        });
        // Sólo vuelve a Angular para actualizar este componente
        this.ngZone.run(() => this.cd.markForCheck());
      });
    });

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }


  borrarUsuario() {
    console.log('Logout clicked');
      this.httpService.logout().subscribe({
        next: (res: any) => {
          console.log('Logout response:', res);
          // El backend te devuelve { message: 'Sesión cerrada' }
          const msg = res.message || 'Sesión cerrada';
    
          // Limpia el storage
          this.localStorage.clean();
    
          // Muestra el toast con el mensaje del servidor
          this.messageService.add({
            severity: 'success',
            summary: 'Logout',
            detail: msg
          });
    
          // Redirige al login
          this.router.navigate(['/login']);
        },
        error: (err) => {
          // Aunque falle la llamada, igual cerramos sesión localmente
          this.localStorage.clean();
          this.messageService.add({
            severity: 'warn',
            summary: 'Logout parcial',
            detail: 'No se pudo contactar al servidor, pero tu sesión local ha sido cerrada.'
          });
          this.router.navigate(['/login']);
        }
      });
  }

  esRutaLibroActiva(): boolean {
  return this.router.url.includes('/admin/lista-libros') || 
         this.router.url.includes('/admin/libro') || 
         this.router.url.includes('/admin/app-crear-libro');
  }
  esRutaUsuarioActiva(): boolean {
    return this.router.url.includes('/admin/lista-usuarios') || 
           this.router.url.includes('/admin/usuario') || 
           this.router.url.includes('/admin/crear-usuario');
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



}

import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalstorageService } from '../../../localstorage.service';
import { HttpLaravelService } from '../../../acceso/services/http.service';
import { ApiService } from '../../../services/laravel.service';
import { NotificationService } from '../../../services/notification.service';
import { MessageService } from 'primeng/api';
import { Subscription, interval } from 'rxjs';
import { AnimationOptions } from 'ngx-lottie';

export interface User {
  idUsr: number;
  nombreUsr: string;
  apellidoP: string;
  apellidoM?: string;
  fotoUsr?: string | null;
  correoUsr: string;
  contrasena: string;
  idTipoUsr: number;
  idEstadoUsr: number;
  token?: string;
}

@Component({
  selector: 'app-navbar-usuario',
  standalone: false,
  templateUrl: './navbar-usuario.component.html',
  styleUrls: ['./navbar-usuario.component.scss']
})
export class NavbarUsuarioComponent implements OnInit, OnDestroy {
  user: User | null = null;
  logoutInProgress = false;

  timeString = '';
  options: AnimationOptions = { path: 'assets/cargar.json', loop: true, autoplay: true };

  hasNotifications = false;
  unreadCount = 0;

  private timeSub?: Subscription;
  private notifStateSub?: Subscription;
  private notifPollSub?: Subscription;

  constructor(
    private router: Router,
    private localStorage: LocalstorageService,
    private messageService: MessageService,
    private httpService: HttpLaravelService,
    private api: ApiService,
    private notif: NotificationService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Cargar usuario desde LocalStorage
    try {
      const raw = this.localStorage.getItem('userData');
      this.user = raw ? JSON.parse(raw) as User : null;
    } catch {
      this.user = null;
    }

    // Reloj en vivo
    this.ngZone.runOutsideAngular(() => {
      this.timeSub = interval(1000).subscribe(() => {
        const now = new Date();
        this.timeString = now.toLocaleString('es-MX', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        this.ngZone.run(() => this.cd.markForCheck());
      });
    });

    // Escuchar estado global de notificaciones (por si otro componente lo actualiza)
    this.notifStateSub = this.notif.hayNotificaciones$.subscribe(flag => {
      this.hasNotifications = flag;
      this.cd.markForCheck();
    });

    // Polling propio del navbar (independiente de otras vistas)
    if (this.user?.idUsr) {
      this.startNotifPolling();
    }
  }

  ngOnDestroy(): void {
    this.timeSub?.unsubscribe();
    this.notifStateSub?.unsubscribe();
    this.notifPollSub?.unsubscribe();
  }

  // ----- Notificaciones -----
  private startNotifPolling(): void {
    this.ngZone.runOutsideAngular(() => {
      // primera consulta inmediata
      this.fetchNotifications();
      // cada 30s
      this.notifPollSub = interval(30000).subscribe(() => this.fetchNotifications());
    });
  }

  private fetchNotifications(): void {
    const id = this.user?.idUsr;
    if (!id) return;

    this.api.getPrestamos().subscribe({
      next: (res: any) => {
        if (res?.estatus !== 1) {
          this.setNotifState(0);
          return;
        }

        const all = res.data || [];
        const userLoans = all.filter((p: any) => p.idUsuario === id && p.devuelto === 0);

        const hoy = new Date();
        const relevantes = userLoans.filter((p: any) => {
          const fechaEntrega = new Date(p.fechaEntrega);
          const diasRestantes = Math.ceil((fechaEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
          const tieneMulta = (p.multa ?? 0) > 0;
          // criterio: faltan ≤ 2 días, ya venció, o tiene multa
          return diasRestantes <= 31 || tieneMulta;
        });

        this.setNotifState(relevantes.length);
      },
      error: () => this.setNotifState(0)
    });
  }

  private setNotifState(count: number): void {
    this.unreadCount = count;
    this.hasNotifications = count > 0;
    // sincroniza estado global para otros componentes
    this.notif.setHayNotificaciones(this.hasNotifications);
    this.ngZone.run(() => this.cd.markForCheck());
  }

  // ----- Logout -----
  logout(): void {
    this.logoutInProgress = true;

    this.httpService.logout().subscribe({
      next: (res: any) => {
        const msg = res?.message || 'Sesión cerrada';
        this.localStorage.clean();
        this.user = null;
        this.notif.setHayNotificaciones(false);
        this.messageService.add({ severity: 'success', summary: 'Logout', detail: msg });
        this.logoutInProgress = false;

        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([this.router.url]);
        });
      },
      error: () => {
        this.localStorage.clean();
        this.user = null;
        this.notif.setHayNotificaciones(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Logout exitoso',
          detail: 'Tu sesión local ha sido cerrada.'
        });
        this.logoutInProgress = false;
        location.reload();
      }
    });
  }

  // (Opcional) helpers de rutas admin que ya tenías
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
}

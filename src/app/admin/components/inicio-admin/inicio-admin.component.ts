import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/laravel.service';
import { LocalstorageService } from '../../../localstorage.service';
import { Prestamo } from '../../../../models/alphaSystem.models';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { AnimationOptions } from 'ngx-lottie';
import { Usuario } from '../../../../models/alphaSystem.models';
import { Libro } from '../../../../models/alphaSystem.models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

interface PrestamoWithRelations extends Prestamo {
  usuario: { nombreUsr: string; apellidoP: string };
  libro: { titulo: string };
}

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
  selector: 'app-inicio-admin',
  standalone: false,
  templateUrl: './inicio-admin.component.html',
  styleUrl: './inicio-admin.component.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('500ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ]),
      transition(':leave', [
        animate('500ms ease-in',
          style({ opacity: 0, transform: 'translateY(-20px)' })
        )
      ])
    ]),
    trigger('fadeSimple', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in',
          style({ opacity: 1 })
        )
      ]),
      transition(':leave', [
        animate('400ms ease-out',
          style({ opacity: 0 })
        )
      ])
    ])
  ]
})
export class InicioAdminComponent implements OnInit {
  defaultAvatar = '../../../../assets/user_icon.png';
  fullName: string = '';
  profileImage: string = this.defaultAvatar;
  user: User | null = null;
  users: Usuario[] = [];
  libros: Libro[] = [];
  totalUsuarios: number = 0;
  totalLibrosPrestados: number = 0;
  totalLibrosDisponibles: number = 0;
  totalDeudas: number = 0;
  prestamos!: [];
  deudas!: [];
  selectedPrestamoId: number | null = null;
  isLoadingMetrics = true;
  isLoadingPrestamosList = true;

  pendingPrestamos: PrestamoWithRelations[] = [];
  debtPrestamos: PrestamoWithRelations[] = [];

  gatoParado: AnimationOptions = {
      path: 'assets/catStanding.json', 
      loop: true,
      autoplay: true
  };

  spinner: AnimationOptions = {
    path: 'assets/spinner.json', 
    loop: true,
    autoplay: true
  };
  
  constructor(
    private api: ApiService,
    private localStorage: LocalstorageService,
    private msg: MessageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadPrestamos();
    this.obtenerUsuarios();
    this.obtenerLibros();
    this.loadMetrics(); 
    this.loadPrestamosList();
  }

  private loadUser(): void {
    const raw = this.localStorage.getItem('userData');
    if (!raw) return;

    const user = JSON.parse(raw);
    this.user = JSON.parse(raw)
    console.log('User data:', user);
    this.fullName = `${user.nombreUsr} ${user.apellidoP} ${user.apellidoM}`;
    // Si el backend guarda la ruta de la foto en user.fotoUsr:
    if (user.fotoUsr !== null ) {
      this.profileImage = "http://localhost:8000/storage/" + user.fotoUsr;
    }
  }

  private loadPrestamosList(): void {
  this.isLoadingPrestamosList = true;
  this.api.getPrestamos().subscribe({
    next: res => {
      if (res.estatus === 1 && Array.isArray(res.data)) {
        this.debtPrestamos = res.data
        .filter((p: any) => Number(p?.multa ?? 0) > 0 && p.devuelto !== 1)
        .slice(0, 4);
      }
      this.isLoadingPrestamosList = false;
    },
    error: err => {
      console.error('Error cargando préstamos:', err);
      this.isLoadingPrestamosList = false;
    }
  });
}

  private loadPrestamos(): void {
  this.api.getPrestamos().subscribe((res: any) => {
    if (res.estatus !== 1) return;

    const all: PrestamoWithRelations[] = res.data;
    // Préstamos aún no devueltos y sin multa:
    this.pendingPrestamos = all.filter(p =>
      !this.esDevuelto(p) && Number(p?.multa ?? 0) === 0
    );
    // Préstamos con multa pendiente (deudas):
    this.debtPrestamos = all.filter(p =>
      Number(p?.multa ?? 0) > 0 && !this.esDevuelto(p)
    );
  });
}

private obtenerUsuarios(): void{
  this.api.getUsuarios().subscribe({
        next: (res: any) => {
          if (res.estatus === 1) {
            this.users = res.data as Usuario[]; // asigna array
            console.log('Usuarios obtenidos:', this.users);
          } else {
            console.error('Error al obtener usuarios:', res.mensaje);
          }
        },
        error: err => {
          console.error('Error de red al cargar usuarios:', err);
        }
      });
}

obtenerLibros(): void {
    this.api.getLibros().subscribe({
      next: res => {
        this.libros = res.data || res;
        console.log('Libros obtenidos:', this.libros);
      },
      error: () => {
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la lista de libros.'
        });
      }
    });
  }

  private loadMetrics(): void {
    this.isLoadingMetrics = true;
  this.api.getMetrics().subscribe({
    next: (res: any) => {
      if (res.estatus === 1 && res.data) {
        this.totalUsuarios        = res.data.totalUsuarios;
        this.totalLibrosDisponibles = res.data.totalLibrosDisponibles;
        this.totalLibrosPrestados  = res.data.totalLibrosPrestados;
        this.totalDeudas           = res.data.totalDeudas;
      }
      this.isLoadingMetrics = false;
    },
    error: err => {
      console.error('Error cargando métricas:', err);
      this.isLoadingMetrics = false;
    }
  });
}

goToPrestamo(id: number): void {
    this.selectedPrestamoId = id;
    this.router.navigate(['/admin/detalles-prestamo', id]);
  }

  private esDevuelto(p: any): boolean {
  const v = p?.devuelto;
  return v === true || v === 1 || v === '1';
}
  
  }
  
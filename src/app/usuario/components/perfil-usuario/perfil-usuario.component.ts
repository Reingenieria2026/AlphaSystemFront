import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/laravel.service';
import { LocalstorageService } from '../../../localstorage.service';
import { Prestamo } from '../../../../models/alphaSystem.models';
import { Router } from '@angular/router';

// Animaciones y Lottie (como en admin)
import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';
import { AnimationOptions } from 'ngx-lottie';
import { MessageService } from 'primeng/api';

interface PrestamoWithRelations extends Prestamo {
  usuario: { nombreUsr: string; apellidoP: string };
  libro: { titulo: string };
}

@Component({
  selector: 'app-perfil-usuario',
  standalone: false,
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.scss'],
  animations: [
    trigger('fadeSimple', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PerfilUsuarioComponent implements OnInit {
  // Perfil
  defaultAvatar = '../../../../assets/user_icon.png';
  fullName: string = '';
  profileImage: string = this.defaultAvatar;
  rol: string = '';
  idUsuario: number = 0;

  // Métrica de lectura
  numeroDeLibrosLeidos: number = 0;

  // Listas
  pendingPrestamos: PrestamoWithRelations[] = [];
  debtPrestamos: PrestamoWithRelations[] = [];

  // UI state (como admin)
  selectedPrestamoId: number | null = null;
  isLoadingPrestamosList: boolean = true;

  // Lottie spinner (usa el mismo asset que en admin)
  spinner: AnimationOptions = {
    path: 'assets/spinner.json',
    loop: true,
    autoplay: true
  };

  constructor(
    private api: ApiService,
    private localStorage: LocalstorageService,
    private router: Router,
    private msg: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadPrestamos();
  }

  private loadUser(): void {
    const raw = this.localStorage.getItem('userData');
    if (!raw) return;

    const user = JSON.parse(raw);
    this.idUsuario = user.idUsr;
    this.fullName = `${user.nombreUsr} ${user.apellidoP} ${user.apellidoM ?? ''}`.trim();
    this.rol = user.nombreTipo ?? 'Usuario';

    if (user.fotoUsr) {
      this.profileImage = `http://localhost:8000/storage/${user.fotoUsr}`;
    }
  }

  private loadPrestamos(): void {
    this.isLoadingPrestamosList = true;

    this.api.getPrestamos().subscribe({
      next: (res: any) => {
        if (res.estatus !== 1 || !Array.isArray(res.data)) {
          this.isLoadingPrestamosList = false;
          return;
        }

        const all: PrestamoWithRelations[] = res.data;
        const userLoans = all.filter(p => p.idUsuario === this.idUsuario);

        this.pendingPrestamos = userLoans.filter(p =>
          p.devuelto === 0 && (p.multa ?? 0) === 0
        );


        // Libros leídos = préstamos devueltos
        this.numeroDeLibrosLeidos = userLoans.filter(p => p.devuelto === 1).length;

        this.isLoadingPrestamosList = false;
      },
      error: err => {
        console.error('Error cargando préstamos:', err);
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar tus préstamos.'
        });
        this.isLoadingPrestamosList = false;
      }
    });
  }

  goToPrestamo(id: number): void {
    this.selectedPrestamoId = id;
    // Ruta de usuario (solo lectura)
    this.router.navigate(['/usuario/detalles-prestamo', id]);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/perfilGato.png';
  }

  getMascotaUrl(leidos: number): string {
    if (leidos === 0) {
      return 'https://i.pinimg.com/originals/b0/9e/26/b09e26e1606cbbd48544b7647990478b.gif';
    } else if (leidos <= 5) {
      return 'https://i.pinimg.com/originals/d6/f0/66/d6f066135569003d54122967dad078a4.gif';
    } else if (leidos <= 10) {
      return 'https://i.pinimg.com/originals/4f/45/4c/4f454c1341a7c4e171f1946187e64021.gif';
    } else if (leidos <= 15) {
      return 'https://i.pinimg.com/originals/ac/47/81/ac478110bb7572eb31d8e7c323decef3.gif';
    } else if (leidos <= 20) {
      return 'https://i.pinimg.com/originals/99/1b/48/991b488e390ba8dbeeb285149129a41b.gif';
    } else {
      return 'https://i.pinimg.com/originals/99/75/ec/9975ec55b726191ab2ceacdea18e916c.gif';
    }
  }

  calcularPorcentajeLectura(): number {
    const meta = 100;
    const porcentaje = (this.numeroDeLibrosLeidos / meta) * 100;
    return porcentaje > 100 ? 100 : porcentaje;
  }
}

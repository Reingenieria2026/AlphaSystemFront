import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../../services/laravel.service';
import { Prestamo } from '../../../../models/alphaSystem.models';
import { LocalstorageService } from '../../../localstorage.service';
import { NotificationService } from '../../../services/notification.service';

interface Notificacion {
  titulo: string;
  diasRestantes: number;
  fechaEntrega: string;
}

interface PrestamoWithRelations extends Prestamo {
  usuario: { nombreUsr: string; apellidoP: string };
  libro: { titulo: string };
}

@Component({
  selector: 'app-lista-libros',
  standalone: false,
  templateUrl: './lista-libros.component.html',
  styleUrls: ['./lista-libros.component.scss']
})
export class ListaLibrosComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  idUsuario: number = 0;

  defaultAvatar = '../../../../assets/user_icon.png';
  fullName: string = '';
  profileImage: string = this.defaultAvatar;
  rol: string = '';
  numeroDeLibrosLeidos: number = 0;

  pendingPrestamos: PrestamoWithRelations[] = [];
  debtPrestamos: PrestamoWithRelations[] = [];

  constructor(
    private api: ApiService,
    private msg: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private localStorage: LocalstorageService,
    private notif: NotificationService
  ) {}

  ngOnInit(): void {
    // 1) Obtener usuario primero
    const user = JSON.parse(this.localStorage.getItem('userData') || '{}');
    this.idUsuario = user?.idUsr || 0;

    // (Opcional) setear nombre/imagen si quieres mostrarlos aquí
    this.fullName = [user?.nombreUsr, user?.apellidoP].filter(Boolean).join(' ');
    this.profileImage = user?.fotoUsr
      ? `http://localhost:8000/storage/${user.fotoUsr}`
      : this.defaultAvatar;

    // 2) Ya con idUsuario, cargar préstamos y notificaciones
    this.loadPrestamos();
    this.cargarNotificaciones();
  }

  private cargarNotificaciones(): void {
    this.api.getPrestamos().subscribe((res: any) => {
      if (res?.estatus !== 1) {
        this.notif.setHayNotificaciones(false);
        return;
      }

      const prestamosFiltrados = (res.data || []).filter((p: any) =>
        p.idUsuario === this.idUsuario && p.devuelto === 0
      );

      const hoy = new Date();
      this.notificaciones = prestamosFiltrados.map((p: any) => {
        const fechaEntrega = new Date(p.fechaEntrega);
        const diffMs = fechaEntrega.getTime() - hoy.getTime();
        const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return {
          titulo: p.libro?.titulo || 'Libro desconocido',
          diasRestantes,
          fechaEntrega: p.fechaEntrega
        };
      });

      // 🔔 Manda el estado al navbar: muestra punto rojo si quedan ≤ 2 días (o ya venció)
      const hay = this.notificaciones.some(n => n.diasRestantes <= 2);
      this.notif.setHayNotificaciones(hay);
    });
  }

  private loadPrestamos(): void {
    this.api.getPrestamos().subscribe((res: any) => {
      if (res?.estatus !== 1) return;

      const all: PrestamoWithRelations[] = res.data || [];
      const userLoans = all.filter(p => p.idUsuario === this.idUsuario);

      this.pendingPrestamos = userLoans.filter(p =>
        p.devuelto === 0 && (p.multa ?? 0) === 0
      );

      this.debtPrestamos = userLoans.filter(p =>
        (p.multa ?? 0) > 0
      );

      // Libros leídos = préstamos devueltos
      this.numeroDeLibrosLeidos = userLoans.filter(p => p.devuelto === 1).length;
    });
  }

  getMascotaUrl(leidos: number): string {
    if (leidos === 0) {
      return 'https://i.pinimg.com/originals/b0/9e/26/b09e26e1606cbbd48544b7647990478b.gif'; // 💤
    } else if (leidos <= 5) {
      return 'https://i.pinimg.com/originals/d6/f0/66/d6f066135569003d54122967dad078a4.gif'; // 👀
    } else if (leidos <= 10) {
      return 'https://i.pinimg.com/originals/4f/45/4c/4f454c1341a7c4e171f1946187e64021.gif'; // 📖
    } else if (leidos <= 15) {
      return 'https://i.pinimg.com/originals/ac/47/81/ac478110bb7572eb31d8e7c323decef3.gif'; // 😺
    } else if (leidos <= 20) {
      return 'https://i.pinimg.com/originals/99/1b/48/991b488e390ba8dbeeb285149129a41b.gif'; // 🤪
    } else {
      return 'https://i.pinimg.com/originals/99/75/ec/9975ec55b726191ab2ceacdea18e916c.gif'; // 🥋
    }
  }
}

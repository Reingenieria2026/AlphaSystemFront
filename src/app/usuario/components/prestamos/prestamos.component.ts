import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/laravel.service';
import { Prestamo } from '../../../../models/alphaSystem.models';
import { LocalstorageService } from '../../../localstorage.service';
import { MessageService } from 'primeng/api';

interface PrestamoWithRelations extends Prestamo {
  libro: { titulo: string; autor: string; fotoUsr: string | null };
}

// Alias de tipo reutilizable
type LibroPrestadoUnico = {
  titulo: string;
  autor: string;
  fotoUsr: string | null;
};

@Component({
  selector: 'app-usuario-prestamos',
  templateUrl: './prestamos.component.html',
  styleUrls: ['./prestamos.component.scss'],
  standalone: false,
})
export class PrestamosComponent implements OnInit {
  // Paleta (por si reutilizas en TS)
  

  // En prod, usa environment.apiBase
  private readonly API_BASE = 'http://localhost:8000';

  fullName = '';
  profileImage = 'assets/user_icon.png';
  rol = '';
  idUsuario = 0;

  loading = true;
  busqueda = '';

  // Lista única de libros prestados
  librosPrestadosUnicos: LibroPrestadoUnico[] = [];

  // Lista filtrada para la vista
  get librosFiltrados(): LibroPrestadoUnico[] {
    const term = this.busqueda.trim().toLowerCase();
    if (!term) return this.librosPrestadosUnicos;
    return this.librosPrestadosUnicos.filter((l) =>
      (l.titulo || '').toLowerCase().includes(term) ||
      (l.autor || '').toLowerCase().includes(term)
    );
  }

  constructor(
    private api: ApiService,
    private msg: MessageService,
    private localStorage: LocalstorageService
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
    this.fullName = `${user.nombreUsr} ${user.apellidoP} ${user.apellidoM}`;
    this.rol = user.nombreTipo ?? 'Usuario';

    if (user.fotoUsr) {
      this.profileImage = this.buildStorageUrl(user.fotoUsr);
    }
  }

  private loadPrestamos(): void {
    this.loading = true;
    this.api.getPrestamos().subscribe({
      next: (res: any) => {
        if (res?.estatus !== 1 || !Array.isArray(res.data)) {
          this.loading = false;
          return;
        }

        const all: PrestamoWithRelations[] = res.data;
        const userLoans = all.filter((p) => p.idUsuario === this.idUsuario);

        const seen = new Set<string>();
        const uniques: LibroPrestadoUnico[] = [];

        for (const prestamo of userLoans) {
          const libro = prestamo.libro;
          // Importante: idLibro es el ISBN (string) según tu modelo
          const clave = String(prestamo.idLibro ?? '');
          if (libro && clave && !seen.has(clave)) {
            seen.add(clave);
            uniques.push({
              titulo: libro.titulo,
              autor: libro.autor,
              fotoUsr: libro.fotoUsr ?? null,
            });
          }
        }

        this.librosPrestadosUnicos = uniques;
        this.loading = false;
      },
      error: () => {
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar tus préstamos.',
        });
        this.loading = false;
      },
    });
  }

  /** Convierte ruta relativa a absoluta del storage */
  private buildStorageUrl(path: string): string {
    if (!path) return 'assets/book_icon.png';
    if (/^https?:\/\//i.test(path)) return path;
    const clean = path.split('/').map(encodeURIComponent).join('/');
    return `${this.API_BASE}/storage/${clean}`;
  }

  /** URL final de portada con fallback */
  coverUrl(fotoUsr: string | null): string {
    return fotoUsr ? this.buildStorageUrl(fotoUsr) : 'assets/book_icon.png';
  }

  /** Fallback si la imagen falla */
  replaceWithFallback(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img) img.src = 'assets/book_icon.png';
  }
}

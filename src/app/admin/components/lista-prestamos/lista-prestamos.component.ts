// lista-prestamos.component.ts
// import { Component, OnInit } from '@angular/core';
// import { MenuItem, SelectItem } from 'primeng/api';
// import { ApiService } from '../../../services/laravel.service';
// import { Prestamo } from '../../../../models/alphaSystem.models';

// interface PrestamoWithRelations extends Prestamo {
//   usuario: { nombreUsr: string; apellidoP: string; correoUsr: string };
//   libro: { titulo: string };
// }

// @Component({
//   selector: 'app-lista-prestamos',
//   templateUrl: './lista-prestamos.component.html',
//   styleUrls: ['./lista-prestamos.component.scss'],
//   standalone: false,
// })
// export class ListaPrestamosComponent implements OnInit {
//   prestamos: PrestamoWithRelations[] = [];
//   filteredPrestamos: PrestamoWithRelations[] = [];

//   // Filtro de estado: 'all' | 'delivered' | 'notDelivered' | 'debt'
//   filterMode: string = 'all';
//   searchTerm: string = '';
//   private searchTimeout: any;
//   dateSortMode: string = 'recent';

//   // Opciones de pestañas (puedes personalizar labels)
//   menuItems: MenuItem[] = [
//     { label: 'Préstamos' },
//     { label: 'Filtros' }
//   ];

//   // Para radio en filtros:
//   statusOptions: SelectItem[] = [
//     { label: 'Todos', value: 'all' },
//     { label: 'Entregados', value: 'delivered' },
//     { label: 'No entregados', value: 'notDelivered' },
//     { label: 'Con deuda', value: 'debt' }
//   ];

//   dateSortOptions: SelectItem[] = [    // <- nuevas opciones
//     { label: 'Más recientes', value: 'recent' },
//     { label: 'Más antiguos', value: 'oldest' }
//   ];

//   constructor(private api: ApiService) {}

//   ngOnInit(): void {
//     this.api.getPrestamos().subscribe((res: any) => {
//       if (res.estatus === 1) {
//         console.log('Préstamos cargados:', res.data);
        
//         // Se asume que el backend devuelve usuario y libro embebidos
//         this.prestamos = res.data as PrestamoWithRelations[];
//         this.applyFilters();
//       } else {
//         console.error('Error al cargar préstamos:', res.mensaje);
//       }
//     });
//   }

//   onSearchChange(event: any): void {
//     clearTimeout(this.searchTimeout);
//     this.searchTimeout = setTimeout(() => this.applyFilters(), 500);
//   }

//   onFilterChange(mode: string): void {
//     this.filterMode = mode;
//     this.applyFilters();
//   }

//   applyFilters(): void {
//     let temp = [...this.prestamos];

//     // 1) Filtrar por estado
//     if (this.filterMode === 'delivered') {
//       temp = temp.filter(p => p.devuelto === 1);
//     } else if (this.filterMode === 'notDelivered') {
//       temp = temp.filter(p => p.devuelto === 0);
//     } else if (this.filterMode === 'debt') {
//       temp = temp.filter(p => (p.multa ?? 0) > 0);
//     }

//     // 2) Buscar por ID, nombre o correo
//     const term = this.searchTerm.trim().toLowerCase();
//     if (term) {
//       temp = temp.filter(p =>
//         p.idPrestamo.toString().includes(term) ||
//         `${p.usuario.nombreUsr} ${p.usuario.apellidoP}`.toLowerCase().includes(term) ||
//         p.usuario.correoUsr.toLowerCase().includes(term)
//       );
//     }

//     temp.sort((a, b) => {
//       const da = new Date(a.fechaPrestamo).getTime();
//       const db = new Date(b.fechaPrestamo).getTime();
//       return this.dateSortMode === 'recent' ? db - da : da - db;
//     });

//     this.filteredPrestamos = temp;
//   }
// }
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../../services/laravel.service';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

type EstadoKey = 'entregado' | 'pendiente' | 'deuda';

interface PrestamoRow {
  idPrestamo: number;
  fechaPrestamo: string;
  fechaEntrega: string;
  multa: number;
  devuelto: number;

  libroIsbn: string;
  libroTitulo: string;

  groupKey: number;     // idUsr
  groupName: string;    // "Nombre Apellido"
  groupEmail: string;   // correo
  groupAvatar?: string; // opcional

  // derivados
  multaFlag: 0 | 1; // 0 = sin multa, 1 = con multa
  estadoKey: EstadoKey;
  estadoLabel: string;
  estadoSeverity: 'success' | 'warning' | 'danger' | 'info' | null;
}

@Component({
  selector: 'app-lista-prestamos',
  templateUrl: './lista-prestamos.component.html',
  styleUrls: ['./lista-prestamos.component.scss'],
  providers: [ConfirmationService, MessageService],
  standalone: false,
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
export class ListaPrestamosComponent implements OnInit {
  rows: PrestamoRow[] = [];
  loadingIds = new Set<number>();
  items: MenuItem[] = [];
  loading = true;

  estadoOptions = [
    { label: 'Entregado', value: 'entregado' as EstadoKey },
    { label: 'Pendiente', value: 'pendiente' as EstadoKey },
    { label: 'Con deuda', value: 'deuda' as EstadoKey }
  ];

  // para el filtro de multaFlag
  multaOptions = [
    { label: 'Con multa', value: 1 },
    { label: 'Sin multa', value: 0 }
  ];

  spinner: AnimationOptions = {
    path: 'assets/spinner.json',
    loop: true,
    autoplay: true
  };

  constructor(
    private api: ApiService,
    private confirm: ConfirmationService,
    private toast: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPrestamos();
    this.items = [
            {
                label: 'Nuevo préstamo',
                icon: 'pi pi-calendar-plus',
                command: () => {
                    this.router.navigate(['/admin/crear-prestamo']);
                },
            },
        ];
  }

  private cargarPrestamos(): void {
    this.api.getPrestamos().subscribe({
      next: (res) => {
        if (res?.estatus === 1 && Array.isArray(res.data)) {
          this.rows = res.data.map((p: any) => this.mapPrestamo(p));
        } else {
          this.toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Respuesta inesperada del servidor.' });
        }
        this.loading = false;
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los préstamos.' });
        this.loading = false;
      }
    });
  }

  private mapPrestamo(p: any): PrestamoRow {
    const nombre = `${p.usuario?.nombreUsr ?? ''} ${p.usuario?.apellidoP ?? ''}`.trim();
    const multaNum = p.multa ?? 0;
    const conDeuda = multaNum > 0;
    const estado: EstadoKey = p.devuelto === 1 ? 'entregado' : (conDeuda ? 'deuda' : 'pendiente');
    const fotoUrl =
      (p.usuario?.fotoUsr ? `${this.api.urlImagenes}/storage/${p.usuario.fotoUsr}` : undefined);

    return {
      idPrestamo: p.idPrestamo,
      fechaPrestamo: p.fechaPrestamo,
      fechaEntrega: p.fechaEntrega,
      multa: multaNum,
      devuelto: p.devuelto,

      libroIsbn: p.libro?.isbn ?? '',
      libroTitulo: p.libro?.titulo ?? '',

      groupKey: p.usuario?.idUsr ?? 0,
      groupName: nombre || '(Sin nombre)',
      groupEmail: p.usuario?.correoUsr ?? '',
      groupAvatar: fotoUrl,

      multaFlag: multaNum > 0 ? 1 : 0,

      estadoKey: estado,
      estadoLabel: this.estadoLabel(estado),
      estadoSeverity: this.estadoSeverity(estado)
    };
  }

  private estadoLabel(e: EstadoKey): string {
    switch (e) {
      case 'entregado': return 'Entregado';
      case 'pendiente': return 'Pendiente';
      case 'deuda':     return 'Con deuda';
    }
  }

  private estadoSeverity(e: EstadoKey): 'success' | 'warning' | 'danger' | 'info' | null {
    switch (e) {
      case 'entregado': return 'success';
      case 'pendiente': return 'warning';
      case 'deuda':     return 'danger';
    }
  }

  calcularTotalPorUsuario(groupKey: number): number {
    return this.rows.filter(r => r.groupKey === groupKey).length;
    // Si quieres contar solo vigentes: .filter(r => r.groupKey===groupKey && r.devuelto===0).length
  }

  // ===== Acciones =====

  confirmPagarMulta(row: PrestamoRow) {
    if (row.multa <= 0) return;
    this.confirm.confirm({
      header: 'Confirmar pago de multa',
      message: `¿Pagar la multa de $${row.multa.toFixed(2)} del préstamo #${row.idPrestamo}? (Esta accion devolvera el libro)  `,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Pagar',
      rejectLabel: 'Cancelar',
      accept: () => this.pagarMulta(row)
    });
  }

  private pagarMulta(row: PrestamoRow) {
    this.loadingIds.add(row.idPrestamo);
    this.api.pagarMulta(row.idPrestamo).subscribe({
      next: () => {
        row.multa = 0;
        row.multaFlag = 0;
        if (row.devuelto === 0) {
          row.estadoKey = 'entregado';
          row.estadoLabel = this.estadoLabel(row.estadoKey);
          row.estadoSeverity = this.estadoSeverity(row.estadoKey);
          this.router.navigate(['/admin/detalles-prestamo', row.idPrestamo]);
        }
        this.toast.add({ severity: 'success', summary: 'Listo', detail: `Multa pagada del préstamo #${row.idPrestamo}.` });
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo pagar la multa.' });
      },
      complete: () => this.loadingIds.delete(row.idPrestamo)
    });
  }

  confirmMarcarDevuelto(row: PrestamoRow) {
    if (row.devuelto === 1 || row.multa > 0) return;
    this.confirm.confirm({
      header: 'Confirmar devolución',
      message: `¿Marcar como devuelto el préstamo #${row.idPrestamo}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Marcar',
      rejectLabel: 'Cancelar',
      accept: () => this.marcarDevuelto(row)
    });
  }

  private marcarDevuelto(row: PrestamoRow) {
  this.loadingIds.add(row.idPrestamo);
  this.api.marcarDevuelto1(row.idPrestamo).subscribe({
    next: (res) => {
      if (res?.estatus === 1) {
        row.devuelto = 1;
        row.estadoKey = 'entregado';
        row.estadoLabel = this.estadoLabel(row.estadoKey);
        row.estadoSeverity = this.estadoSeverity(row.estadoKey);
        this.toast.add({ severity: 'success', summary: 'Listo', detail: res.mensaje || `Préstamo #${row.idPrestamo} devuelto.` });
      } else {
        this.toast.add({ severity: 'warn', summary: 'Aviso', detail: res?.mensaje || 'No se pudo marcar como devuelto.' });
      }
    },
    error: () => {
      this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo marcar como devuelto.' });
    },
    complete: () => this.loadingIds.delete(row.idPrestamo)
  });
}

onRowClick(row: PrestamoRow) {
  this.router.navigate(['/admin/detalles-prestamo', row.idPrestamo]);
}

}

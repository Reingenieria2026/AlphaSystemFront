// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { ConfirmationService, MessageService } from 'primeng/api';
// import { Libro } from '../../../../models/alphaSystem.models';
// import { ApiService } from '../../../services/laravel.service';

// @Component({
//   selector: 'app-lista-libros',
//   standalone: false,
//   templateUrl: './lista-libros.component.html',
//   styleUrl: './lista-libros.component.scss'
// })
// export class ListaLibrosComponent implements OnInit {

//   libros: Libro[] = [];
//   librosFiltrados: Libro[] = [];
//   librosPaginados: Libro[] = [];
//   filtroEstadosSeleccionados: number[] = [];

//   busqueda: string = '';
//   first = 0;
//   rows = 8;

//   sortFields = [
//     { label: 'Título', value: 'titulo' },
//     { label: 'Autor', value: 'autor' },
//     { label: 'Editorial', value: 'editorial' },
//     { label: 'Año', value: 'anioPubli' }
//   ];

//   sortOrders = [
//     { label: 'Ascendente', value: 'asc' },
//     { label: 'Descendente', value: 'desc' }
//   ];

//   estadosLibro: { [key: number]: string } = {
//   1: 'Disponible',
//   2: 'Prestado',
//   3: 'Dañado',
//   4: 'Extraviado',
//   5: 'Eliminado',
//   6: 'No Disponible',
// };

//   selectedSortField: string = 'titulo';
//   selectedSortOrder: string = 'asc';

//   constructor(
//     private api: ApiService,
//     private msg: MessageService,
//     private router: Router,
//     private confirmationService: ConfirmationService
//   ) {}

//   ngOnInit(): void {
//     this.obtenerLibros();
//   }

//   obtenerLibros(): void {
//     this.api.getLibros().subscribe({
//       next: res => {
//         this.libros = res.data || res;
//         this.aplicarFiltros();
//       },
//       error: () => {
//         this.msg.add({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'No se pudo cargar la lista de libros.'
//         });
//       }
//     });
//   }

//   aplicarFiltros(): void {
//     this.filtrarLibros();
//     this.ordenarLibros();
//   }

//   filtrarLibros(): void {
//     const term = this.busqueda.toLowerCase();

//   this.librosFiltrados = this.libros.filter(libro => {
//     const coincideBusqueda =
//       libro.titulo.toLowerCase().includes(term) ||
//       libro.autor.toLowerCase().includes(term) ||
//       libro.editorial.toLowerCase().includes(term) ||
//       libro.isbn.toLowerCase().includes(term);

//     const coincideEstado =
//       this.filtroEstadosSeleccionados.length === 0 ||
//       this.filtroEstadosSeleccionados.includes(libro.idEstadoLibro);

//     return coincideBusqueda && coincideEstado;
//   });

//   this.first = 0;
//   this.actualizarLibrosPaginados();
//   }

//   onFilterChange(): void {
//   this.aplicarFiltros();
// }


//   ordenarLibros(): void {
//     const field = this.selectedSortField;
//     const order = this.selectedSortOrder;

//     this.librosFiltrados.sort((a: any, b: any) => {
//       const valA = (a[field] || '').toString().toLowerCase();
//       const valB = (b[field] || '').toString().toLowerCase();

//       if (valA < valB) return order === 'asc' ? -1 : 1;
//       if (valA > valB) return order === 'asc' ? 1 : -1;
//       return 0;
//     });
//     this.actualizarLibrosPaginados();
//   }

//   editarLibro(isbn: string): void {
//     this.router.navigate(['/admin/libro', isbn]);
//   }

//   eliminarLibro(isbn: string): void {
//     this.api.eliminarLibroVirtual(isbn).subscribe({
//       next: res => {
//         if (res.estatus === 1) {
//           this.msg.add({
//             severity: 'success',
//             summary: 'Eliminado',
//             detail: 'Libro marcado como eliminado correctamente.'
//           });
//           this.obtenerLibros();
//         } else {
//           console.log(res);
//           this.msg.add({
//             severity: 'error',
//             summary: 'Error',
//             detail: res.mensaje || 'No se pudo marcar el libro como eliminado.'
//           });
//         }
//       },
//       error: () => this.msg.add({
//         severity: 'error',
//         summary: 'Error',
//         detail: 'No se pudo marcar el libro como eliminado.'
//       })
//     });
  
// }

//     onPageChange(event: any) {
//     this.first = event.first;
//     this.rows = event.rows;
//     this.actualizarLibrosPaginados();
//   }

//   actualizarLibrosPaginados() {
//     const start = this.first;
//     const end = this.first + this.rows;
//     this.librosPaginados = this.librosFiltrados.slice(start, end);
//   }

//   restaurarLibro(isbn: string): void {
//   this.api.restaurarLibro(isbn).subscribe({
//     next: res => {
//       if (res.estatus === 1) {
//         this.msg.add({
//           severity: 'success',
//           summary: 'Restaurado',
//           detail: 'Libro restaurado correctamente.'
//         });
//         this.obtenerLibros();
//       } else {
//         this.msg.add({
//           severity: 'error',
//           summary: 'Error',
//           detail: res.mensaje || 'No se pudo restaurar el libro.'
//         });
//       }
//     },
//     error: () => this.msg.add({
//       severity: 'error',
//       summary: 'Error',
//       detail: 'No se pudo restaurar el libro.'
//     })
//   });
// }

// confirmarAccionLibro(event: Event, libro: Libro): void {
//   const esEliminado = libro.idEstadoLibro === 5;

//   this.confirmationService.confirm({
//     target: event.target as EventTarget,
//     header: 'Confirmación',
//     message: esEliminado
//       ? '¿Deseas restaurar este libro a estado Disponible?'
//       : '¿Estás seguro de eliminar este libro?',
//     icon: 'pi pi-info-circle',
//     rejectButtonProps: {
//       label: 'Cancelar',
//       severity: 'secondary',
//       outlined: true
//     },
//     acceptButtonProps: {
//       label: esEliminado ? 'Restaurar' : 'Eliminar',
//       severity: esEliminado ? 'success' : 'danger'
//     },
//     accept: () => {
//       esEliminado
//         ? this.restaurarLibro(libro.isbn)
//         : this.eliminarLibro(libro.isbn);
//     },
//     reject: () => {
//       this.msg.add({
//         severity: 'info',
//         summary: 'Cancelado',
//         detail: esEliminado ? 'Restauración cancelada' : 'Eliminación cancelada'
//       });
//     }
//   });
// }




  
// }


// lista-libros.component.ts
import { Component, OnInit } from '@angular/core';
import {
  SelectItem,
  FilterMetadata,
  FilterMatchMode,
  ConfirmationService,
  MessageService
} from 'primeng/api';
import { Router } from '@angular/router';
import { Genero, Libro } from '../../../../models/alphaSystem.models';
import { ApiService } from '../../../services/laravel.service';
import { AnimationOptions } from 'ngx-lottie';
import { MenuItem } from 'primeng/api';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-lista-libros',
  templateUrl: './lista-libros.component.html',
  styleUrls: ['./lista-libros.component.scss'],
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
export class ListaLibrosComponent implements OnInit {
  libros: Libro[] = [];
  loading = true;
  items: MenuItem[] = [];
  genreMap: { [key: number]: string } = {};

  rows = 8;
  filters: { [s: string]: FilterMetadata } = {};

  statusOptions: SelectItem[] = [];               
  estadosLibroMap: { [id: number]: string } = {}; 


  estadosLibro: { [key: number]: string } = {
    1: 'Disponible',
    2: 'Prestado',
    3: 'Dañado',
    4: 'Extraviado',
    5: 'Eliminado',
    6: 'No disponible'
  };

  
  genreOptions: SelectItem[] = [];

  spinner: AnimationOptions = {
    path: 'assets/spinner.json',
    loop: true,
    autoplay: true
  };

  constructor(
    private api: ApiService,
    private confirmationService: ConfirmationService,
    private msg: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // inicializa filtros
    this.filters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      isbn: { value: null, matchMode: FilterMatchMode.CONTAINS },
      titulo: { value: null, matchMode: FilterMatchMode.CONTAINS },
      autor: { value: null, matchMode: FilterMatchMode.CONTAINS },
      edicion: { value: null, matchMode: FilterMatchMode.CONTAINS },
      cantidad: {
        value: null,
        matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO
      },
      idEstadoLibro: {
        value: null,
        matchMode: FilterMatchMode.EQUALS
      },
      idGenero: { value: null, matchMode: FilterMatchMode.EQUALS }
    };

    this.api.getEstadosLibro().subscribe({
      next: (res: any) => {
        const lista: { idEstadoU: number; estadoLibro: string }[] = res.data ?? res;

        // opciones para dropdown
        this.statusOptions = lista.map(e => ({ label: e.estadoLibro, value: e.idEstadoU }));

        // mapa id -> etiqueta para pintar la celda
        this.estadosLibroMap = lista.reduce((acc, e) => {
          acc[e.idEstadoU] = e.estadoLibro;
          return acc;
        }, {} as { [id: number]: string });
      },
      error: () =>
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los estados.' })
    });

    // convierte genreMap en opciones para el dropdown
    this.genreOptions = Object.entries(this.genreMap).map(([key, label]) => ({
      label,
      value: +key
    }));


    this.api.getLibros().subscribe({
      next: (res: any) => {
        this.libros = res.data || res;
        this.loading = false;
      },
      error: () => {
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la lista de libros.'
        });
        this.loading = false;
      }
    });

    this.items = [
            {
                label: 'Agregar Libro',
                icon: 'pi pi-file-plus',
                command: () => {
                    this.router.navigate(['/admin/app-crear-libro']);
                },
            },
        ];

        this.api.getGeneros().subscribe({
      next: (res: any) => {
        const lista: Genero[] = res.data || res;
       // Para el dropdown
       this.genreOptions = lista.map(g => ({
         label: g.nombreGenero,
         value: g.idGenero
       }));
       // Para mostrar la etiqueta en la celda
       this.genreMap = lista.reduce((acc, g) => {
         acc[g.idGenero] = g.nombreGenero;
         return acc;
       }, {} as { [key: number]: string });
     },
     error: () => this.msg.add({
       severity: 'error',
       summary: 'Error',
       detail: 'No se pudieron cargar géneros.'
     })
   });
  }

  /** Navega a la vista de detalle/edición */
  viewDetails(isbn: string) {
    this.router.navigate(['/admin/libro', isbn]);
  }

  /** Severidad para el estado (p-tag) */
  getSeverity(value: number) {
    return value === 1 ? 'success' : 'danger';
  }

  estadoLabel(id?: number): string {
    return id != null ? (this.estadosLibroMap[id] ?? 'Desconocido') : 'Desconocido';
  }

  getSeverityById(id?: number): 'success' | 'warn' | 'danger' | 'secondary' {
    const label = this.estadoLabel(id).toLowerCase();
    if (label.includes('elimin')) return 'danger';
    if (label.includes('dañ') || label.includes('extravi')) return 'danger';
    if (label.includes('prestado')) return 'warn';
    if (label.includes('no disponible')) return 'secondary';
    if (label.includes('disponible')) return 'success';
    return 'secondary';
  }

  isEliminado(libro: Libro): boolean {
    return this.estadoLabel(libro.idEstadoLibro).toLowerCase().includes('elimin');
  }

  /** Confirmación antes de eliminar/restaurar */
  confirmarAccionLibro(event: Event, libro: Libro) {
    const isDeleted = this.isEliminado(libro);
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: 'Confirmación',
      message: isDeleted
        ? '¿Restaurar este libro a Disponible?'
        : '¿Eliminar este libro?',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => (isDeleted ? this.restaurarLibro(libro.isbn) : this.eliminarLibro(libro.isbn))
    });
    event.stopPropagation();
  }

  private eliminarLibro(isbn: string) {
    this.api.eliminarLibroVirtual(isbn).subscribe({
      next: (res) => {
        this.msg.add({
          severity: res.estatus === 1 ? 'success' : 'error',
          summary: res.estatus === 1 ? 'Eliminado' : 'Error',
          detail: res.estatus === 1 ? 'Libro eliminado.' : (res.mensaje || 'No se pudo eliminar.')
        });
        this.ngOnInit();
      }
    });
  }

  private restaurarLibro(isbn: string) {
    this.api.restaurarLibro(isbn).subscribe({
      next: (res) => {
        this.msg.add({
          severity: res.estatus === 1 ? 'success' : 'error',
          summary: res.estatus === 1 ? 'Restaurado' : 'Error',
          detail: res.estatus === 1 ? 'Libro restaurado.' : (res.mensaje || 'No se pudo restaurar.')
        });
        this.ngOnInit();
      }
    });
  }
}

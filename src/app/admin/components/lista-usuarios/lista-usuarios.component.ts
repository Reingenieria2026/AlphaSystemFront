import { Component, OnInit } from '@angular/core';
import { SelectItem , FilterMetadata,
  FilterMatchMode
  } from 'primeng/api';
import { Router } from '@angular/router';
import { FakeHttpLaravelService } from '../../../http.FakeHttpLaravelService ';
import { Usuario } from '../../../../models/alphaSystem.models';
import { ApiService } from '../../../services/laravel.service';
import { MenuItem } from 'primeng/api';
import { AnimationOptions } from 'ngx-lottie';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';


@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.scss',
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
export class ListaUsuariosComponent implements OnInit {
  // Lista original de usuarios, que se obtendrá del servicio
  users: Usuario[] = [];
  filteredUsers: Usuario[] = [];
  loading: boolean = true;
  items: MenuItem[] = [];

  // Filtro: mostrar solo usuarios activos
  filterActive: boolean = true;

  // Término de búsqueda
  searchTerm: string = '';
  private tiempoBusqueda: any;

  // Para p-table filters
  filters: { [s: string]: FilterMetadata } = {};

  // Opciones de Estatus y Rol para los dropdowns de filtro
  statusOptions: SelectItem[] = [];                  
  estadosMap: Record<number, string> = {}; 

  roleOptions: SelectItem[] = [
    { label: 'Administrador', value: 1 },
    { label: 'Usuario', value: 2 }
  ];

  menuItems: MenuItem[] = [
    { label: 'Usuarios activos' },
    { label: 'Ordenar por' },
    { label: 'Orden' }
  ];

  // Opciones para ordenación
  sortFields: SelectItem[] = [
    { label: 'Nombre', value: 'nombreUsr' },
    { label: 'Apellido', value: 'apellidoP' }
  ];
  sortOrders: SelectItem[] = [
    { label: 'Ascendente', value: 'asc' },
    { label: 'Descendente', value: 'desc' }
  ];

  spinner: AnimationOptions = {
    path: 'assets/spinner.json', 
    loop: true,
    autoplay: true
  };
  
  selectedSortField: string = '';
  selectedSortOrder: string = 'asc';

  constructor(
    private servicio: FakeHttpLaravelService,
    private api: ApiService, private router: Router
  ) {}

  //Al iniciarse el componente, traemos la lista de usuarios
  ngOnInit(): void {
    // Inicializamos filtros (global + columnas)
    this.filters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      idUsr: {
        value: null,
        matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO
      },
      nombreUsr: { value: null, matchMode: FilterMatchMode.CONTAINS },
      idEstadoUsr: { value: null, matchMode: FilterMatchMode.EQUALS },
      idTipoUsr: { value: null, matchMode: FilterMatchMode.EQUALS }
    };

    this.api.getEstadosUsuario().subscribe({
  next: (res: any) => {
    const lista = res?.data ?? res ?? [];
    // dropdown del filtro
    this.statusOptions = lista.map((e: any) => ({
      label: e.estadoUsr,
      value: e.idEstadoUsr
    }));
    // mapa para celdas
    this.estadosMap = lista.reduce((acc: Record<number,string>, e: any) => {
      acc[e.idEstadoUsr] = e.estadoUsr;
      return acc;
    }, {});
  },
  error: (err) => {
    console.error('No se pudieron cargar estados de usuario', err);
  }
});

    // Carga de datos
    this.api.getUsuarios().subscribe({
      next: (res: any) => {
        if (res.estatus === 1) {
          this.users = res.data as Usuario[];
        } else {
          console.error('Error al obtener usuarios:', res.mensaje);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error de red al cargar usuarios:', err);
        this.loading = false;
      }
    });

    this.items = [
            {
                label: 'Agregar Usuario',
                icon: 'pi pi-user-plus',
                command: () => {
                    this.router.navigate(['/admin/crear-usuario']);
                },
            },
        ];
  }

  // Este método se invoca al escribir en el input de búsqueda
  // y se usa un timeout para evitar que se ejecute en cada pulsación de tecla
  onSearchChange(event: any): void {
    if (this.tiempoBusqueda) {
      clearTimeout(this.tiempoBusqueda);
    }
    this.tiempoBusqueda = setTimeout(() => {
      this.aplicarFiltros();
    }, 500);
  }

  // Llama este método también cuando cambian otros filtros (activo, ordenación)
  onFilterChange(): void {
    this.aplicarFiltros();
  }

  public aplicarFiltros(): void {
    let temp = [...this.users];

    // 1) Filtrar activos
    if (this.filterActive) {
      temp = temp.filter(u => u.idEstadoUsr === 1);
    }

    // 2) Buscar por ID o nombre completo
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      temp = temp.filter(u =>
        u.idUsr.toString().includes(term) ||
        (u.nombreUsr + ' ' + u.apellidoP).toLowerCase().includes(term)
      );
    }

    // 3) Ordenar si se ha seleccionado campo
    if (this.selectedSortField) {
      temp.sort((a, b) => {
        const A = (a as any)[this.selectedSortField];
        const B = (b as any)[this.selectedSortField];
        if (A < B) return this.selectedSortOrder === 'asc' ? -1 : 1;
        if (A > B) return this.selectedSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredUsers = temp;
  } 

  viewProfile(id: number) {
    this.router.navigate(['/admin/perfil', id]);
  }

  // Determina el color de la etiqueta
  getSeverity(id?: number): 'success' | 'warn' | 'danger' | 'secondary' {
  const label = this.estadoLabel(id).toLowerCase();

  // Ajusta aquí si cambian los nombres en tu back:
  if (label.includes('inactiv'))    return 'secondary';
  if (label.includes('activo'))     return 'success';
  if (label.includes('suspend'))    return 'warn';
  if (label.includes('elimin'))     return 'danger';
  

  return 'secondary';
}

  estadoLabel(id?: number): string {
  return (id != null && this.estadosMap[id]) ? this.estadosMap[id] : '—';
}


}
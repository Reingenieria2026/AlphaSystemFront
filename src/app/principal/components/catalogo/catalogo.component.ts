import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Libro } from '../../../../models/alphaSystem.models';
import { NzModalService } from 'ng-zorro-antd/modal';
import { VistaLibroComponent } from '../vista-libro/vista-libro.component';
import { MenuItem, SelectItem } from 'primeng/api';
import { ApiService } from '../../../services/laravel.service';
import { ActivatedRoute } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { finalize } from 'rxjs/operators';

interface FilterChip {
  field: 'genre'|'state'|'sortField'|'sortOrder';
  label: string;
  value: any;
}

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
  standalone: false
})
export class CatalogoComponent implements OnInit {
  layout: 'list' | 'grid' = 'grid';
  options1: ('list' | 'grid')[] = ['list', 'grid'];
  first = 0;
  rows = 10;

  books: Libro[] = [];
  filteredBooks: Libro[] = [];
  paginatedBooks: Libro[] = [];
  noResults = false;

  generosMenu: MenuItem[] = [];
  estadosMenu: MenuItem[] = [];
  datosLibroMenu: MenuItem[] = [];
  ordenMenu: MenuItem[] = [];

  filterChips: FilterChip[] = [];


  searchTerm = '';
  busquedaIngresada = '';
  generoSeleccionado = '';
  private searchTimeout: any;

  selectedGenres: number[] = [];
  selectedState: number | null = null;
  selectedSortField: string | null = null;
  selectedSortOrder: string = 'asc';

  genres: SelectItem[] = [];
  states: SelectItem[] = [
    { label: 'Todos', value: null },
    { label: 'Disponible', value: 1 },
    { label: 'No disponible', value: 0 }
  ];
  sortFields: SelectItem[] = [
    { label: 'Título', value: 'titulo' },
    { label: 'Autor', value: 'autor' }
  ];
  sortOrders: SelectItem[] = [
    { label: 'Ascendente', value: 'asc' },
    { label: 'Descendente', value: 'desc' }
  ];

  loading = true;  
  options: AnimationOptions = {
    path: 'assets/spinner.json',
    loop: true,
    autoplay: true
  };

  constructor(
    private apiService: ApiService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private route: ActivatedRoute 
  ) 
  {
    

  }

  ngOnInit() {
    this.loading = true;
    this.apiService.getLibros().pipe(
      finalize(() => this.loading = false)
    ).subscribe(res => {
      this.books = res.data || res;
      this.selectedSortField = 'titulo';
    this.selectedSortOrder = 'asc';
    this.filterChips.push(
      { field: 'sortField', label: 'Título', value: 'titulo' },
      { field: 'sortOrder', label: 'Ascendente', value: 'asc' }
    );
      this.applyFilters();
    });

    this.route.paramMap.subscribe(params => {
      const b = params.get('busqueda');
      this.busquedaIngresada = b || '';
      this.searchTerm       = this.busquedaIngresada;
      // vuelvo a filtrar con el nuevo término
      this.applyFilters();
    });

    this.apiService.getGeneros().subscribe(res => {
      const data = res.data || [];
      // primero "Todos"
      this.generosMenu = [
        
        ...data.map((g: any) => ({
          label: g.nombreGenero,
          icon: 'pi pi-fw pi-tag',
          command: () => this.onGenreToggle(g.idGenero, g.nombreGenero)
        }))
      ];
    });

    this.estadosMenu = [
      { label: 'Todos', icon: 'pi pi-fw pi-list', command: () => this.onStateSelect(null, 'Todos') },
      { label: 'Disponible', icon: 'pi pi-fw pi-check', command: () => this.onStateSelect(1, 'Disponible') },
      { label: 'No disponible', icon: 'pi pi-fw pi-times', command: () => this.onStateSelect(0, 'No disponible') }
    ];

    this.datosLibroMenu = [
      { label: 'Título', icon: 'pi pi-fw pi-sort-alpha-down', command: () => this.onSortFieldSelect('titulo', 'Título') },
      { label: 'Autor', icon: 'pi pi-fw pi-user', command: () => this.onSortFieldSelect('autor', 'Autor') },
      { label: 'Año',   icon: 'pi pi-fw pi-calendar', command: () => this.onSortFieldSelect('anioPubli', 'Año') }
    ];

    this.ordenMenu = [
      { label: 'Ascendente',  icon: 'pi pi-fw pi-sort-amount-up',   command: () => this.onSortOrderSelect('asc', 'Ascendente') },
      { label: 'Descendente', icon: 'pi pi-fw pi-sort-amount-down', command: () => this.onSortOrderSelect('desc','Descendente') }
    ];
  }


  onGenreToggle(idGenero: number, label: string) {
    const idx = this.selectedGenres.indexOf(idGenero);
    if (idx > -1) {
      // ya estaba: lo quitamos
      this.selectedGenres.splice(idx, 1);
      this.filterChips = this.filterChips.filter(c =>
        !(c.field === 'genre' && c.value === idGenero)
      );
    } else {
      // no estaba: lo añadimos
      this.selectedGenres.push(idGenero);
      this.filterChips.push({ field: 'genre', label, value: idGenero });
    }
    this.applyFilters();
  }
  
  onStateSelect(value: number|null, label: string) {
    this.selectedState = value;
    this.updateChip('state', label, value);
    this.applyFilters();
  }
  onSortFieldSelect(value: string|null, label: string) {
    this.selectedSortField = value;
    this.updateChip('sortField', label, value);
    this.applyFilters();
  }
  onSortOrderSelect(value: 'asc'|'desc', label: string) {
    this.selectedSortOrder = value;
    this.updateChip('sortOrder', label, value);
    this.applyFilters();
  }

  updateChip(field: FilterChip['field'], label: string, value: any) {
    // elimina chip previa de ese campo
    this.filterChips = this.filterChips.filter(c => c.field !== field);
    // si el valor no es "Todos" ni null, la añadimos
    if (value !== null) {
      this.filterChips.push({ field, label, value });
    }
  }

  removeFilter(chip: FilterChip) {
    // limpia el filtro
    if (chip.field === 'genre') {
      // quita sólo ese género
      this.selectedGenres = this.selectedGenres.filter(id => id !== chip.value);
    } else {
    switch (chip.field) {
      case 'state':      this.selectedState = null;      break;
      case 'sortField':  this.selectedSortField = null;  break;
      case 'sortOrder':  this.selectedSortOrder = 'asc'; break;
    }
  }
  this.filterChips = this.filterChips.filter(c => c !== chip);
    this.applyFilters();
  }

  onSearchChange() {
    //this.router.navigate(['/catalogo','buscar', this.searchTerm]).then(() => this.applyFilters());
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let temp = [...this.books];
    if (this.selectedGenres.length) {
      temp = temp.filter(b => this.selectedGenres.includes(b.idGenero));
    }
    if (this.selectedState != null)   temp = temp.filter(b => b.idEstadoLibro=== this.selectedState);
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      temp = temp.filter(b =>
        b.titulo.toLowerCase().includes(term) ||
        b.autor.toLowerCase().includes(term) ||
        b.isbn.toLowerCase().includes(term)
      );
    }
    if (this.selectedSortField) {
      const key = this.selectedSortField;
      temp.sort((a,b) => {
        const A = (a as any)[key]?.toString().toLowerCase()||'';
        const B = (b as any)[key]?.toString().toLowerCase()||'';
        if (A<B) return this.selectedSortOrder==='asc'?-1:1;
        if (A>B) return this.selectedSortOrder==='asc'?1:-1;
        return 0;
      });
    }
    this.filteredBooks = temp;
    this.first = 0;
    this.updatePaginatedBooks();
  }

  clearFilters() {
    this.selectedGenres = [];
    this.selectedState = null;
    this.selectedSortField = null;
    this.selectedSortOrder = 'asc';
    this.searchTerm = '';
    this.filterChips = [];
    this.applyFilters();
  }

  updatePaginatedBooks() {
    this.paginatedBooks = this.filteredBooks.slice(this.first, this.first + this.rows);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePaginatedBooks();
  }

  openBookModal(book: Libro) {
    const modal = this.modal.create({
      nzTitle: book.titulo,
      nzContent: VistaLibroComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: '80%',
      nzData: book,
      nzFooter: null
    });
    modal.afterClose.subscribe();
  }
}

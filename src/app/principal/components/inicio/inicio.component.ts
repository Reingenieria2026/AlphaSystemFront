import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { LocalstorageService } from '../../../localstorage.service';
// Asegúrate de importar NzModalService y NzModalRef desde ng-zorro-antd/modal:
import { NzModalService } from 'ng-zorro-antd/modal';
import { VistaLibroComponent } from '../vista-libro/vista-libro.component';
import { Libro } from '../../../../models/alphaSystem.models';
import { ApiService } from '../../../services/laravel.service';
import {  SelectItem } from 'primeng/api';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { finalize } from 'rxjs/operators';

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
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'] ,
  standalone: false,
})
export class InicioComponent implements OnInit {

  books: Libro[] = [];
  librosdestacados: Libro[] = []; //Este debe ser de tamaño de solo 3 libros
  librosFiccion: Libro[] = [];
  librosCiencia: Libro[] = [];
  librosRecientes: Libro[] = [];
  cargando = true;
  genres: SelectItem[] = [];

  options: AnimationOptions = {
    path: 'assets/spinner.json', 
    loop: true,
    autoplay: true
  };

  loading = true;

  strategy = 'transform-no-loop';
  array = [
    'assets/inicio2.jpg',
    'assets/inicio1.jpg',
    'assets/inicio3.jpg'
  ];
  dotPosition = 'bottom';
  
  user?: User;

  responsiveOptions: any[] = [
    {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
];

constructor(
  private apiService: ApiService,
  private localStorage: LocalstorageService,
  private modal: NzModalService,
  private viewContainerRef: ViewContainerRef
) {}

ngOnInit() {
   const userData = this.localStorage.getItem('userData');
    if (userData) {
      this.user = JSON.parse(userData);
      console.log('Usuario cargado desde localStorage:', this.user);
      
    }
  this.loading = true;
    this.apiService.getLibros()
      .pipe(
        finalize(() => {
          // este bloque siempre corre (éxito o error)
          this.loading = false;
        })
      )
      .subscribe({
        next: res => {
          this.books = res.data || res;

          // 1. Solo 3 destacados
          const destacadoGenero1 = this.books.find(b => b.idGenero === 1);
if (destacadoGenero1) {
  this.librosdestacados.push(destacadoGenero1);
}

const destacadoGenero2 = this.books.find(b => b.idGenero === 2);
if (destacadoGenero2) {
  this.librosdestacados.push(destacadoGenero2);
}

const destacadoGenero3 = this.books.find(b => b.idGenero === 3);
if (destacadoGenero3) {
  this.librosdestacados.push(destacadoGenero3);
}

          // 2. Fantasía (género 1)
          this.librosFiccion = this.books.filter(b => b.idGenero === 1);

          // 3. Ciencia (género 2)
          this.librosCiencia = this.books.filter(b => b.idGenero === 2);
        },
        error: err => {
          console.error('Error al cargar libros', err);
          // aquí podrías poner datos de fallback o un mensaje
        }
      });

}




openBookModal(book: Libro): void {
  const modal = this.modal.create({
    nzTitle: book.titulo,
    nzContent: VistaLibroComponent,
    nzViewContainerRef: this.viewContainerRef,
    nzWidth: '80%',   // Definir ancho si se desea
    nzData: book,     // Pasa el libro seleccionado al componente VistaLibroComponent
    nzFooter: null    // El componente controlará el footer si es necesario
  });

  // Opcional: suscribirse a afterClose para obtener resultados si fuese necesario
  modal.afterClose.subscribe(result => {
    console.log('Modal cerrado', result);
  });
}
}

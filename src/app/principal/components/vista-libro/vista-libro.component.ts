import { Component, Inject, OnInit } from '@angular/core';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { LibrosService } from '../../../services/libros.service';
import { GeminiService } from '../../../services/gemini.service';
import { Libro } from '../../../../models/alphaSystem.models';
import { FakeHttpLaravelService } from '../../../http.FakeHttpLaravelService ';
import { ApiService } from '../../../services/laravel.service';


@Component({
  selector: 'app-vista-libro',
  standalone: false,
  templateUrl: './vista-libro.component.html',
  styleUrls: ['./vista-libro.component.scss']
})
export class VistaLibroComponent implements OnInit {

  sinopsis: string = 'Cargando sinopsis...';
  libro: Libro = {
    isbn: '',
    titulo: '',
    fotoUsr: '',
    cantidad: 0,
    anioPubli: 0,
    edicion: '',
    autor: '',
    editorial: '',
    idGenero: 0,
    idEstadoLibro: 0,
    created_at: '',
    updated_at: '',
  };
  libroGenero: string = '...';

  constructor(
    private modal: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: any, 
    private geminiService: GeminiService,
    private fakeService: FakeHttpLaravelService,
    private apiService: ApiService,
  ) {}

  close(): void {
    this.modal.destroy();
  }

  ngOnInit(): void {
    const { titulo, autor } = this.data;
    const cacheKey = `sinopsis_${titulo}_${autor}`;
    const cache = localStorage.getItem(cacheKey);
    this.libro = this.data; 

    if (cache) {
      this.sinopsis = cache;
    } else {
        this.apiService.generarSinopsis(titulo, autor).subscribe({
        next: (res) => {
          this.sinopsis = res.sinopsis.trim();
          localStorage.setItem(cacheKey, this.sinopsis); // guardamos en caché
        },
        error: (err) => {
          console.error(err);
          this.sinopsis = 'No se pudo generar la sinopsis.';
        }
      });

    }

    this.fakeService.Service_Get('genero', this.libro.idGenero).subscribe(response => {
      if (response.estatus === 1 && response.data) {
        this.libroGenero = response.data.nombreGenero;
        console.log(this.libroGenero);
      } else {
        this.libroGenero = 'Desconocido';
        console.error('Error al obtener el género del libro:', response.mensaje);
      }
    });
  }
}
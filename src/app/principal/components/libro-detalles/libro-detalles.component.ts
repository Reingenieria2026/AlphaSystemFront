import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/laravel.service';
import { Libro, Genero  } from '../../../../models/alphaSystem.models';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import {
  AnimationOptions
} from 'ngx-lottie';
import { LocalstorageService } from '../../../localstorage.service';
import { Location } from '@angular/common';
import { ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-libro-detalles',
  standalone: false,
  templateUrl: './libro-detalles.component.html',
  styleUrl: './libro-detalles.component.scss'
})
export class LibroDetallesComponent implements OnInit {

  libro: Libro | null = null;
  sinopsis = 'Cargando sinopsis…';
  generoNombre = '';
  loading = true;
  ruta: string = 'http://localhost:8000/storage/';
  sinopsisLoading = true;
  infoGoogleLoading = true;
  calificacionLibro: number | null = null;
  paginasLibro: number | null = null;
  iconoGoogle = 'assets/googleBook.png';
  iconoOpenAi = 'assets/OpenAI.png';
  libroGenero: Libro[] = [];
  libroAutor: Libro[] = [];
  books: Libro[] = [];
  previewLink: string | null = null;
  viewability: string | null = null;
  webReaderLink: string | null = null;
  showPreviewDialog = false;
  previewUrl: string | null = null;
  mostrarPreview = false;
  


  // configuración Lottie
  options: AnimationOptions = {
    path: 'assets/spinner.json',
    loop: true,
    autoplay: true
  };

  options2: AnimationOptions = {
    path: 'assets/cargar.json',
    loop: true,
    autoplay: true
  };

  options1: AnimationOptions = {
    path: 'assets/loaderAi.json',
    loop: true,
    autoplay: true
  };

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
    private route: ActivatedRoute,
    private api: ApiService,
    private localStorage: LocalstorageService,
    private location: Location,
    private scroller: ViewportScroller,
    private router: Router,
    private confirmationService: ConfirmationService,
  private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // 1) Obtener el ISBN de la ruta
    this.route.paramMap.subscribe(params => {
    const isbn = params.get('libroId');
    if (!isbn) {
      console.error('No se recibió ISBN en la ruta');
      this.loading = false;
      return;
    }
    // Llamamos a un método que centralice toda la carga
    this.loading = true;
    this.loadBook(isbn);
  });
    

    // 2) Traer datos del libro
    /*this.api.getLibro(isbn)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: res => {
          // Si la API devuelve { data: Libro }, ajustamos:
          this.libro = (res as any).data || (res as Libro);

          if (this.libro) {
            // 3) Traer nombre de género
            this.fetchGenero(this.libro.idGenero);
            // 4) Generar (o leer cache) de la sinopsis
            this.fetchSinopsis(this.libro.titulo, this.libro.autor);
            this.fetchInfoGoogle(this.libro.titulo, this.libro.autor);
          }
        },
        error: err => {
          console.error('Error cargando el libro:', err);
        }
      });

      this.api.getLibros()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: res => {
          this.books = res.data || res;

          this.libroGenero = this.books.filter(b => b.idGenero === this.libro?.idGenero);

          this.libroAutor = this.books.filter(b => b.autor === this.libro?.autor);
        },
        error: err => {
          console.error('Error al cargar libros', err);
        }
      });
  }


  goToAndReload(isbn: string) {
  this.router.navigate(['/libro', isbn]).then(() => {
    // espera a que termine la navegación y entonces recarga la página
    window.location.reload();
  });*/
}

goToAndReload(isbn: string) {
  this.router.navigate(['/libro', isbn]);
}

private loadBook(isbn: string) {

  this.scroller.scrollToPosition([0, 0]);

  this.loading = true;
  this.sinopsisLoading = this.infoGoogleLoading = true;
  this.libro = null;
  this.sinopsis = '';
  this.generoNombre = '';
  this.calificacionLibro = this.paginasLibro = null;
  this.libroGenero = [];
  this.libroAutor = [];
  this.books = [];

  this.api.getLibro(isbn)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: res => {
        this.libro = (res as any).data || (res as Libro);
        if (!this.libro) { return; }
        this.fetchGenero(this.libro.idGenero);
        this.fetchSinopsis(this.libro.titulo, this.libro.autor);
        this.fetchInfoGoogle(this.libro.titulo, this.libro.autor);
        
        this.loadRelated(this.libro.idGenero, this.libro.autor);
      },
      error: err => console.error('Error cargando el libro:', err)
    });
}

private loadRelated(idGenero: number, autor: string) {
  this.api.getLibros()
    .subscribe({
      next: res => {
        this.books = (res as any).data || res;

        const currentIsbn = this.libro?.isbn;

        // Filtrar POR GÉNERO, pero excluir el libro activo
        this.libroGenero = this.books.filter(b =>
          b.idGenero === idGenero &&
          b.isbn !== currentIsbn
        );

        // Filtrar POR AUTOR, pero excluir el libro activo
        this.libroAutor = this.books.filter(b =>
          b.autor === autor &&
          b.isbn !== currentIsbn
        );
      },
      error: err => {
        console.error('Error al cargar libros relacionados:', err);
      }
    });
}

  private fetchSinopsis(titulo: string, autor: string) {
  // 1) CacheKey con ISBN (si lo tienes), sino con titulo+autor:
  const isbn = this.libro?.isbn || `${titulo}-${autor}`;
  const cacheKey = `sinopsis_${isbn}`;

  // 2) Intentamos leer de cache
  const cache = this.localStorage.getItem(cacheKey);
  if (cache) {
    this.sinopsis = cache;
    this.sinopsisLoading = false;   // ¡Muy importante!
    return;
  }

  // 3) Si no hay cache, llamamos a la API
  this.sinopsisLoading = true;
  this.sinopsis = '';

  this.api.generarSinopsis(titulo, autor)
    .pipe(finalize(() => {
      // siempre desactivamos el loader
      this.sinopsisLoading = false;
    }))
    .subscribe({
      next: (r: any) => {
        const texto = r.sinopsis.trim();
        this.sinopsis = texto;

        // 4) Guardamos en cache para próximas visitas
        this.localStorage.setItem(cacheKey, texto);
      },
      error: () => {
        this.sinopsis = 'No se pudo generar la sinopsis.';
      }
    });
}

  /** Consulta el nombre del género por su ID */
  private fetchGenero(idGenero: number) {
    this.api.getGenero(idGenero)
      .subscribe({
        next: (g: Genero) => {
          this.generoNombre = g.nombreGenero;
        },
        error: () => {
          this.generoNombre = 'Desconocido';
        }
      });
  }

  private fetchInfoGoogle(titulo: string, autor: string) {
  this.infoGoogleLoading = true;
  this.api.getLibroDesdeGoogle(titulo, autor)
    .pipe(finalize(() => this.infoGoogleLoading = false))
    .subscribe({
      next: (info) => {
         console.log('📚 Respuesta completa de Google Books:', info);
        this.calificacionLibro = info.calificacion ?? null;
        this.paginasLibro = info.paginas ?? null;
        this.previewLink = info.previewLink ?? null;
        this.viewability = info.viewability ?? null;
        this.webReaderLink = info.webReaderLink ?? null;
        this.previewUrl = this.previewLink || this.webReaderLink;
      },
      error: (err) => {
        console.warn('No se pudo obtener información de Google Books:', err);
        this.calificacionLibro = null;
        this.paginasLibro = null;
        this.webReaderLink = null;
      }
    });
}

volverAtras(): void {
  this.location.back();
}

abrirConfirmacionGoogle(event: Event) {
  if (!this.webReaderLink && !this.previewLink) {
    this.messageService.add({ severity: 'warn', summary: 'Sin vista previa', detail: 'Este libro no cuenta con previsualización.' });
    return;
  }

  this.confirmationService.confirm({
    target: event.target as EventTarget,
    message: 'Serás redirigido a Google Books para ver una vista previa del libro.',
    header: 'Redirección externa',
    icon: 'pi pi-external-link',
    acceptLabel: 'Ir a Google Books',
    rejectLabel: 'Cancelar',
    acceptButtonProps: {
      severity: 'info',
    },
    rejectButtonProps: {
      severity: 'secondary',
    },
    accept: () => {
      window.open(this.webReaderLink || this.previewLink!, '_blank');
    },
  });
}

}

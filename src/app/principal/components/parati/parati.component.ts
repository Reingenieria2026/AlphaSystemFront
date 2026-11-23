import { Component, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { LibroReco, RecoHistItem } from '../../../../models/alphaSystem.models';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../services/laravel.service';
import { LocalstorageService } from '../../../localstorage.service';
import { Libro } from '../../../../models/alphaSystem.models';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
  selector: 'app-parati',
  standalone: false,
  templateUrl: './parati.component.html',
  styleUrl: './parati.component.scss',
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
export class ParatiComponent implements OnInit {

  loading = false;
  resultados: LibroReco[] = [];
  errorMsg = '';
  user: User | null = null;
  librosRecomendados: Libro[] = [];
  fondoVisible = true;
  historial: RecoHistItem[] = [];
  loadingHist = false;
  clearing = false;
  nombre = 'Navegante';
  palabra = '';
  subpalabra = 'Encontremos un libro para tí';
  lastDesc = '';

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

  form = this.fb.group({
    descripcion: ['', [Validators.required, Validators.minLength(5)]],
  });

  options: AnimationOptions = {
    path: 'assets/404.json', 
    loop: true,
    autoplay: true
  };

  cargando: AnimationOptions = {
    path: 'assets/gatoCargando.json', 
    loop: true,
    autoplay: true
  };

  noHay: AnimationOptions = {
    path: 'assets/gatoEnojado.json', 
    loop: true,
    autoplay: true
  };

  registerOptions: AnimationOptions = {
    path: 'assets/registerPrompt.json',
    loop: true,
    autoplay: true
  };

  constructor(private fb: FormBuilder, private recoSrv: ApiService, 
    private localStorage: LocalstorageService
  ) {}

  ngOnInit(): void {
    
    this.ObtenerUsuario();
    this.cargarHistorial();
  }

  ObtenerUsuario() {
  const userData = this.localStorage.getItem('userData');
  if (userData) {
    this.user = JSON.parse(userData);
    this.nombre = this.user?.nombreUsr || 'Navegante';
  } else {
    this.nombre = 'Navegante';
  }

  this.palabra = 'Hola ' + this.nombre + ', ¿qué libro buscas?';
}
  submit() {
    this.errorMsg = '';
    this.resultados = [];
    this.fondoVisible = false;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const desc = this.form.value.descripcion!.trim();
    this.lastDesc = desc;
    this.form.get('descripcion')!.reset();

    this.loading = true;
    
    this.recoSrv.recomendar(desc).subscribe({
      next: data => {
        this.resultados = data;
        this.loading = false;
        this.cargarHistorial();
      },
      error: err => {
        this.loading = false;
        this.errorMsg = 'Error al obtener recomendaciones';
        console.error(err);
      }
    });
  }

  isInvalid(ctrl: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.invalid && c.touched);
  }

  cargarHistorial() {
    this.loadingHist = true;

    if (!this.user) {
      this.historial = [];
      this.loadingHist = false;
      return;
    }
    
    this.recoSrv.getHistorial().subscribe({
      next: h => {
        this.historial = h;
        this.loadingHist = false;
      },
      error: _ => { this.loadingHist = false; }
    });
  }

  limpiarHistorial() {
    this.clearing = true;
    this.recoSrv.deleteHistorial().subscribe({
      next: ok => {
        if (ok) this.historial = [];
        this.clearing = false;
      },
      error: _ => { this.clearing = false; }
    });
  }

  trackByIdx(i: number) { return i; }

  onOpenHistItem(item: RecoHistItem) {
  if (item.libros || item.loadingBooks) return; // ya cargado o cargando

  item.loadingBooks = true;
  this.recoSrv.getLibrosByIsbns(item.isbns).subscribe({
    next: books => {
      item.libros = books;
      item.loadingBooks = false;
    },
    error: _ => {
      item.loadingBooks = false;
    }
  });
}

}


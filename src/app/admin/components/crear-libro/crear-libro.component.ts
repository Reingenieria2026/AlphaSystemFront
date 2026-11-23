// crear-libro.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, SelectItem } from 'primeng/api';
import { ApiService } from '../../../services/laravel.service';
import { EstadoLibro, Genero, Libro } from '../../../../models/alphaSystem.models';
import { AnimationOptions } from 'ngx-lottie';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

const MAX_BYTES = 10_240 * 1024;

@Component({
  selector: 'app-crear-libro',
  templateUrl: './crear-libro.component.html',
  styleUrls: ['./crear-libro.component.scss'],
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
export class CrearLibroComponent implements OnInit {
  CrearActualizarFormulario!: FormGroup;
  ID: string | null = null;
  portadaLibro = '../../../../assets/book_icon.png';
  selectedFile: File | null = null;

  generos: SelectItem[] = [];
  estadosLibro: SelectItem[] = [];
  displayAddGeneroDialog = false;
  nuevoGeneroForm!: FormGroup;
  isLoading = false;

  // Lottie options
  spinner: AnimationOptions = {
    path: 'assets/spinner.json',
    loop: true,
    autoplay: true
  };
  magic: AnimationOptions = {
    path: 'assets/magic.json',
    loop: true,
    autoplay: true
  };

  // Para controlar la capa de loading
  loadingInfo = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private msg: MessageService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.ID = this.route.snapshot.paramMap.get('isbn');
    this.buildForm();
    this.loadCatalogos();

    if (this.ID) {
      this.isLoading = true;
      this.api.getLibro(this.ID).subscribe({
        next: res => {
          if (res.estatus === 1) {
            this.patchForm(res.data as Libro);
            this.CrearActualizarFormulario.get('isbn')?.disable();
          } else {
            this.msg.add({ severity: 'error', summary: 'Error', detail: res.mensaje || 'Libro no encontrado.' });
            this.router.navigate(['/admin/lista-libros']);
          }
          this.isLoading = false;
        },
        error: () => {
          this.msg.add({ severity: 'error', summary: 'Error de red', detail: 'No se pudo obtener el libro.' });
          this.isLoading = false; 
        }
      });
    }

    this.nuevoGeneroForm = this.fb.group({
      nombreGenero: ['', Validators.required]
    });
  }

  private buildForm(): void {
    const currentYear = new Date().getFullYear();
    this.CrearActualizarFormulario = this.fb.group({
      isbn: ['', [Validators.required, Validators.minLength(10)]],
      titulo: ['', Validators.required],
      autor: ['', Validators.required],
      editorial: ['', Validators.required],
      anioPubli: [null, [Validators.required, Validators.min(1000), Validators.max(currentYear)]],
      edicion: ['', Validators.maxLength(50)],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      idGenero: [null, Validators.required],
      idEstadoLibro: [null, Validators.required],
      fotoUsr: ['']
    });
    if (!this.ID) {
      this.CrearActualizarFormulario.patchValue({ idEstadoLibro: 1 });
    }
  }

  private loadCatalogos(): void {
    this.api.getGeneros().subscribe({
      next: res => {
        const data: Genero[] = res.data || res;
        this.generos = data.map(g => ({ label: g.nombreGenero, value: g.idGenero }));
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar géneros.' })
    });
    this.api.getEstadosLibro().subscribe({
      next: res => {
        const data: EstadoLibro[] = res.data || res;
        this.estadosLibro = data.map(e => ({ label: e.estadoLibro, value: e.idEstadoU }));
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar estados del libro.' })
    });
  }

  private patchForm(libro: Libro): void {
    this.CrearActualizarFormulario.patchValue(libro);
    if (libro.fotoUsr) {
      this.portadaLibro = this.api.urlImagenes + '/storage/' + libro.fotoUsr;
    }
  }

  isValid(field: string): boolean {
    const ctl = this.CrearActualizarFormulario.get(field);
    return !!(ctl?.invalid && ctl?.touched);
  }

  onFileSelect(event: any): void {
    for (let file of event.files) {
      if (file.size > MAX_BYTES) {
        this.msg.add({ severity: 'error', summary: 'Error de imagen', detail: `${file.name} supera ${Math.round(MAX_BYTES / 1024)} KB.` });
        return;
      }
    }
    const file = event.files[0];
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.portadaLibro = reader.result as string;
    reader.readAsDataURL(file);
    this.CrearActualizarFormulario.patchValue({ fotoUsr: file.name });
  }

  Guardar(): void {
    if (this.CrearActualizarFormulario.invalid) {
      this.CrearActualizarFormulario.markAllAsTouched();
      this.msg.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Verifica los campos marcados en rojo.' });
      return;
    }
    const formData = new FormData();
    if (this.ID) {
      formData.append('isbn', this.ID);
      formData.append('_method', 'PUT');
    }
    Object.entries(this.CrearActualizarFormulario.getRawValue()).forEach(([k, v]) => {
      if (k !== 'fotoUsr' && v != null) formData.append(k, v as any);
    });
    if (this.selectedFile) {
    formData.append('fotoUsr', this.selectedFile, this.selectedFile.name);

  // Si no hay archivo y estamos usando el ícono por defecto, mandamos un string vacío
  } else if (this.portadaLibro.endsWith('book_icon.png')) {
    // Esto fuerza al backend a eliminar/ignorar cualquier archivo previo.
    formData.append('fotoUsr', '');
  }
    const accion$ = this.ID ? this.api.updateLibro(this.ID, formData) : this.api.createLibro(formData);
    accion$.subscribe({
      next: res => {
        if (res.estatus === 1) {
          this.msg.add({ severity: 'success', summary: this.ID ? 'Actualizado' : 'Creado',
                         detail: `Libro ${this.ID ? 'actualizado' : 'registrado'} exitosamente.` });
          this.router.navigate(['/admin/lista-libros']);
        } else {
          const errores = typeof res.mensaje === 'object'
            ? Object.values(res.mensaje).flat().join(', ')
            : res.mensaje;
          this.msg.add({ severity: 'error', summary: 'Error', detail: errores });
        }
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error de red',
                                  detail: 'No se pudo completar la operación.' })
    });
  }

  Cancelar(): void {
    this.router.navigate(['/admin/lista-libros']);
  }

  openAddGenero(): void {
    this.nuevoGeneroForm.reset();
    this.displayAddGeneroDialog = true;
  }
  saveGenero(): void {
    if (this.nuevoGeneroForm.invalid) return;
    this.api.createGenero(this.nuevoGeneroForm.value).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Género agregado' });
        this.displayAddGeneroDialog = false;
        this.loadCatalogos();
      },
      error: err => {
        const errorMsg = err.error?.mensaje || 'Error al agregar género';
        this.msg.add({ severity: 'error', summary: 'Error', detail: errorMsg });
      }
    });
  }

  /** AUTOCOMPLETAR CON GOOGLE BOOKS **/
  autoFillBookInfo(): void {
    if (this.CrearActualizarFormulario.get('titulo')?.invalid ||
      this.CrearActualizarFormulario.get('autor')?.invalid) {
    this.msg.add({
      severity: 'warn',
      summary: 'Información incompleta',
      detail: 'Debe ingresar título y autor para buscar.'
    });
    return;
  }
    const { titulo, autor } = this.CrearActualizarFormulario.value;
    this.loadingInfo = true;

    this.api.getLibroCompleto(titulo, autor).subscribe({
      next: info => {
        this.loadingInfo = false;
        if (!info || info.error) {
          this.msg.add({ severity: 'error', summary: 'No encontrado', detail: 'No se encontró el libro.' });
          return;
        }
        const vol = info.volumeInfo;
      this.CrearActualizarFormulario.patchValue({
        isbn: vol.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier || '',
        editorial: vol.publisher || '',
        anioPubli: vol.publishedDate ? parseInt(vol.publishedDate.substr(0, 4), 10) : null,
        descripcion: vol.description || ''
      });

      // género
      if (vol.categories?.length) {
        const cat = vol.categories[0];
        const g = this.generos.find(g => g.label === cat);
        if (g) {
          this.CrearActualizarFormulario.patchValue({ idGenero: g.value });
        } else {
          this.msg.add({
            severity: 'warn',
            summary: 'Género no existe',
            detail: `Categoría "${cat}" no encontrada. Por favor crea el género.`
          });
        }
      }

  //     // portada
  //     if (vol.imageLinks?.thumbnail) {
  //       this.loadingInfo = true; // reutiliza la bandera o crea otra
  //       this.http
  // .get(vol.imageLinks.thumbnail, { responseType: 'blob' })
  // .subscribe({
  //   next: blob => {
  //     // convierte blob → File
  //     const ext = blob.type.split('/')[1] || 'jpg';
  //     const file = new File([blob], `cover.${ext}`, { type: blob.type });
  //     this.selectedFile = file;

  //     // preview + formulario
  //     this.portadaLibro = URL.createObjectURL(blob);
  //     this.CrearActualizarFormulario.patchValue({ fotoUsr: file.name });

  //     this.loadingInfo = false;
  //   },
  //   error: () => {
  //     // si falla la descarga deja solo la URL
  //     this.portadaLibro = vol.imageLinks.thumbnail!;
  //     this.loadingInfo = false;
  //   }
  // });
  //     }
      },
      error: () => {
        this.loadingInfo = false;
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Fallo al consultar Google Books.' });
      }
    });
  }



}

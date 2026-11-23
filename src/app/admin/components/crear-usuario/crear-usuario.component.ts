import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, SelectItem } from 'primeng/api';
import { ApiService } from '../../../services/laravel.service';
import {
  Ciudad,
  Estado,
  EstadoUsuario,
  Municipio,
  TipoUsuario,
  Usuario
} from '../../../../models/alphaSystem.models';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { AnimationOptions } from 'ngx-lottie';

const MAX_BYTES = 10_240 * 1024; // 10 MB

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.scss'],
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
export class CrearUsuarioComponent implements OnInit {

  CrearActualizarFormulario!: FormGroup;
  ID: number | null = null;
  showPassword = false;
  perfilUsuario = '../../../../assets/user_icon.png';
  selectedFile: File | null = null;
  removePhoto = false;
  defaultAvatar = '../../../../assets/user_icon.png';
  value!: string;
  isLoading = false;

  // Catálogos para dropdowns
  estadosGeo: SelectItem[]    = [];
  municipiosOpts: SelectItem[] = [];
  ciudadesOpts: SelectItem[]  = [];
  tiposUsuarios: SelectItem[] = [];
  estadosUsuario: SelectItem[] = [];

  spinner: AnimationOptions = {
      path: 'assets/spinner.json', 
      loop: true,
      autoplay: true
  };

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private msg: MessageService
  ) {}

  ngOnInit(): void {
    // Detectar si es edición
    const param = this.route.snapshot.paramMap.get('id');
    this.ID = param ? +param : null;

    this.buildForm();
    this.loadCatalogos();

    if (this.ID) {
      // Modo edición
      this.isLoading = true;
      this.api.getUsuario(this.ID).subscribe({
        next: res => {
          if (res.estatus === 1) {
            this.patchForm(res.data as Usuario);
            // en edición, contraseña ya no es requerida
            this.CrearActualizarFormulario.get('contrasena')!
              .clearValidators();
            this.CrearActualizarFormulario.get('contrasena')!
              .updateValueAndValidity();
          } else {
            this.msg.add({
              severity: 'error',
              summary: 'Error al cargar',
              detail: res.mensaje || 'Usuario no encontrado.'
            });
            this.router.navigate(['/admin/lista-usuarios']);
          }
          this.isLoading = false;
        },
        error: () => {
          this.msg.add({ severity: 'error', summary: 'Error de red', detail: 'No se pudo obtener el usuario.' });
          this.isLoading = false; 
        }
      });
      
      const ctrl = this.CrearActualizarFormulario.get('idEstadoUsr')!;
      ctrl.setValidators([Validators.required]);
      ctrl.updateValueAndValidity();
    } else {
      // Creación, contraseña sí requerida
      this.CrearActualizarFormulario.get('contrasena')!
        .setValidators([Validators.required, Validators.minLength(6)]);
      this.CrearActualizarFormulario.get('contrasena')!
        .updateValueAndValidity();
    }

    // Cuando cambia estado geográfico, recargar municipios
    this.CrearActualizarFormulario.get('idEstadoGeo')!
      .valueChanges.subscribe(idE => {
        this.CrearActualizarFormulario.patchValue({ idMunicipio: null, idCiudad: null });
        this.municipiosOpts = [];
        this.ciudadesOpts = [];
        if (idE != null) {
          this.api.getMunicipiosByEstado(idE).subscribe({
            next: ms => this.municipiosOpts = ms.map(m => ({
              label: m.nombreMunicipio,
              value: m.idMunicipio
            })),
            error: () => this.msg.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudieron cargar municipios.'
            })
          });
        }
      });
  }

  private buildForm(): void {
  this.CrearActualizarFormulario = this.fb.group({
    nombreUsr:   ['', Validators.required],
    apellidoP:   ['', Validators.required],
    apellidoM:   ['', Validators.required],
    telefonoUsr: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    correoUsr:   ['', [Validators.required, Validators.email]],
    contrasena:  [''],
    idEstadoGeo: [null, Validators.required],
    idMunicipio: [null, Validators.required],
    calle:       ['', Validators.required],
    colonia:     ['', Validators.required],
    idTipoUsr:   [null, Validators.required],
    idEstadoUsr: [null],
    fotoUsr:     ['']
  });
}

  private loadCatalogos(): void {
    this.api.getEstados().subscribe({
      next: res => {
        const data: Estado[] = res.data || res;
        this.estadosGeo = data.map(e => ({ label: e.nombreEstado, value: e.idEstado }));
      },
      error: () => this.msg.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar estados.'
      })
    });

    this.api.getTiposUsuario().subscribe({
      next: res => {
        const data: TipoUsuario[] = res.data || res;
        this.tiposUsuarios = data.map(t => ({ label: t.nombreTipo, value: t.idTipoUsr }));
      },
      error: () => this.msg.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar tipos de usuario.'
      })
    });

    this.api.getEstadosUsuario().subscribe({
      next: res => {
        const data: EstadoUsuario[] = res.data || res;
        this.estadosUsuario = data.map(e => ({ label: e.estadoUsr, value: e.idEstadoUsr }));
        if (!this.ID) {
          const activo = this.estadosUsuario.find(e => e.label === 'Activo');
          if (activo) {
            this.CrearActualizarFormulario.patchValue({ idEstadoUsr: activo.value });
          }
        }
      },
      error: () => this.msg.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar estados de usuario.'
      })
    });
  }

  private patchForm(u: Usuario): void {
    // Pre-cascada de ubicación
    this.api.getMunicipios().subscribe(all => {
      const mList: Municipio[] = all.data || all;
      const found = mList.find(m => m.idMunicipio === u.idCiudad);
      if (found) {
        this.CrearActualizarFormulario.patchValue({
          idEstadoGeo: found.idEstado,
          idMunicipio: found.idMunicipio
        });
        setTimeout(() => this.CrearActualizarFormulario.patchValue({
          idCiudad: u.idCiudad
        }), 200);
      }
    });

    this.perfilUsuario = u.fotoUsr || this.perfilUsuario;
    this.CrearActualizarFormulario.patchValue({
      nombreUsr:   u.nombreUsr,
      apellidoP:   u.apellidoP,
      apellidoM:   u.apellidoM,
      telefonoUsr: u.telefonoUsr,
      correoUsr:   u.correoUsr,
      calle:       u.calle,
      colonia:     u.colonia,
      idTipoUsr:   u.idTipoUsr,
      idEstadoUsr: u.idEstadoUsr,
      fotoUsr:     u.fotoUsr,
      contrasena:  ''
    });
    console.log(u.fotoUsr);
    if (u.fotoUsr ==null || u.fotoUsr === ''){ 
      this.perfilUsuario = '../../../../assets/user_icon.png';
    } else{
      this.perfilUsuario = this.api.urlImagenes + '/storage/' + u.fotoUsr;
    }
  }

  isValid(field: string): boolean {
    const ctl = this.CrearActualizarFormulario.get(field);
    return !!(ctl?.invalid && ctl?.touched);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onFileSelect(event: any): void {
    for (let file of event.files) {
      if (file.size > MAX_BYTES) {
        this.msg.add({
          severity: 'error',
          summary: 'Error de imagen',
          detail: `${file.name} supera ${Math.round(MAX_BYTES / 1024)} KB.`
        });
        return;
      }
    }
    const file = event.files[0];
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.perfilUsuario = reader.result as string;
    reader.readAsDataURL(file);
    this.CrearActualizarFormulario.patchValue({ fotoUsr: file.name });
  }

  Guardar(): void {
    if (this.CrearActualizarFormulario.invalid) {
      this.CrearActualizarFormulario.markAllAsTouched();
      this.msg.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Verifica los campos marcados en rojo.'
      });
      return;
    }

    const formData = new FormData();
    if (this.ID) {
      formData.append('id', this.ID.toString());
      formData.append('_method', 'PUT');
    }
    // ejemplo: forzar ciudad si tu backend lo requiere
    formData.append('idCiudad', '1');

    Object.entries(this.CrearActualizarFormulario.value).forEach(([k, v]) => {
      if (k !== 'fotoUsr' && v != null) {
        formData.append(k, v as any);
      }
    });

    // Si subí archivo nuevo, lo adjunto…
    if (this.selectedFile) {
      formData.append('fotoUsr', this.selectedFile, this.selectedFile.name);
    }

    //si hice clic en "Eliminar foto", aviso con un string vacío
    else if (this.removePhoto) {
      formData.append('fotoUsr', ' ');
    }

    const accion$ = this.ID
      ? this.api.updateUsuario(this.ID, formData)
      : this.api.createUsuario(formData);

    accion$.subscribe({
      next: res => {
        if (res.estatus === 1) {
          this.msg.add({
            severity: 'success',
            summary: this.ID ? 'Actualizado' : 'Creado',
            detail: `Usuario ${this.ID ? 'actualizado' : 'creado'} exitosamente.`
          });
          this.router.navigate(['/admin/lista-usuarios']);
        } else {
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: Array.isArray(res.mensaje)
              ? res.mensaje.join(', ')
              : res.mensaje
          });
          console.error(res.mensaje);
        }
      },
      error: () => this.msg.add({
        severity: 'error',
        summary: 'Error de red',
        detail: 'No se pudo completar la operación.'
      })
    });
  }

  Cancelar(): void {
    if (this.ID) {
      // Si estamos editando, volvemos a la lista
      this.router.navigate(['/admin/lista-usuarios']);
    } else {
      // Si es creación, sólo limpiamos el formulario
      this.CrearActualizarFormulario.reset();
      this.perfilUsuario = '../../../../assets/user_icon.png';
      this.selectedFile = null;
      this.router.navigate(['/admin/lista-usuarios']);
    }
  }

}

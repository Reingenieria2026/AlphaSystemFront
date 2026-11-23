// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MessageService } from 'primeng/api';
// import { ApiService } from '../../../services/laravel.service';
// import { ActivatedRoute, Router } from '@angular/router';

// @Component({
//   standalone: false,
//   selector: 'app-lista-prestamos-detalles',
//   templateUrl: './lista-prestamos-detalles.component.html',
//   styleUrls: ['./lista-prestamos-detalles.component.scss']
// })
// export class ListaPrestamosDetallesComponent implements OnInit {
//   formulario!: FormGroup;
//   modoEdicion = false;
//   prestamoId!: number;

//   libro: any = null;
//   usuario: any = null;
//   fechaPrestamo!: string;
//   fechaEntrega!: string;
//   devuelto = false;
//   multaRestante = 0;

//   constructor(
//     private fb: FormBuilder,
//     private api: ApiService,
//     private msg: MessageService,
//     private route: ActivatedRoute,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.formulario = this.fb.group({
//       isbn: ['', Validators.required],
//       correo: ['', [Validators.required, Validators.email]]
//     });

//     this.route.paramMap.subscribe(params => {
//       const id = params.get('id');
//       if (id) {
//         this.modoEdicion = true;
//         this.prestamoId = +id;
//         this.cargarPrestamo(this.prestamoId);
//       }
//     });
//   }

//   cargarPrestamo(id: number): void {
//     this.api.getPrestamo(id).subscribe({
//       next: res => {
//         if (res.estatus === 1) {
//           const p = res.data;
//           this.usuario = p.usuario;
//           this.libro = p.libro;
//           this.fechaPrestamo = p.fechaPrestamo;
//           this.fechaEntrega = p.fechaEntrega;
//           this.devuelto = !!p.devuelto;
//           this.multaRestante = Number(p.multa) || 0;
//         } else {
//           this.msg.add({ severity: 'warn', summary: 'No encontrado', detail: res.mensaje });
//           this.router.navigate(['/admin/lista-prestamos']);
//         }
//       },
//       error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el préstamo.' })
//     });
//   }

//  pagarMulta(): void {
//   if (!this.prestamoId) return;

//   this.api.pagarMulta(this.prestamoId).subscribe({
//     next: res => {
//       console.log('Respuesta pagarMulta:', res);
//       if (res.estatus === 1) {
//         this.msg.add({ severity: 'success', summary: 'Multa pagada', detail: res.mensaje });
//         this.cargarPrestamo(this.prestamoId); // <- Esto recarga los datos
//       } else {
//         this.msg.add({ severity: 'warn', summary: 'No se pagó', detail: res.mensaje });
//       }
//     },
//     error: err => {
//       this.msg.add({ severity: 'error', summary: 'Error', detail: err?.error?.mensaje || 'Error al pagar multa.' });
//     }
//   });
// }


//   regresarLibro(): void {
//     if (!this.prestamoId) return;

//     this.api.updatePrestamo({ id: this.prestamoId, devuelto: true }).subscribe({
//       next: res => {
//         if (res.estatus === 1) {
//           this.msg.add({ severity: 'success', summary: 'Libro devuelto', detail: res.mensaje });
//           this.devuelto = true;
//           this.multaRestante = 0;

//           if (this.usuario) {
//             this.usuario.totalPrestamos = Math.max(0, this.usuario.totalPrestamos - 1);

//             this.api.getPrestamos().subscribe({
//               next: pres => {
//                 const prestamos = pres.data || pres;
//                 const activos = prestamos.filter((p: any) => p.idUsuario === this.usuario.idUsr && !p.devuelto);
//                 this.usuario.totalDeuda = activos.reduce((acc: number, p: any) => acc + (p.multa || 0), 0);
//               },
//               error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la deuda.' })
//             });
//           }

//           this.cargarPrestamo(this.prestamoId);
//         } else {
//           this.msg.add({ severity: 'error', summary: 'Error', detail: res.mensaje || 'No se pudo devolver el libro.' });
//         }
//       },
//       error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar devolución.' })
//     });
//   }

//   buscarLibro(): void {
//     const isbn = this.formulario.value.isbn;
//     if (!isbn) return;
//     this.api.getLibro(isbn).subscribe({
//       next: res => {
//         if (res.estatus === 1) {
//           this.libro = res.data;
//           this.calcularFechaEntrega();
//         } else {
//           this.msg.add({ severity: 'warn', summary: 'No encontrado', detail: res.mensaje });
//           this.libro = null;
//         }
//       },
//       error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo buscar el libro.' })
//     });
//   }

//   buscarUsuario(): void {
//     const correo = this.formulario.value.correo;
//     if (!correo) return;
//     this.api.getUsuarioByCorreo(correo).subscribe({
//       next: res => {
//         if (res.estatus === 1 && res.data) {
//           this.usuario = res.data;
//         } else {
//           this.msg.add({ severity: 'warn', summary: 'No encontrado', detail: res.mensaje });
//           this.usuario = null;
//         }
//       },
//       error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo buscar el usuario.' })
//     });
//   }

//   calcularFechaEntrega(): void {
//     if (!this.libro) return;
//     const date = new Date();
//     date.setDate(date.getDate() + 30);
//     this.fechaEntrega = date.toISOString().split('T')[0];
//   }

//   realizarPrestamo(): void {
//     if (this.formulario.invalid || !this.libro || !this.usuario) {
//       this.msg.add({ severity: 'warn', summary: 'Faltan datos', detail: 'Verifica libro y usuario.' });
//       return;
//     }
//     const payload = {
//       idUsuario: this.usuario.idUsr,
//       idLibro: this.libro.isbn,
//       fechaPrestamo: new Date().toISOString().split('T')[0],
//       fechaEntrega: this.fechaEntrega
//     };
//     this.api.createPrestamo(payload).subscribe({
//       next: res => {
//         if (res.estatus === 1) {
//           this.msg.add({ severity: 'success', summary: 'Préstamo registrado', detail: 'El libro fue prestado correctamente.' });
//           this.formulario.reset();
//           this.libro = null;
//           this.usuario = null;
//           this.fechaEntrega = '';
//         } else {
//           this.msg.add({ severity: 'error', summary: 'Error', detail: res.mensaje });
//         }
//       },
//       error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar el préstamo.' })
//     });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/laravel.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { trigger, style, animate, transition } from '@angular/animations';
import { forkJoin } from 'rxjs';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  standalone: false,
  selector: 'app-lista-prestamos-detalles',
  templateUrl: './lista-prestamos-detalles.component.html',
  styleUrls: ['./lista-prestamos-detalles.component.scss'],
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('fadeSimple', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ListaPrestamosDetallesComponent implements OnInit {
  formulario!: FormGroup;
  modoEdicion = false;
  prestamoId!: number;

  libro: any = null;
  usuario: any = null;
  fechaPrestamo!: string;
  fechaEntrega!: string;
  devuelto = false;
  multaRestante = 0;

  mapGeneros = new Map<number, string>();
  mapTiposUsuario = new Map<number, string>();
  mapEstadosUsuario = new Map<number, string>();

  cargando = false;

  // Lottie
  spinner: AnimationOptions = {
    path: 'assets/spinner.json',
    loop: true,
    autoplay: true
  };

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private msg: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      isbn: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.modoEdicion = true;
        this.prestamoId = +id;
        this.cargarPrestamo(this.prestamoId);
      }
    });

    this.cargarCatalogos();

      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.modoEdicion = true;
          this.prestamoId = +id;
          this.cargarPrestamo(this.prestamoId);
        }
      });
  }

  private cargarCatalogos(): void {
  forkJoin({
    generos: this.api.getGeneros(),
    tipos: this.api.getTiposUsuario(),
    estados: this.api.getEstadosUsuario()
  }).subscribe({
    next: ({ generos, tipos, estados }) => {
      const g = generos?.data ?? generos ?? [];
      const t = tipos?.data ?? tipos ?? [];
      const e = estados?.data ?? estados ?? [];

      this.mapGeneros.clear();
      this.mapTiposUsuario.clear();
      this.mapEstadosUsuario.clear();

      g.forEach((x: any) => this.mapGeneros.set(Number(x.idGenero), x.nombreGenero));
      t.forEach((x: any) => this.mapTiposUsuario.set(Number(x.idTipoUsr), x.nombreTipo));
      e.forEach((x: any) => this.mapEstadosUsuario.set(Number(x.idEstadoUsr), x.estadoUsr));
    },
    error: () => {
      // opcional: toast suave, pero no bloquea la vista
      this.msg.add({ severity: 'warn', summary: 'Catálogos', detail: 'No se pudieron cargar algunos catálogos.' });
    }
  });
}


  cargarPrestamo(id: number): void {
    this.cargando = true;
    this.api.getPrestamo(id).subscribe({
      next: res => {
        if (res.estatus === 1) {
          const p = res.data;
          this.usuario = p.usuario;
          this.libro = p.libro;
          this.fechaPrestamo = p.fechaPrestamo;
          this.fechaEntrega = p.fechaEntrega;
          this.devuelto = !!p.devuelto;
          this.multaRestante = Number(p.multa) || 0;
        } else {
          this.msg.add({ severity: 'warn', summary: 'No encontrado', detail: res.mensaje });
          this.router.navigate(['/admin/lista-prestamos']);
        }
        this.cargando = false;
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el préstamo.' });
        this.cargando = false;
      }
    });
  }

  pagarMulta(): void {
    if (!this.prestamoId) return;
    this.cargando = true;

    this.api.pagarMulta(this.prestamoId).subscribe({
      next: res => {
        if (res.estatus === 1) {
          this.msg.add({ severity: 'success', summary: 'Multa pagada', detail: res.mensaje });
          this.cargarPrestamo(this.prestamoId);
        } else {
          this.msg.add({ severity: 'warn', summary: 'No se pagó', detail: res.mensaje });
          this.cargando = false;
        }
      },
      error: err => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: err?.error?.mensaje || 'Error al pagar multa.' });
        this.cargando = false;
      }
    });
  }

  regresarLibro(): void {
    if (!this.prestamoId) return;
    this.cargando = true;

    // Opción A (como ya usas en otros lados): PUT /prestamos { id, devuelto:true }
    this.api.updatePrestamo({ id: this.prestamoId, devuelto: true }).subscribe({
      next: res => {
        if (res.estatus === 1) {
          this.msg.add({ severity: 'success', summary: 'Libro devuelto', detail: res.mensaje });
          this.cargarPrestamo(this.prestamoId);
        } else {
          this.msg.add({ severity: 'error', summary: 'Error', detail: res.mensaje || 'No se pudo devolver el libro.' });
          this.cargando = false;
        }
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar devolución.' });
        this.cargando = false;
      }
    });
  }

  // Helpers UI
  get estadoLabel(): string {
    if (this.devuelto) return 'Entregado';
    return this.multaRestante > 0 ? 'Con deuda' : 'Pendiente';
  }

  get estadoSeverity(): TagSeverity {
    if (this.devuelto) return 'success';
    return this.multaRestante > 0 ? 'danger' : 'warn';
  }

  /** Fecha -> Date UTC para evitar desfases por zona horaria */
private toUTCDate(ymd?: string): Date | null {
  if (!ymd) return null;
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

/** Diferencia en días desde HOY (UTC) hasta la fecha de entrega.
 * > 0 = faltan días, 0 = vence hoy, < 0 = atraso (valor negativo)
 */
get diasDiffEntrega(): number {
  const entrega = this.toUTCDate(this.fechaEntrega);
  if (!entrega) return 0;
  const now = new Date();
  const hoyUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const ms = entrega.getTime() - hoyUTC.getTime();
  return Math.floor(ms / 86_400_000);
}

/** Texto para el chip de tiempo */
get diasChipLabel(): string {
  if (this.devuelto) return 'Entregado';
  const diff = this.diasDiffEntrega;
  if (diff < 0)  return `${Math.abs(diff)} día(s) de retraso`;
  if (diff === 0) return 'Vence hoy';
  return `Faltan ${diff} día(s)`;
}

  /** Severidad visual del chip según el caso */
  get diasChipSeverity(): TagSeverity {
    if (this.devuelto) return 'success';
    const diff = this.diasDiffEntrega;
    if (diff < 0)  return 'danger';
    if (diff === 0) return 'warn'; // antes 'warning'
    return 'info';
  }

  get libroGeneroLabel(): string {
    return (this.libro?.genero?.nombreGenero)
      ?? this.mapGeneros.get(Number(this.libro?.idGenero)) 
      ?? '—';
  }
  get usuarioTipoLabel(): string {
    return this.mapTiposUsuario.get(Number(this.usuario?.idTipoUsr)) ?? '—';
  }
  get usuarioEstadoLabel(): string {
    return this.mapEstadosUsuario.get(Number(this.usuario?.idEstadoUsr)) ?? '—';
  }

  photoUrl(path?: string): string {
    return path ? `${this.api.urlImagenes}/storage/${path}` : '';
  }

  initials(label?: string): string {
    if (!label) return '?';
    const parts = label.trim().split(/\s+/);
    return (parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '');
  }

  goBack(): void {
    if (history.length > 1) history.back();
    else this.router.navigate(['/admin/lista-prestamos']); // ajusta a tu ruta de listado
  }
}

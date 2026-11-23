// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MessageService } from 'primeng/api';
// import { ApiService } from '../../../services/laravel.service';
// import {
//   trigger,
//   state,
//   style,
//   animate,
//   transition
// } from '@angular/animations';
// import { Router } from '@angular/router';
// import { AnimationOptions } from 'ngx-lottie';

// @Component({
//   selector: 'detalles-prestamo',
//   standalone: false,
//   templateUrl: './prestamo.component.html',
//   styleUrl: './prestamo.component.scss',
//   animations: [
//     trigger('fadeUp', [
//       transition(':enter', [
//         style({ opacity: 0, transform: 'translateY(-20px)' }),
//         animate('500ms ease-out',
//           style({ opacity: 1, transform: 'translateY(0)' })
//         )
//       ]),
//       transition(':leave', [
//         animate('500ms ease-in',
//           style({ opacity: 0, transform: 'translateY(-20px)' })
//         )
//       ])
//     ]),
//     trigger('fadeSimple', [
//       transition(':enter', [
//         style({ opacity: 0 }),
//         animate('400ms ease-in',
//           style({ opacity: 1 })
//         )
//       ]),
//       transition(':leave', [
//         animate('400ms ease-out',
//           style({ opacity: 0 })
//         )
//       ])
//     ])
//   ]
// })
// export class PrestamoComponent implements OnInit {
//   formulario!: FormGroup;
//   libro: any = null;
//   usuario: any = null;
//   fechaEntrega: string | null = null;
//   bookOptions: { isbn: string, titulo: string }[] = [];
//   userOptions: { label: string, value: number }[] = [];
//   loading = true;

//   // Lottie spinner
//   spinner: AnimationOptions = {
//     path: 'assets/spinner.json',
//     loop: true,
//     autoplay: true
//   };

//   constructor(
//     private fb: FormBuilder,
//     private api: ApiService,
//     private msg: MessageService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.formulario = this.fb.group({
//       idLibro:  [ null, Validators.required ],
//       idUsuario:[ null, Validators.required ]
//     });

//     const correoTemp = localStorage.getItem('correoUsuarioTemporal');
//     if (correoTemp) {
//       this.formulario.patchValue({ correo: correoTemp });
//       this.buscarUsuario();
//       localStorage.removeItem('correoUsuarioTemporal');
//     }

//     this.api.getBookTitles().subscribe(res => {
//       console.log('Libros obtenidos:', res);
      
//       const data = res.data;
//       this.bookOptions = data;
//     });

//     this.api.getUserNames().subscribe(res => {
//       console.log('Usuarios obtenidos:', res);
//       const data = res.data;
//       this.userOptions = data.map((u: any) => ({
//         label: `${u.nombreUsr} ${u.apellidoP}`,
//         value: u.idUsr
//       }));
//     });
//   }

//   isValid(field: string): boolean {
//     const control = this.formulario.get(field);
//     return !!(control && control.invalid && (control.dirty || control.touched));
//   }

//   buscarLibro(): void {
//     const isbnValue = this.formulario.get('isbn')?.value?.trim();
//     this.libro = null;

//     if (!isbnValue) {
//       this.msg.add({ severity: 'warn', summary: 'Campo obligatorio', detail: 'Debes ingresar un ISBN o nombre.' });
//       return;
//     }

//     this.api.getLibros().subscribe({
//       next: res => {
//         const libros = res.data || res;
//         const encontrado = libros.find((l: any) =>
//           l.isbn === isbnValue || l.titulo?.toLowerCase().includes(isbnValue.toLowerCase())
//         );

//         if (!encontrado) {
//           this.msg.add({ severity: 'warn', summary: 'No encontrado', detail: 'Libro no registrado.' });
//           return;
//         }

//         if (encontrado.cantidad <= 0) {
//           this.msg.add({
//             severity: 'warn',
//             summary: 'Sin ejemplares disponibles',
//             detail: 'Este libro no tiene copias disponibles para préstamo.'
//           });
//           return;
//         }

//         this.libro = encontrado;
//         if (this.usuario) this.calcularFechaEntrega();
//       },
//       error: () => {
//         this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo buscar el libro.' });
//       }
//     });
//   }

//   buscarUsuario(): void {
//     const correoValue = this.formulario.get('correo')?.value?.trim();
//     this.usuario = null;

//     if (!correoValue) {
//       this.msg.add({ severity: 'warn', summary: 'Campo obligatorio', detail: 'Debes ingresar un correo o nombre.' });
//       return;
//     }

//     this.api.getUsuarios().subscribe({
//       next: res => {
//         const usuarios = res.data || res;
//         const encontrado = usuarios.find((u: any) =>
//           u.correoUsr === correoValue || `${u.nombreUsr} ${u.apellidoP}`.toLowerCase().includes(correoValue.toLowerCase())
//         );

//         if (!encontrado) {
//           this.msg.add({ severity: 'warn', summary: 'No encontrado', detail: 'Usuario no registrado.' });
//           return;
//         }

//         this.usuario = {
//           ...encontrado,
//           totalPrestamos: 0,
//           totalDeuda: 0
//         };

//         this.api.getPrestamos().subscribe({
//           next: pres => {
//             const prestamos = pres.data || pres;
//             const activos = prestamos.filter((p: any) =>
//               p.idUsuario === this.usuario.idUsr && !p.devuelto
//             );

//             this.usuario.totalPrestamos = activos.length;
//             this.usuario.totalDeuda = activos.reduce((acc: number, p: any) => acc + (p.multa || 0), 0);

//             if (this.libro) this.calcularFechaEntrega();
//           },
//           error: () => {
//             this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron obtener los préstamos.' });
//           }
//         });
//       },
//       error: () => {
//         this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo buscar el usuario.' });
//       }
//     });
//   }

//   private calcularFechaEntrega(): void {
//     const hoy = new Date();
//     const entrega = new Date(hoy);
//     entrega.setDate(entrega.getDate() + 30);
//     this.fechaEntrega = entrega.toISOString().split('T')[0];
//   }

//  realizarPrestamo(): void {
//     if (!this.libro || !this.usuario || !this.fechaEntrega) {
//       this.msg.add({ severity:'warn', summary:'Datos incompletos', detail:'Selecciona libro y usuario primero.' });
//       return;
//     }
//     if (this.usuario.totalDeuda > 0) {
//       this.msg.add({ severity:'error', summary:'Bloqueado', detail:`Multa activa $${this.usuario.totalDeuda}` });
//       return;
//     }
//     if (this.usuario.totalPrestamos >= 3) {
//       this.msg.add({ severity:'warn', summary:'Límite', detail:'Ya tiene 3 préstamos activos.' });
//       return;
//     }
    
//     const data = {
//       idUsuario:      this.usuario.idUsr,
//       idLibro:        this.libro.isbn,
//       fechaPrestamo:  new Date().toISOString().split('T')[0],
//       fechaEntrega:   this.fechaEntrega
//     };

//     /*const data = {
//       idUsuario:      this.usuario.idUsr,
//       idLibro:        this.libro.isbn,
//       fechaPrestamo:  "2025-05-01",
//       fechaEntrega:   "2025-05-15"
//     };*/

//     console.log('>>> Datos a enviar al crear préstamo:', data);
//   // ② (Opcional) Mensaje en pantalla con PrimeNG:
//   /*this.msg.add({
//     severity: 'info',
//     summary: 'DEBUG',
//     detail: JSON.stringify(data)
//   });*/

//     this.api.createPrestamo(data).subscribe({
//       next: res => {
//         if (res.estatus===1) {
//           this.msg.add({ severity:'success', summary:'Registro OK', detail:'Préstamo creado.' });
//           // reiniciar
//           this.formulario.reset();
//           this.libro = null;
//           this.usuario = null;
//           this.fechaEntrega = null;
//         } else {
//           console.error('Error al crear préstamo:', res);
//           this.msg.add({ severity:'error', summary:'Error', detail: res.mensaje||'No se pudo crear el préstamo.' });
//         }
//       },
//       error: err => {
//     console.error('Error HTTP al crear préstamo:', err);
//     if (err.status === 422 && err.error && err.error.errors) {
//       // ① Afirmamos el tipo correcto
//       const validationErrors = err.error.errors as Record<string, string[]>;

//       const messages = Object.values(validationErrors)
//         .flat()
//         .join(' ');

//       this.msg.add({
//         severity: 'error',
//         summary: 'Errores de validación',
//         detail: messages
//       });
//       console.log('Detalles de validación:', validationErrors);
//     } else {
//       this.msg.add({
//         severity: 'error',
//         summary: 'Error inesperado',
//         detail: 'Ocurrió un error al crear el préstamo.'
//       });
//     }
//   }
//     });
//   }

//   onBookSelect(): void {
//     const isbn = this.formulario.value.idLibro;
//     this.libro = null;
//     if (isbn) {
//       this.api.getLibro(isbn).subscribe(res => {
//         this.libro = res.data || res;
//         if (this.usuario) this.calcularFechaEntrega();
//       });
//     }
//   }

//   onUserSelect(): void {
//     const id = this.formulario.value.idUsuario;
//     this.usuario = null;
//     if (id) {
//       this.api.getUsuario(id).subscribe(res => {
//         this.usuario = { ...(res.data || res), totalPrestamos: 0, totalDeuda: 0 };
//         this.api.getPrestamos().subscribe(pres => {
//           const prestamos = pres.data || pres;
//           const activos = prestamos.filter((p: any) => p.idUsuario === id && !p.devuelto);
//           this.usuario.totalPrestamos = activos.length;
//           this.usuario.totalDeuda     = activos.reduce((a: number, p: any) => a + (p.multa||0), 0);
//           if (this.libro) this.calcularFechaEntrega();
//         });
//       });
//     }
//   }

// }



import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/laravel.service';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { trigger, style, animate, transition } from '@angular/animations';

interface BookOption { isbn: string; titulo: string; }
interface UserOption { label: string; value: number; fotoUsr?: string | null; }

@Component({
  selector: 'app-prestamo',
  standalone: false,
  templateUrl: './prestamo.component.html',
  styleUrl: './prestamo.component.scss',
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-12px)' }),
        animate('320ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeSimple', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('220ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class PrestamoComponent implements OnInit {
  formulario!: FormGroup;
  libro: any = null;
  usuario: any = null;
  fechaEntrega: string | null = null;

  bookOptions: BookOption[] = [];
  userOptions: UserOption[] = []; 
  selectedRow: any | null = null;
  loading = true;

  spinner: AnimationOptions = { path: 'assets/spinner.json', loop: true, autoplay: true };

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private msg: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      idLibro:   [ null, Validators.required ],
      idUsuario: [ null, Validators.required ]
    });

    // Libros
    this.api.getBookTitles().subscribe({
      next: res => {
        const data = res.data ?? [];
        this.bookOptions = data as BookOption[];
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar libros.' })
    });

    // Usuarios (con label/value; si luego tu endpoint manda fotoUrl, se verá en la lista)
    this.api.getUserNames().subscribe({
      next: res => {
        const data = res.data ?? [];
        this.userOptions = data.map((u: any) => ({
          label: `${u.nombreUsr} ${u.apellidoP}`,
          value: u.idUsr,
          fotoUsr: u.fotoUsr || null  
        }));
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar usuarios.' })
    });
  }

  get puedePrestar(): boolean {
    if (!this.libro || !this.usuario || !this.fechaEntrega) return false;
    if ((this.usuario?.totalDeuda || 0) > 0) return false;
    if ((this.usuario?.totalPrestamos || 0) >= 3) return false;
    return true;
  }

  isValid(field: string): boolean {
    const c = this.formulario.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  private calcularFechaEntrega(): void {
    const hoy = new Date();
    const entrega = new Date(hoy);
    entrega.setDate(entrega.getDate() + 30);
    this.fechaEntrega = entrega.toISOString().split('T')[0];
  }

  onBookSelect(): void {
    const isbn = this.formulario.value.idLibro;
    this.libro = null;
    if (isbn) {
      this.api.getLibro(isbn).subscribe({
        next: res => {
          this.libro = res.data || res;
          if (this.usuario) this.calcularFechaEntrega();
        },
        error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el libro.' })
      });
    }
  }

  onUserSelect(): void {
    const id = this.formulario.value.idUsuario;
    this.usuario = null;
    if (id) {
      this.api.getUsuario(id).subscribe({
        next: res => {
          const u = res.data || res;
          this.usuario = { ...u, totalPrestamos: 0, totalDeuda: 0 };

          // Calcula activos/deuda
          this.api.getPrestamos().subscribe({
            next: pres => {
              const prestamos = pres.data || pres;
              const activos = prestamos.filter((p: any) => p.idUsuario === id && !p.devuelto);
              this.usuario.totalPrestamos = activos.length;
              this.usuario.totalDeuda     = activos.reduce((a: number, p: any) => a + (p.multa || 0), 0);
              if (this.libro) this.calcularFechaEntrega();

              // Si no venía foto en el dropdown, úsala aquí para selectedItem
              const opt = this.userOptions.find(o => o.value === id);
              if (opt && !opt.fotoUsr && u?.fotoUsr) opt.fotoUsr = u.fotoUsr;
            },
            error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron obtener préstamos.' })
          });
        },
        error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el usuario.' })
      });
    }
    
  }

  photoUrl(path?: string): string {
    return path ? `${this.api.urlImagenes}/storage/${path}` : '';
  }

  realizarPrestamo(): void {
    if (!this.puedePrestar) return;

    // const data = {
    //   idUsuario:     this.usuario.idUsr,
    //   idLibro:       this.libro.isbn,
    //   fechaPrestamo: new Date().toISOString().split('T')[0],
    //   fechaEntrega:  this.fechaEntrega
    // };

    const data = {
      idUsuario:      this.usuario.idUsr,
      idLibro:        this.libro.isbn,
      fechaPrestamo:  "2025-05-01",
      fechaEntrega:   "2025-05-15"
    };

    this.api.createPrestamo(data).subscribe({
      next: res => {
        if (res.estatus === 1) {
          this.msg.add({ severity: 'success', summary: 'Registro OK', detail: 'Préstamo creado.' });
          this.formulario.reset();
          this.libro = null; this.usuario = null; this.fechaEntrega = null;
        } else {
          this.msg.add({ severity: 'error', summary: 'Error', detail: res.mensaje || 'No se pudo crear el préstamo.' });
        }
      },
      error: err => {
        if (err.status === 422 && err.error?.errors) {
          const messages = Object.values(err.error.errors as Record<string,string[]>).flat().join(' ');
          this.msg.add({ severity: 'error', summary: 'Errores de validación', detail: messages });
        } else {
          this.msg.add({ severity: 'error', summary: 'Error inesperado', detail: 'Ocurrió un error al crear el préstamo.' });
        }
      }
    });
  }

  // ---- Avatares en dropdown (iniciales/colores) ----
  initials(label?: string): string {
    if (!label) return '?';
    const parts = label.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last  = parts[1]?.[0] ?? '';
    return (first + last).toUpperCase();
  }
  avatarColor(seed: number): string {
    // colorcito estable por ID
    const hue = (seed * 47) % 360;
    return `hsl(${hue}, 55%, 85%)`;
  }

  goBack(): void {
  if (history.length > 1) {
    history.back();
  } else {
    this.router.navigate(['/admin/app-prestamos']); 
  }
}
}

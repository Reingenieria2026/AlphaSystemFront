import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpLaravelService } from '../../services/http.service';
import { isPlatformBrowser } from '@angular/common';
import { LocalstorageService } from '../../../localstorage.service';
import { MessageService } from 'primeng/api';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  formulario: FormGroup;
  mostrarContrasena = false;
  isLoading = false;
  visibleProblemas = false;

  visibleRegistro = false; 
  visibleTerminos = false;
visiblePrivacidad = false;


  showProblemas() {
    this.visibleProblemas = true;
  }

  showRegistro() {
    this.visibleRegistro = true;
  }

  options: AnimationOptions = {
    path: 'assets/cargar.json',
    loop: true,
    autoplay: true
  };

  constructor(
    private fb: FormBuilder,
    private api: HttpLaravelService,
    private localStorage: LocalstorageService,
    private router: Router,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
    this.formulario = this.fb.group({
      correoUsr: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]]
    });
  }

  // Método que se llama al enviar el formulario
  Guardar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const loginData = this.formulario.value;

    this.isLoading = true;

    // Llamada al servicio de login
    this.api.login(loginData).subscribe({
      next: (res: any) => {
        console.log('Respuesta del login:', res);
        this.isLoading = false;
        if (res.token && res.usuario) {
          this.localStorage.setItem('accessToken', res.token);
          this.localStorage.setItem('userData', JSON.stringify(res.usuario));
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/login']);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: res.message || 'Credenciales incorrectas',
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.router.navigate(['/login']);

        // Extrae info común
        const status = err?.status;
        const apiMsg = err?.error?.message;
        const intentos = err?.error?.intentos_restantes;
        const bloqueado = err?.error?.bloqueado === true;

        // 403: Prohibido (usamos el mensaje del backend para distinguir)
        if (status === 403) {
          // Caso: cuenta bloqueada por 10 intentos
          if (apiMsg?.toLowerCase().includes('bloqueada')) {
            this.messageService.add({
              severity: 'error',
              summary: 'Cuenta bloqueada',
              detail: 'Has alcanzado el límite de intentos. Acude con el bibliotecario para reactivar tu acceso.',
              life: 7000
            });
            return;
          }

          // Caso: usuario desactivado (estado ≠ 1)
          if (apiMsg?.toLowerCase().includes('usuario desactivado')) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Usuario desactivado',
              detail: 'Tu cuenta está desactivada. Visita tu biblioteca para reactivar el acceso.',
              life: 7000
            });
            return;
          }

          // 403 genérico
          this.messageService.add({
            severity: 'error',
            summary: 'Acceso restringido',
            detail: apiMsg || 'No tienes permisos para iniciar sesión.',
            life: 6000
          });
          return;
        }

        // 401: Credenciales inválidas (mostrar intentos restantes si vienen)
        if (status === 401) {
          // Si el backend ya marcó bloqueado en el mismo request
          if (bloqueado) {
            this.messageService.add({
              severity: 'error',
              summary: 'Cuenta bloqueada',
              detail: 'Has superado el número de intentos. Solicita reactivación con el bibliotecario.',
              life: 7000
            });
            return;
          }

          // Mostrar contador de intentos restantes (si viene en la respuesta)
          if (typeof intentos === 'number') {
            this.messageService.add({
              severity: 'error',
              summary: 'Credenciales inválidas',
              detail: `Contraseña incorrecta. Intentos restantes: ${intentos}`,
              life: 6000
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Credenciales inválidas',
              detail: apiMsg || 'Correo o contraseña incorrectos.',
              life: 6000
            });
          }
          return;
        }

        // Otros errores (red, server, etc.)
        this.messageService.add({
          severity: 'error',
          summary: 'Error inesperado',
          detail: apiMsg || err?.message || 'Ocurrió un problema al iniciar sesión.',
          life: 6000
        });
      }

    });
  }

  isValid(field: string): null | boolean {
    return this.formulario.controls[field].errors && this.formulario.controls[field].touched;
  }

  // Getter para acceder más fácilmente a los controles en la plantilla
  get f() {
    return this.formulario.controls;
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const cardElement = document.getElementById('este');
      setTimeout(() => {
        cardElement?.classList.add('show');
      }, 100);
    }
  }

  ngOnInit(): void {
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  showTerminos() {
  this.visibleTerminos = true;
}
showPrivacidad() {
  this.visiblePrivacidad = true;
}
}

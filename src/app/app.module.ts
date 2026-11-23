import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AuthInterceptor } from './auth.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginModule } from './acceso/login.module';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PrincipalModule } from './principal/principal.module';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { AdminModule } from './admin/admin.module';
import { NavbarUsuarioComponent } from './usuario/components/navbar-usuario/navbar-usuario.component';
import { PerfilUsuarioComponent } from './usuario/components/perfil-usuario/perfil-usuario.component';
//import { PrestamosComponent } from './usuario/components/prestamos/prestamos.component';
import { ListaLibrosComponent } from './usuario/components/lista-libros/lista-libros.component';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Importa el componente standalone y el provider
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { UsuarioModule } from './usuario/usuario.module';

// Esta función le dice a ngx-lottie qué player usar
export function playerFactory() {
  return player;
}


@NgModule({
  declarations: [
    AppComponent,
    //NavbarUsuarioComponent,
    //PerfilUsuarioComponent,
    //PrestamosComponent,
    //ListaLibrosComponent
  ],
  imports: [
    LottieComponent,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LoginModule,
    PrincipalModule,
    AdminModule,
    UsuarioModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(
    withFetch(),
    withInterceptors([errorInterceptor])
  ),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    MessageService,
    ConfirmationService,
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
          preset: Aura,
          options: {
      darkModeSelector: false  // o 'none'
    }
      },
  }),
  provideLottieOptions({ player: playerFactory })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 

  
}

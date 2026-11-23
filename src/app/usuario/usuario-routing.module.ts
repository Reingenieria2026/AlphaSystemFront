import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NavbarUsuarioComponent } from './components/navbar-usuario/navbar-usuario.component';
import { PerfilUsuarioComponent } from './components/perfil-usuario/perfil-usuario.component';
import { PrestamosComponent } from './components/prestamos/prestamos.component';
import { ListaLibrosComponent } from './components/lista-libros/lista-libros.component';

const routes: Routes = [
  {
    path: '',
    component: NavbarUsuarioComponent,
    children: [
      {
        path: 'perfil',
        component: PerfilUsuarioComponent
      },
      {
        path: 'prestamos',
        component: PrestamosComponent
      },
      {
        path: 'libros',
        component: ListaLibrosComponent
      },
      {
        path: '**',
        redirectTo: 'perfil'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }

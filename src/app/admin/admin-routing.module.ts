import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import path from 'path';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CrearUsuarioComponent } from './components/crear-usuario/crear-usuario.component';
import { ListaUsuariosComponent } from './components/lista-usuarios/lista-usuarios.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { FutureComponent } from './components/future/future.component';
import { CrearLibroComponent } from './components/crear-libro/crear-libro.component';
import { ListaLibrosComponent } from './components/lista-libros/lista-libros.component';
import { PrestamoComponent } from './components/prestamo/prestamo.component';
import { ListaPrestamosComponent } from './components/lista-prestamos/lista-prestamos.component';
import { ListaPrestamosDetallesComponent } from './components/lista-prestamos-detalles/lista-prestamos-detalles.component';
import { InicioAdminComponent } from './components/inicio-admin/inicio-admin.component';


const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    children: [
      {
        path: 'crear-usuario',
        component: CrearUsuarioComponent
      },
      {
        path: 'lista-usuarios',
        component: ListaUsuariosComponent
      },
      {
        path: 'perfil/:id',
        component: CrearUsuarioComponent
      },
      {
        path: 'commingsoon',
        component: FutureComponent
      },
      {
        path: 'app-crear-libro',
        component: CrearLibroComponent
      },
      {
        path: 'libro/:isbn',
        component: CrearLibroComponent
      },
      {
        path: 'lista-libros',
        component: ListaLibrosComponent
      },
        {
        path: 'crear-prestamo',
        component: PrestamoComponent
      },
        {
        path: 'detalles-prestamo/:id',
        component: ListaPrestamosDetallesComponent
      },
      {
        path: 'lista-prestamos',
        component: ListaPrestamosComponent
      },
      {
        path: 'inicio',
        component: InicioAdminComponent
      },
      {
        path: '**',
        redirectTo: 'inicio'
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
export class AdminRoutingModule { }
